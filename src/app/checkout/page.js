"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StoreFrame from "@/components/StoreFrame";
import { useCart } from "@/components/CartProvider";

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);
}


export default function CheckoutPage() {
  const {
    items,
    subtotal,
    hydrated,
    clearCart,
  } = useCart();

  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    if (!hydrated) return;

    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");

    if (payment === "success") {
      const orderNumber = params.get("order") || "";
      clearCart();
      setPaymentResult({
        status: "success",
        orderNumber,
      });
    } else if (payment) {
      setPaymentResult({
        status: payment,
        orderNumber: "",
      });
    }
  }, [hydrated, clearCart]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (busy || !items.length) return;

    setBusy(true);
    setNotice("");

    try {
      const formData = new FormData(event.currentTarget);

      const customer = {
        email: formData.get("email"),
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        phone: formData.get("phone"),
        address: formData.get("address"),
        address2: formData.get("address2"),
        city: formData.get("city"),
        region: formData.get("region"),
        postalCode: formData.get("postalCode"),
        country: formData.get("country"),
      };

      // Only send product IDs, variant SKUs and quantities.
      // The server retrieves the real product names and prices.
      const cartItems = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      const response = await fetch("/api/checkout/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          customer,
          items: cartItems,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result?.ok || !result?.checkoutUrl) {
        throw new Error(
          result?.error || "We could not start your secure checkout."
        );
      }

      const checkoutUrl = new URL(result.checkoutUrl);

      if (
        checkoutUrl.protocol !== "https:" ||
        checkoutUrl.hostname !== "checkout.flutterwave.com"
      ) {
        throw new Error("The secure payment link was not valid.");
      }

      window.location.assign(checkoutUrl.toString());
    } catch (error) {
      setNotice(
        error?.message ||
        "Something went wrong while preparing your payment. Please try again."
      );
      setBusy(false);
    }
  }

  if (!hydrated) {
    return (
      <StoreFrame>
        <main className="nw-page">
          <div className="nw-empty-state">
            <p>Preparing checkout…</p>
          </div>
        </main>
      </StoreFrame>
    );
  }

  if (paymentResult?.status === "success") {
    return (
      <StoreFrame>
        <main className="nw-page">
          <div className="nw-empty-state">
            <span className="nw-eyebrow">PAYMENT CONFIRMED</span>
            <h1>Your order is confirmed<span>.</span></h1>
            <p>
              Your payment has been verified and your order has been recorded.
            </p>
            {paymentResult.orderNumber && (
              <p>
                <strong>Order number: {paymentResult.orderNumber}</strong>
              </p>
            )}
            <Link href="/shop" className="nw-primary-link">
              Continue shopping ↗
            </Link>
          </div>
        </main>
      </StoreFrame>
    );
  }

  if (!items.length) {
    return (
      <StoreFrame>
        <main className="nw-page">
          <div className="nw-empty-state">
            <span className="nw-eyebrow">CHECKOUT</span>
            <h1>Your cart is empty.</h1>
            <p>Add an item before continuing to checkout.</p>
            <Link href="/shop" className="nw-primary-link">
              Explore the shop ↗
            </Link>
          </div>
        </main>
      </StoreFrame>
    );
  }

  return (
    <StoreFrame>
      <main className="nw-page nw-checkout-page">
        <div className="nw-cart-heading">
          <div>
            <span className="nw-eyebrow">ALMOST THERE</span>
            <h1>Checkout<span>.</span></h1>
            <p>Review your details before continuing to secure payment.</p>
          </div>

          <Link href="/cart" className="nw-text-link">
            ← Back to cart
          </Link>
        </div>

        {paymentResult && paymentResult.status !== "success" && (
          <div className="nw-notice" role="status">
            <strong>
              {paymentResult.status === "cancelled"
                ? "Payment cancelled"
                : paymentResult.status === "verification_failed"
                  ? "Payment verification needs attention"
                  : "Payment not completed"}
            </strong>
            <span>
              {paymentResult.status === "cancelled"
                ? "Your checkout was cancelled. Your cart is still saved, and no successful payment has been confirmed."
                : paymentResult.status === "verification_failed"
                  ? "We could not confirm the payment yet. Please do not pay again until you have checked with us."
                  : "No successful payment has been confirmed. You can review your cart and try again."}
            </span>
          </div>
        )}

        <div className="nw-checkout-layout">
          <form className="nw-checkout-form" onSubmit={handleSubmit}>
            <div className="nw-notice">
              <strong>Secure payment with Flutterwave</strong>
              <span>
                You will be redirected to Flutterwave to complete your payment.
                NELLWICK does not collect or store your card details.
              </span>
            </div>

            <section className="nw-form-section">
              <h2>Contact information</h2>
              <label>
                Email address
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  maxLength={254}
                  required
                />
              </label>
            </section>

            <section className="nw-form-section">
              <h2>Delivery address</h2>

              <div className="nw-form-grid">
                <label>
                  First name
                  <input
                    name="firstName"
                    autoComplete="given-name"
                    maxLength={100}
                    required
                  />
                </label>

                <label>
                  Last name
                  <input
                    name="lastName"
                    autoComplete="family-name"
                    maxLength={100}
                    required
                  />
                </label>

                <label className="nw-form-grid__full">
                  Address
                  <input
                    name="address"
                    autoComplete="address-line1"
                    maxLength={300}
                    required
                  />
                </label>

                <label className="nw-form-grid__full">
                  Apartment, suite or unit (optional)
                  <input
                    name="address2"
                    autoComplete="address-line2"
                    maxLength={300}
                  />
                </label>

                <label>
                  City
                  <input
                    name="city"
                    autoComplete="address-level2"
                    maxLength={100}
                    required
                  />
                </label>

                <label>
                  State / region
                  <input
                    name="region"
                    autoComplete="address-level1"
                    maxLength={100}
                    required
                  />
                </label>

                <label>
                  Postal code
                  <input
                    name="postalCode"
                    autoComplete="postal-code"
                    maxLength={30}
                    required
                  />
                </label>

                <label>
                  Country
                  <input
                    name="country"
                    autoComplete="country-name"
                    placeholder="Country"
                    maxLength={100}
                    required
                  />
                </label>

                <label className="nw-form-grid__full">
                  Phone number
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={40}
                    required
                  />
                </label>
              </div>
            </section>

            <button
              className="nw-primary-link nw-primary-link--wide"
              type="submit"
              disabled={busy}
            >
              <span>
                {busy ? "Preparing secure payment…" : "Continue to Flutterwave"}
              </span>
              {!busy && <span aria-hidden="true">↗</span>}
            </button>

            {notice && (
              <p className="nw-form-notice" role="alert">
                {notice}
              </p>
            )}
          </form>

          <aside className="nw-cart-summary nw-checkout-summary">
            <span className="nw-eyebrow">YOUR ORDER</span>

            {items.map((item) => (
              <div className="nw-checkout-item" key={item.key}>
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.variantLabel} · Qty {item.quantity}
                  </span>
                </div>
                <b>{money(item.price * item.quantity)}</b>
              </div>
            ))}

            <div className="nw-summary-total">
              <span>Estimated subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>

            <div className="nw-summary-line">
              <span>Shipping</span>
              <strong>{money(0)}</strong>
            </div>

            <div className="nw-summary-line">
              <span>Tax</span>
              <strong>{money(0)}</strong>
            </div>

            <div className="nw-summary-total">
              <span>Estimated total</span>
              <strong>{money(subtotal)}</strong>
            </div>

            <p>
              Shipping and tax are set to $0.00 for this initial test checkout.
              The final product prices are checked against the live catalogue
              before payment is created.
            </p>
          </aside>
        </div>
      </main>
    </StoreFrame>
  );
}
