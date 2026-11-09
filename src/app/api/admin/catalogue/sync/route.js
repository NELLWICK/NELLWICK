import { timingSafeEqual } from "node:crypto";

function sameSecret(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}

function getConfig() {
  const supabaseUrl = String(process.env.SUPABASE_URL || "").trim().replace(/\/$/, "");
  const supabaseKey = String(
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  ).trim();
  const syncToken = String(process.env.NELLWICK_SHEETS_SYNC_TOKEN || "").trim();
  return { supabaseUrl, supabaseKey, syncToken };
}

function authorize(request, syncToken) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  return sameSecret(token, syncToken);
}

function jsonError(message, status = 400) {
  return Response.json({ ok: false, error: message }, { status });
}

function positiveMoney(value, label) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`${label} must be a positive number.`);
  }
  if (Math.abs(amount * 100 - Math.round(amount * 100)) > 1e-8) {
    throw new Error(`${label} must use no more than two decimal places.`);
  }
  return Math.round(amount * 100) / 100;
}

function httpsUrl(value, label) {
  if (value == null || value === "") return null;
  if (typeof value !== "string") throw new Error(`${label} must be an HTTPS URL.`);
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid HTTPS URL.`);
  }
  if (url.protocol !== "https:") throw new Error(`${label} must use HTTPS.`);
  return url.toString();
}

function normalizeBundle(body) {
  const product = body?.product;
  const variants = body?.variants;
  const supplierMappings = body?.supplierMappings;

  if (!product || typeof product !== "object") throw new Error("A product object is required.");
  if (!Array.isArray(variants) || !Array.isArray(supplierMappings)) {
    throw new Error("variants and supplierMappings must be arrays.");
  }

  const productId = String(product.product_id || "").trim();
  const slug = String(product.slug || "").trim();
  const name = String(product.name || "").trim();
  const category = String(product.category || "").trim();
  if (!productId || !name || !category || !slug) {
    throw new Error("product_id, slug, name and category are required.");
  }
  if (!/^[A-Za-z0-9_-]{3,80}$/.test(productId)) throw new Error("product_id contains unsupported characters.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("slug must be lowercase letters, numbers and hyphens.");
  if (!["draft", "active", "archived"].includes(product.status)) throw new Error("Product status must be draft, active or archived.");

  const isPublished = product.status === "active";
  if (Boolean(product.is_published) !== isPublished) {
    throw new Error("is_published must be true only when status is active.");
  }

  const safeProduct = {
    product_id: productId,
    slug,
    name,
    category,
    description: String(product.description || ""),
    short_name: String(product.short_name || name),
    short_description: String(product.short_description || ""),
    base_price_usd: positiveMoney(product.base_price_usd, "Product price"),
    status: product.status,
    is_published: isPublished,
    is_hero: Boolean(product.is_hero),
    images: (Array.isArray(product.images) ? product.images : []).map((url, index) => httpsUrl(url, `Product image ${index + 1}`)).filter(Boolean),
    highlights: Array.isArray(product.highlights) ? product.highlights.map(String).filter(Boolean) : [],
    feature_cards: Array.isArray(product.feature_cards) ? product.feature_cards : [],
    detail_sections: Array.isArray(product.detail_sections) ? product.detail_sections : [],
    how_to_use: String(product.how_to_use || ""),
    care_instructions: String(product.care_instructions || ""),
    what_is_included: Array.isArray(product.what_is_included) ? product.what_is_included : [],
    specifications: Array.isArray(product.specifications) ? product.specifications : [],
    product_faqs: Array.isArray(product.product_faqs) ? product.product_faqs : [],
    video_url: httpsUrl(product.video_url, "Product video"),
    video_type: ["mp4", "youtube", "vimeo"].includes(product.video_type) ? product.video_type : "mp4",
    video_poster_url: httpsUrl(product.video_poster_url, "Product video poster"),
    image_alt: String(product.image_alt || name),
    shipping_note: String(product.shipping_note || ""),
    returns_note: String(product.returns_note || ""),
    seo_title: String(product.seo_title || ""),
    seo_description: String(product.seo_description || ""),
    related_product_slugs: Array.isArray(product.related_product_slugs) ? product.related_product_slugs : [],
    updated_at: new Date().toISOString(),
  };

  const seenSkus = new Set();
  const safeVariants = variants.map((variant, index) => {
    const sku = String(variant?.sku || "").trim();
    if (!sku) throw new Error(`Variant ${index + 1} is missing its store SKU.`);
    if (seenSkus.has(sku)) throw new Error(`Duplicate variant SKU: ${sku}.`);
    seenSkus.add(sku);
    if (variant.product_id !== productId) throw new Error(`Variant ${sku} is linked to a different product_id.`);
    const videoType = ["mp4", "youtube", "vimeo"].includes(variant.video_type) ? variant.video_type : "mp4";
    const images = (Array.isArray(variant.images) ? variant.images : []).map((url, imageIndex) => httpsUrl(url, `${sku} image ${imageIndex + 1}`)).filter(Boolean);
    const active = Boolean(variant.is_active);
    const available = Boolean(variant.is_available);
    return {
      sku,
      product_id: productId,
      variant_name: String(variant.variant_name || variant.option_value || sku),
      option_name: String(variant.option_name || "Option"),
      option_value: String(variant.option_value || variant.variant_name || "Standard"),
      price_usd: positiveMoney(variant.price_usd, `${sku} price`),
      is_active: active,
      is_available: available,
      display_order: Number.isFinite(Number(variant.display_order)) ? Number(variant.display_order) : index + 1,
      color_hex: /^#[0-9a-fA-F]{6}$/.test(String(variant.color_hex || "")) ? variant.color_hex : "#779B88",
      image_url: httpsUrl(variant.image_url, `${sku} primary image`),
      images,
      image_alt: String(variant.image_alt || `${name} — ${variant.option_value || variant.variant_name || "variant"}`),
      video_url: httpsUrl(variant.video_url, `${sku} video`),
      video_type: videoType,
    };
  });

  const availableSkus = new Set(safeVariants.filter(v => v.is_active && v.is_available).map(v => v.sku));
  if (isPublished && availableSkus.size === 0) {
    throw new Error("A published product needs at least one active and available variant.");
  }

  const safeSupplierMappings = supplierMappings.map((mapping) => {
    const sku = String(mapping?.sku || "").trim();
    if (!sku || !seenSkus.has(sku)) throw new Error(`Supplier mapping refers to an unknown Store SKU: ${sku || "(blank)"}.`);
    return {
      sku,
      supplier_platform: String(mapping.supplier_platform || "").trim(),
      supplier_name: String(mapping.supplier_name || "").trim(),
      supplier_product_id: String(mapping.supplier_product_id || "").trim(),
      supplier_product_url: httpsUrl(mapping.supplier_product_url, `${sku} supplier product URL`),
      supplier_variant_id: String(mapping.supplier_variant_id || "").trim(),
      origin_country: mapping.origin_country || null,
      dispatch_country: mapping.dispatch_country || null,
      destination_country: String(mapping.destination_country || "United States"),
      item_cost_usd: Number(mapping.item_cost_usd || 0),
      shipping_usd: Number(mapping.shipping_usd || 0),
      landed_cost_usd: Number(mapping.landed_cost_usd || 0),
      supplier_stock: mapping.supplier_stock == null ? null : Number(mapping.supplier_stock),
      tracking_supported: mapping.tracking_supported == null ? null : Boolean(mapping.tracking_supported),
      supplier_status: String(mapping.supplier_status || "Pending verification"),
      notes: mapping.notes || null,
    };
  });

  for (const sku of availableSkus) {
    const mapping = safeSupplierMappings.find((item) => item.sku === sku);
    const variant = safeVariants.find((item) => item.sku === sku);
    if (isPublished && (!mapping || !mapping.supplier_platform || !mapping.supplier_name || !mapping.supplier_product_id || !mapping.supplier_product_url || !mapping.supplier_variant_id)) {
      throw new Error(`Published variant ${sku} needs a complete supplier mapping before it can be synced.`);
    }
    if (isPublished && (!variant || !variant.images.length)) {
      throw new Error(`Published variant ${sku} needs at least one HTTPS product image. Add it in Product Media or the Variant & Supplier Map before publishing.`);
    }
  }

  return { product: safeProduct, variants: safeVariants, supplierMappings: safeSupplierMappings };
}

async function supabaseRequest(config, table, { method = "GET", query = "", rows, prefer = "" } = {}) {
  const url = `${config.supabaseUrl}/rest/v1/${table}${query ? `?${query}` : ""}`;
  const response = await fetch(url, {
    method,
    headers: {
      apikey: config.supabaseKey,
      ...(config.supabaseKey.startsWith("eyJ") ? { Authorization: `Bearer ${config.supabaseKey}` } : {}),
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    ...(rows ? { body: JSON.stringify(rows) } : {}),
    cache: "no-store",
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Supabase ${table} request failed (HTTP ${response.status}): ${text.slice(0, 900)}`);
  }
  return text ? JSON.parse(text) : null;
}

