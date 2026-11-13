
import {
  verifyAndConfirmPayment,
  verifyFlutterwaveWebhookSignature,
} from "@/lib/server/flutterwave";

const MAX_WEBHOOK_SIZE = 64 * 1024;

export async function POST(request) {
  try {
    // Authenticate the webhook before processing its contents.
    const signature = request.headers.get("verif-hash");

    if (!verifyFlutterwaveWebhookSignature(signature)) {
      return new Response("Unauthorized", { status: 401 });
    }

    const rawBody = await request.text();

    if (Buffer.byteLength(rawBody, "utf8") > MAX_WEBHOOK_SIZE) {
      return new Response("Payload too large", { status: 413 });
    }

    let payload;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return new Response("Invalid JSON payload", { status: 400 });
    }

    // We only process completed payment events.
    if (payload?.event !== "charge.completed") {
      return Response.json({
        received: true,
        processed: false,
      });
    }

    const transaction = payload?.data;

    if (!transaction || typeof transaction !== "object") {
      return new Response("Invalid transaction data", { status: 400 });
    }

    // Failed and incomplete payments must never confirm an order.
    if (transaction.status !== "successful") {
      return Response.json({
        received: true,
        processed: false,
      });
    }

    if (!transaction.id || !transaction.tx_ref) {
      return new Response("Missing transaction details", {
        status: 400,
      });
    }

    // Verify directly with Flutterwave.
    // The webhook payload alone is never trusted as proof of payment.
    const result = await verifyAndConfirmPayment({
      transactionId: String(transaction.id),
      expectedReference: String(transaction.tx_ref),
    });

    return Response.json({
      received: true,
      processed: true,
      orderNumber: result.orderNumber,
    });

  } catch (error) {
    console.error(
      "NELLWICK Flutterwave webhook failed:",
      error?.message || error
    );

    // A server error allows Flutterwave to retry delivery.
    return new Response("Webhook processing failed", {
      status: 500,
    });
  }
}