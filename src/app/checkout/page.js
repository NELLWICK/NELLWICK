"use client";

import { useState } from "react";
import Link from "next/link";
import StoreFrame from "@/components/StoreFrame";
import { useCart } from "@/components/CartProvider";

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value) || 0);
}

export default function CheckoutPage() {
  const { items, subtotal, hydrated } = useCart();
  const [notice, setNotice] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setNotice("Your details have not been sent and no order or payment has been created. Secure payment processing is not connected yet.");
  }

  if (!hydrated) {
    return <StoreFrame><main className="nw-page"><div className="nw-empty-state"><p>Preparing checkout…</p></div></main></StoreFrame>;
  }

  if (!items.length) {
    return <StoreFrame><main className="nw-page"><div className="nw-empty-state"><span className="nw-eyebrow">CHECKOUT</span><h1>Your cart is empty.</h1><p>Add an item before continuing to checkout.</p><Link href="/shop" className="nw-primary-link">Explore the shop ↗</Link></div></main></StoreFrame>;
  }

  return (
    <StoreFrame>
      <main className="nw-page nw-checkout-page">
        <div className="nw-cart-heading"><div><span className="nw-eyebrow">ALMOST THERE</span><h1>Checkout<span>.</span></h1><p>Review your details before placing an order.</p></div><Link href="/cart" className="nw-text-link">← Back to cart</Link></div>
        <div className="nw-checkout-layout">
          <form className="nw-checkout-form" onSubmit={handleSubmit}>
            <div className="nw-notice"><strong>Pre-launch checkout preview</strong><span>Payment processing and order creation have not been connected. Do not enter real payment details here.</span></div>
            <section className="nw-form-section">
              <h2>Contact information</h2>
              <label>Email address<input type="email" name="email" placeholder="you@example.com" autoComplete="email" required /></label>
            </section>
            <section className="nw-form-section">
              <h2>Delivery address</h2>
              <div className="nw-form-grid">
                <label>First name<input name="firstName" autoComplete="given-name" required /></label>
                <label>Last name<input name="lastName" autoComplete="family-name" required /></label>
                <label className="nw-form-grid__full">Address<input name="address" autoComplete="street-address" required /></label>
                <label>City<input name="city" autoComplete="address-level2" required /></label>
                <label>State / region<input name="region" autoComplete="address-level1" required /></label>
                <label>Postal code<input name="postalCode" autoComplete="postal-code" required /></label>
                <label>Country<input name="country" autoComplete="country-name" placeholder="Country" required /></label>
                <label className="nw-form-grid__full">Phone number<input name="phone" type="tel" autoComplete="tel" /></label>
              </div>
            </section>
            <button className="nw-primary-link nw-primary-link--wide" type="submit">Review checkout setup <span>↗</span></button>
            {notice && <p className="nw-form-notice" role="status">{notice}</p>}
          </form>
          <aside className="nw-cart-summary nw-checkout-summary">
            <span className="nw-eyebrow">YOUR ORDER</span>
            {items.map((item) => <div className="nw-checkout-item" key={item.key}><div><strong>{item.name}</strong><span>{item.variantLabel} · Qty {item.quantity}</span></div><b>{money(item.price * item.quantity)}</b></div>)}
            <div className="nw-summary-total"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
            <p>Shipping and applicable taxes will need to be calculated using the final delivery address and confirmed shipping rules.</p>
          </aside>
        </div>
      </main>
    </StoreFrame>
  );
}
