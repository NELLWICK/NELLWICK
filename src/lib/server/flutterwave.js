
import { randomUUID, timingSafeEqual } from "node:crypto";

function getSupabaseConfig() {
  const url = String(process.env.SUPABASE_URL || "")
    .trim()
    .replace(/\/+$/, "");

  const key = String(
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ""
  ).trim();

  if (!url || !key) {
    throw new Error("Server Supabase configuration is incomplete.");
  }

  return { url, key };
}

function getFlutterwaveSecret() {
  const secret = String(
    process.env.FLUTTERWAVE_SECRET_KEY || ""
  ).trim();

  if (!secret) {
    throw new Error("Flutterwave server secret is not configured.");
  }

  return secret;
}

function supabaseHeaders(key) {
  return {
    apikey: key,
    ...(key.startsWith("eyJ")
      ? { Authorization: `Bearer ${key}` }
      : {}),
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function supabaseRequest(path, {
  method = "GET",
  body,
  prefer,
} = {}) {
  const config = getSupabaseConfig();
  const url = `${config.url}/rest/v1/${path}`;

  const headers = supabaseHeaders(config.key);

  if (prefer) {
    headers.Prefer = prefer;
  }

  const response = await fetch(url, {
    method,
    headers,
    ...(body !== undefined
      ? { body: JSON.stringify(body) }
      : {}),
    cache: "no-store",
  });

  const responseText = await response.text();

  let result = null;

  try {
    result = responseText ? JSON.parse(responseText) : null;
  } catch {
    throw new Error("Supabase returned an invalid response.");
  }

  if (!response.ok) {
    const message =
      result?.message ||
      result?.details ||
      `Supabase request failed (${response.status}).`;

    throw new Error(message);
  }

  return result;
}

/**
 * Create the pending order through the secure database function.
 * Prices are retrieved and calculated inside Supabase.
 */
export async function createPendingOrder({
  customer,
  items,
  paymentReference,
}) {
  const result = await supabaseRequest(
    "rpc/nellwick_create_pending_order",
    {
      method: "POST",
      body: {
        p_customer: customer,
        p_items: items,
        p_payment_reference: paymentReference,
      },
    }
  );

  const order = Array.isArray(result) ? result[0] : result;

  if (!order?.ok || !order?.order_id || !order?.amount) {
    throw new Error("Supabase did not create a valid pending order.");
  }

  return order;
}

/**
 * Generate a unique reference for each checkout attempt.
 */
export function createPaymentReference() {
  return `NWL-${randomUUID()}`;
}

/**
 * Create Flutterwave's hosted checkout link.
 */
export async function createFlutterwaveCheckout({
  reference,
  amount,
  customer,
  orderNumber,
  origin,
}) {
  const secret = getFlutterwaveSecret();

  const payload = {
    tx_ref: reference,
    amount: Number(Number(amount).toFixed(2)),
    currency: "USD",
    redirect_url: `${origin}/api/checkout/callback`,
    customer: {
      email: customer.email,
      name: `${customer.firstName} ${customer.lastName}`.trim(),
      phonenumber: customer.phone,
    },
    customizations: {
      title: "NELLWICK",
      description: `Payment for order ${orderNumber}`,
    },
    meta: {
      order_number: orderNumber,
    },
  };

  const response = await fetch(
    "https://api.flutterwave.com/v3/payments",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    }
  );

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("Flutterwave returned an invalid response.");
  }

  if (!response.ok || result?.status !== "success") {
    throw new Error(
      result?.message || "Flutterwave could not initialize checkout."
    );
  }

  const link = result?.data?.link;

  if (typeof link !== "string") {
    throw new Error("Flutterwave did not return a checkout link.");
  }

  let parsedLink;

  try {
    parsedLink = new URL(link);
  } catch {
    throw new Error("Flutterwave returned an invalid checkout link.");
  }

  if (
    parsedLink.protocol !== "https:" ||
    parsedLink.hostname !== "checkout.flutterwave.com"
  ) {
    throw new Error("Flutterwave returned an unexpected checkout URL.");
  }

  return link;
}

