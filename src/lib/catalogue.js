/**
 * NELLWICK public catalogue reader.
 * Reads only fields permitted by the public products/product_variants RLS policies.
 * Supplier costs and supplier mappings are intentionally never selected here.
 *
 * Cache Components are enabled in this project. connection() replaces the
 * incompatible `export const dynamic = "force-dynamic"` route setting.
 */
import { connection } from "next/server";
import { products as editorialProducts } from "@/data/products";

const PRODUCT_COLUMNS = [
  "product_id", "slug", "name", "category", "description", "base_price_usd",
  "status", "is_published", "is_hero", "images", "short_name",
  "short_description", "highlights", "feature_cards", "detail_sections",
  "how_to_use", "care_instructions", "what_is_included", "specifications",
  "product_faqs", "video_url", "video_type", "video_poster_url", "image_alt",
  "shipping_note", "returns_note", "seo_title", "seo_description",
  "related_product_slugs", "created_at"
].join(",");

const VARIANT_COLUMNS = [
  "sku", "product_id", "variant_name", "option_name", "option_value",
  "price_usd", "is_active", "is_available", "display_order", "color_hex",
  "image_url", "images", "image_alt", "video_url", "video_type"
].join(",");

function getSupabaseConfig() {
  const url = String(process.env.SUPABASE_URL || "").trim().replace(/\/$/, "");
  const key = String(
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || ""
  ).trim();
  return url && key ? { url, key } : null;
}

function getHeaders(key) {
  const headers = { apikey: key, Accept: "application/json" };
  if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`;
  return headers;
}

async function readTable(config, table, filters) {
  const url = new URL(`${config.url}/rest/v1/${table}`);
  for (const [name, value] of Object.entries(filters)) url.searchParams.set(name, value);
  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(config.key),
    cache: "no-store",
  });
  const body = await response.text();
  let parsed = null;
  try { parsed = body ? JSON.parse(body) : null; } catch { /* handled below */ }
  if (!response.ok) {
    const message = parsed?.message || parsed?.hint || `Supabase ${table} read failed (${response.status}).`;
    throw new Error(message);
  }
  if (!Array.isArray(parsed)) throw new Error(`Supabase returned an invalid ${table} response.`);
  return parsed;
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; }
    catch { return []; }
  }
  return [];
}

function imageUrls(value) {
  return asArray(value).map((entry) => {
    if (typeof entry === "string") return entry;
    if (entry && typeof entry === "object") return entry.url || entry.src || entry.image_url || "";
    return "";
  }).filter((url) => {
    if (typeof url !== "string") return false;
    try { return new URL(url).protocol === "https:"; } catch { return false; }
  });
}

function jsonObjects(value) {
  return asArray(value).filter((item) => item && typeof item === "object" && !Array.isArray(item));
}

function inFilter(values) {
  const quoted = values.map((value) => `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`);
  return `in.(${quoted.join(",")})`;
}

function makeProduct(row, variantRows, editorial) {
  const variants = variantRows
    .filter((variant) => variant.product_id === row.product_id)
    .sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0))
    .map((variant) => {
      const label = String(variant.option_value || variant.variant_name || "Standard");
      const localVariant = editorial?.variants?.find((item) => item.id === variant.sku);
      const pics = imageUrls(variant.images);
      if (!pics.length && variant.image_url) pics.push(...imageUrls([variant.image_url]));
      return {
        id: variant.sku,
        sku: variant.sku,
        label,
        optionName: variant.option_name || "Option",
        color: variant.color_hex || localVariant?.color || "#779B88",
        price: Number(variant.price_usd),
        available: Boolean(variant.is_active && variant.is_available),
        imageUrls: pics,
        imageAlt: variant.image_alt || `${row.name} — ${label}`,
        videoUrl: variant.video_url || "",
        videoType: variant.video_type || "mp4",
      };
    });

  const availablePrices = variants.filter(v => v.available && Number.isFinite(v.price)).map(v => v.price);
  const dbImages = imageUrls(row.images);
  const description = String(row.description || "").trim();
  const shortDescription = String(row.short_description || "").trim() ||
    (description.length > 155 ? `${description.slice(0, 152).trimEnd()}…` : description);

  return {
    id: row.product_id,
    slug: row.slug,
    name: row.name,
    shortName: row.short_name || editorial?.shortName || row.name,
    category: row.category,
    price: availablePrices.length ? Math.min(...availablePrices) : Number(row.base_price_usd),
    currency: "USD",
    featured: Boolean(row.is_hero),
    shortDescription,
    description: description || editorial?.description || "",
    imageUrls: dbImages.length ? dbImages : (editorial?.imageUrls || []),
    imageAlt: row.image_alt || editorial?.imageAlt || `${row.name} product images`,
    videoUrl: row.video_url || "",
    videoType: row.video_type || "mp4",
    videoPosterUrl: row.video_poster_url || "",
    variants,
    highlights: asArray(row.highlights).filter(Boolean),
    featureCards: jsonObjects(row.feature_cards),
    detailSections: jsonObjects(row.detail_sections),
    howToUse: row.how_to_use || "",
    careInstructions: row.care_instructions || "",
    whatIsIncluded: asArray(row.what_is_included).filter(Boolean),
    specifications: jsonObjects(row.specifications),
    faqs: jsonObjects(row.product_faqs),
    shippingNote: row.shipping_note || "",
    returnsNote: row.returns_note || "",
    relatedProductSlugs: Array.isArray(row.related_product_slugs) ? row.related_product_slugs : [],
    seo: {
      title: row.seo_title || `${row.name} | NELLWICK`,
      description: row.seo_description || shortDescription,
    },
  };
}

/** Returns the currently published catalogue. Each request reads current Supabase data. */
export async function getStoreProducts() {
  const config = getSupabaseConfig();
  if (!config) return editorialProducts;

  // Required by Next.js 16 Cache Components for uncached request-time catalogue data.
  await connection();

  try {
    const productRows = await readTable(config, "products", {
      select: PRODUCT_COLUMNS,
      status: "eq.active",
      is_published: "eq.true",
      order: "created_at.asc",
    });
    if (!productRows.length) return [];

    const ids = productRows.map((row) => row.product_id);
    const variantRows = await readTable(config, "product_variants", {
      select: VARIANT_COLUMNS,
      product_id: inFilter(ids),
      is_active: "eq.true",
      is_available: "eq.true",
      order: "display_order.asc",
    });
    const editorialBySlug = new Map(editorialProducts.map((item) => [item.slug, item]));
    return productRows
      .map((row) => makeProduct(row, variantRows, editorialBySlug.get(row.slug)))
      .filter((product) => product.variants.some((variant) => variant.available));
  } catch (error) {
    console.error("NELLWICK catalogue read failed:", error?.message || error);
    return [];
  }
}

export async function getStoreProductBySlug(slug) {
  const products = await getStoreProducts();
  return products.find((product) => product.slug === slug) || null;
}

export async function getStoreProductsBySlugs(slugs = []) {
  const wanted = new Set(slugs);
  if (!wanted.size) return [];
  const products = await getStoreProducts();
  return products.filter((product) => wanted.has(product.slug));
}