export async function GET(request) {
  const config = getConfig();
  if (!config.syncToken || !authorize(request, config.syncToken)) return jsonError("Unauthorized.", 401);
  if (!config.supabaseUrl || !config.supabaseKey) return jsonError("Server Supabase configuration is incomplete.", 503);
  try {
    await supabaseRequest(config, "products", { query: "select=product_id&limit=1" });
    return Response.json({ ok: true, message: "NELLWICK admin API and Supabase are reachable." });
  } catch (error) {
    return jsonError(error.message, 503);
  }
}

export async function POST(request) {
  const config = getConfig();
  if (!config.syncToken || !authorize(request, config.syncToken)) return jsonError("Unauthorized.", 401);
  if (!config.supabaseUrl || !config.supabaseKey) return jsonError("Server Supabase configuration is incomplete.", 503);

  try {
    const body = await request.json();
    const bundle = normalizeBundle(body);
    const { product, variants, supplierMappings } = bundle;

    // Load the current SKU set so a variant removed from the Sheet cannot
    // remain purchasable on the public store after the next successful sync.
    const existingVariants = await supabaseRequest(config, "product_variants", {
      query: `select=sku&product_id=eq.${encodeURIComponent(product.product_id)}`,
    }) || [];
    const incomingSkus = new Set(variants.map((variant) => variant.sku));

    // Disable removed options first. If a later write fails, this fails safe:
    // no removed SKU remains available for a new purchase.
    for (const existing of existingVariants) {
      if (!incomingSkus.has(existing.sku)) {
        await supabaseRequest(config, "product_variants", {
          method: "PATCH",
          query: `sku=eq.${encodeURIComponent(existing.sku)}&product_id=eq.${encodeURIComponent(product.product_id)}`,
          rows: { is_active: false, is_available: false },
          prefer: "return=minimal",
        });
      }
    }

    // Write variants and supplier links before publishing the product row.
    // This prevents a new product from briefly appearing without its options.
    if (variants.length) {
      await supabaseRequest(config, "product_variants", {
        method: "POST", query: "on_conflict=sku", rows: variants,
        prefer: "resolution=merge-duplicates,return=minimal",
      });
    }
    if (supplierMappings.length) {
      await supabaseRequest(config, "supplier_variant_map", {
        method: "POST", query: "on_conflict=sku", rows: supplierMappings,
        prefer: "resolution=merge-duplicates,return=minimal",
      });
    }

    // Publish/draft/archive is the final write after the catalogue is ready.
    await supabaseRequest(config, "products", {
      method: "POST", query: "on_conflict=product_id", rows: [product],
      prefer: "resolution=merge-duplicates,return=minimal",
    });

    return Response.json({
      ok: true,
      product_id: product.product_id,
      status: product.status,
      is_published: product.is_published,
      variant_count: variants.length,
      supplier_mapping_count: supplierMappings.length,
      message: "Product and variant catalogue synced to Supabase.",
    });
  } catch (error) {
    return jsonError(error.message || "Catalogue sync failed.", 400);
  }
}