/**
 * Verify the transaction directly with Flutterwave.
 * Never use the browser's payment status as proof.
 */
async function verifyTransaction(transactionId) {
  const secret = getFlutterwaveSecret();

  const id = String(transactionId || "").trim();

  if (!/^\d{1,30}$/.test(id)) {
    throw new Error("Invalid Flutterwave transaction ID.");
  }

  const response = await fetch(
    `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(id)}/verify`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secret}`,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("Unable to read Flutterwave verification response.");
  }

  if (!response.ok || result?.status !== "success" || !result?.data) {
    throw new Error("Flutterwave transaction verification failed.");
  }

  return result.data;
}

function moneyToCents(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    throw new Error("Invalid payment amount.");
  }

  return Math.round(amount * 100);
}

/**
 * Verify a transaction and confirm its existing pending order.
 * This function is shared by the browser callback and webhook.
 */
export async function verifyAndConfirmPayment({
  transactionId,
  expectedReference,
}) {
  const reference = String(expectedReference || "").trim();

  if (!/^NWL-[A-Za-z0-9-]{8,100}$/.test(reference)) {
    throw new Error("Invalid payment reference.");
  }

  const transaction = await verifyTransaction(transactionId);

  if (String(transaction.id) !== String(transactionId)) {
    throw new Error("Flutterwave transaction ID mismatch.");
  }

  if (transaction.tx_ref !== reference) {
    throw new Error("Flutterwave payment reference mismatch.");
  }

  if (transaction.status !== "successful") {
    throw new Error("Flutterwave has not confirmed a successful payment.");
  }

  if (String(transaction.currency).toUpperCase() !== "USD") {
    throw new Error("The payment currency does not match the USD order.");
  }

  const payments = await supabaseRequest(
    `payments?select=id,order_id,amount,currency,payment_status,payment_reference&payment_reference=eq.${encodeURIComponent(reference)}&limit=1`
  );

  if (!Array.isArray(payments) || payments.length !== 1) {
    throw new Error("The original NELLWICK payment record was not found.");
  }

  const payment = payments[0];

  if (String(payment.gateway).toLowerCase() === "other") {
    throw new Error("Invalid payment gateway.");
  }

  if (String(payment.currency).toUpperCase() !== "USD") {
    throw new Error("The stored order currency is not USD.");
  }

  // Require the exact amount. We do not silently accept overpayments
  // because an automatic partial refund process is not configured.
  if (moneyToCents(transaction.amount) !== moneyToCents(payment.amount)) {
    throw new Error("The verified payment amount does not match the order.");
  }

  const confirmation = await supabaseRequest(
    "rpc/nellwick_confirm_flutterwave_payment",
    {
      method: "POST",
      body: {
        p_payment_reference: reference,
        p_gateway_transaction_id: String(transaction.id),
        p_paid_amount: Number(transaction.amount),
        p_paid_currency: String(transaction.currency).toUpperCase(),
      },
    }
  );

  const result = Array.isArray(confirmation)
    ? confirmation[0]
    : confirmation;

  if (!result?.ok) {
    throw new Error("Supabase could not confirm the payment.");
  }

  return {
    orderNumber: result.order_number,
    orderStatus: result.order_status,
    alreadyConfirmed: Boolean(result.already_confirmed),
  };
}

/**
 * Check Flutterwave's webhook secret hash safely.
 */
export function verifyFlutterwaveWebhookSignature(receivedHash) {
  const expectedHash = String(
    process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH || ""
  ).trim();

  const received = String(receivedHash || "").trim();

  if (!expectedHash || !received) {
    return false;
  }

  const expectedBuffer = Buffer.from(expectedHash);
  const receivedBuffer = Buffer.from(received);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}