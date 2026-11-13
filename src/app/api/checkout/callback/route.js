
import { verifyAndConfirmPayment } from "@/lib/server/flutterwave";

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

function redirectToCheckout(status, orderNumber = "") {
  const destination = new URL("/checkout", getSiteOrigin());

  destination.searchParams.set("payment", status);

  if (orderNumber) {
    destination.searchParams.set("order", orderNumber);
  }

  return Response.redirect(destination.toString(), 303);
}

export async function GET(request) {
  try {
    const requestUrl = new URL(request.url);

    const transactionId = requestUrl.searchParams.get("transaction_id");
    const paymentReference = requestUrl.searchParams.get("tx_ref");
    const flutterwaveStatus = requestUrl.searchParams.get("status");

    // A customer can cancel without completing a transaction.
    if (flutterwaveStatus === "cancelled") {
      return redirectToCheckout("cancelled");
    }

    // A successful-looking browser redirect is not proof of payment.
    // We require both identifiers and verify directly with Flutterwave.
    if (
      flutterwaveStatus !== "successful" ||
      !transactionId ||
      !paymentReference
    ) {
      return redirectToCheckout("not_completed");
    }

    const result = await verifyAndConfirmPayment({
      transactionId,
      expectedReference: paymentReference,
    });

    return redirectToCheckout(
      "success",
      result.orderNumber
    );

  } catch (error) {
    console.error(
      "NELLWICK payment callback verification failed:",
      error?.message || error
    );

    try {
      return redirectToCheckout("verification_failed");
    } catch (redirectError) {
      console.error(
        "NELLWICK callback redirect failed:",
        redirectError?.message || redirectError
      );

      return Response.json(
        {
          ok: false,
          error: "Payment verification could not be completed.",
        },
        { status: 500 }
      );
    }
  }
}