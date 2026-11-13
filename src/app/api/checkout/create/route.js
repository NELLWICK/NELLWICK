import {
  createPendingOrder,
  createPaymentReference,
  createFlutterwaveCheckout,
} from "@/lib/server/flutterwave";

function jsonError(message, status = 400) {
  return Response.json({ ok: false, error: message }, { status });
}

function cleanString(value, maxLength = 300) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

function getSiteOrigin() {
  const configuredUrl = String(
    process.env.NELLWICK_SITE_URL || ""
  ).trim();

  if (!configuredUrl) {
    throw new Error("NELLWICK_SITE_URL is not configured.");
  }

  const parsed = new URL(configuredUrl);

  if (
    parsed.protocol !== "https:" &&
    parsed.hostname !== "localhost"
  ) {
    throw new Error("NELLWICK_SITE_URL must use HTTPS.");
  }

  return parsed.origin;
}

export async function POST(request) {
  let orderNumber = null;

  try {
    const siteOrigin = getSiteOrigin();
    const requestOrigin = request.headers.get("origin");

    if (!requestOrigin || requestOrigin !== siteOrigin) {
      return jsonError("This checkout request is not allowed.", 403);
    }

    const contentLength = Number(
      request.headers.get("content-length") || 0
    );

    if (contentLength > 32000) {
      return jsonError("Checkout request is too large.", 413);
    }

    const body = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      !body.customer ||
      typeof body.customer !== "object" ||
      !Array.isArray(body.items)
    ) {
      return jsonError("Valid customer and cart details are required.");
    }

    if (body.items.length < 1 || body.items.length > 20) {
      return jsonError("Your cart must contain between 1 and 20 items.");
    }

    const customer = {
      email: cleanString(body.customer.email, 254).toLowerCase(),
      firstName: cleanString(body.customer.firstName, 100),
      lastName: cleanString(body.customer.lastName, 100),
      phone: cleanString(body.customer.phone, 40),
      address: cleanString(body.customer.address, 300),
      address2: cleanString(body.customer.address2, 300),
      city: cleanString(body.customer.city, 100),
      region: cleanString(body.customer.region, 100),
      postalCode: cleanString(body.customer.postalCode, 30),
      country: cleanString(body.customer.country, 100),
      countryCode: cleanString(
        body.customer.countryCode,
        2
      ).toUpperCase(),
    };

    if (
      !customer.email ||
      !customer.firstName ||
      !customer.lastName ||
      !customer.phone ||
      !customer.address ||
      !customer.city ||
      !customer.region ||
      !customer.postalCode ||
      !customer.country
    ) {
      return jsonError("Please complete all required checkout details.");
    }

    // Only send identifiers and quantities.
    // Supabase calculates all actual prices.
    const items = body.items.map((item) => ({
      productId: cleanString(item?.productId, 80),
      sku: cleanString(item?.variantId || item?.sku, 120),
      quantity: Number(item?.quantity),
    }));

    for (const item of items) {
      if (
        !item.productId ||
        !item.sku ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 99
      ) {
        return jsonError(
          "One or more cart items are invalid. Please refresh your cart."
        );
      }
    }

    const paymentReference = createPaymentReference();

    // Supabase creates the customer, order, order items,
    // address and pending payment in one database transaction.
    const order = await createPendingOrder({
      customer,
      items,
      paymentReference,
    });

    orderNumber = order.order_number;

    // Use the verified database total, never the browser subtotal.
    const checkoutUrl = await createFlutterwaveCheckout({
      reference: order.payment_reference,
      amount: order.amount,
      customer,
      orderNumber: order.order_number,
      origin: siteOrigin,
    });

    return Response.json({
      ok: true,
      checkoutUrl,
      orderNumber: order.order_number,
    });

  } catch (error) {
    console.error(
      "NELLWICK checkout initialization failed:",
      error?.message || error
    );

    return Response.json(
      {
        ok: false,
        orderNumber,
        error: orderNumber
          ? "Your order was saved, but payment could not be opened. No successful payment has been confirmed. Please contact us before trying again."
          : "We could not prepare your checkout. Please check your details and try again.",
      },
      { status: 502 }
    );
  }
}