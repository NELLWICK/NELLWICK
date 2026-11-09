"use client";

import Link from "next/link";
import StoreFrame from "@/components/StoreFrame";
import { useCart } from "@/components/CartProvider";

function money(value, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(value) || 0);
}

export default function CartPage() {
  const { items, subtotal, hydrated, updateQuantity, removeItem } = useCart();

  if (!hydrated) {
    return <StoreFrame><main className="nw-page"><div className="nw-empty-state"><p>Loading your cart…</p></div></main></StoreFrame>;
  }

  return (
    <StoreFrame>
      <main className="nw-page nw-cart-page">
        <div className="nw-cart-heading">
          <div><span className="nw-eyebrow">YOUR NELLWICK CART</span><h1>Your cart<span>.</span></h1><p>{items.reduce((sum, item) => sum + item.quantity, 0)} items selected</p></div>
          <Link className="nw-text-link" href="/shop">Continue shopping ↗</Link>
        </div>

        {items.length === 0 ? (
          <div className="nw-empty-state">
            <span className="nw-empty-state__mark">N.</span>
            <h2>Your cart is empty.</h2>
            <p>When you find something you love, it will be waiting here.</p>
            <Link href="/shop" className="nw-primary-link">Explore the shop <span>↗</span></Link>
          </div>
        ) : (
          <div className="nw-cart-layout">
            <div className="nw-cart-items">
              {items.map((item) => (
                <article className="nw-cart-item" key={item.key}>
                  <Link href={`/products/${item.slug}`} className="nw-cart-item__image">
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <span>N.</span>}
                  </Link>
                  <div className="nw-cart-item__details">
                    <span className="nw-cart-item__variant">{item.variantLabel}</span>
                    <h2><Link href={`/products/${item.slug}`}>{item.name}</Link></h2>
                    <span className="nw-cart-item__price">{money(item.price, item.currency)}</span>
                    <div className="nw-cart-item__controls">
                      <div className="nw-quantity-control">
                        <button type="button" aria-label={`Decrease ${item.name} quantity`} disabled={item.quantity <= 1} onClick={() => updateQuantity(item.key, item.quantity - 1)}>−</button>
                        <span>{item.quantity}</span>
                        <button type="button" aria-label={`Increase ${item.name} quantity`} disabled={item.quantity >= 10} onClick={() => updateQuantity(item.key, item.quantity + 1)}>+</button>
                      </div>
                      <button type="button" className="nw-remove-link" onClick={() => removeItem(item.key)}>Remove</button>
                    </div>
                  </div>
                  <strong className="nw-cart-item__total">{money(item.price * item.quantity, item.currency)}</strong>
                </article>
              ))}
            </div>

            <aside className="nw-cart-summary">
              <span className="nw-eyebrow">ORDER SUMMARY</span>
              <div className="nw-summary-line"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
              <div className="nw-summary-line"><span>Shipping</span><span>Calculated after address</span></div>
              <div className="nw-summary-line"><span>Taxes</span><span>Calculated where applicable</span></div>
              <div className="nw-summary-total"><span>Estimated total</span><strong>{money(subtotal)}</strong></div>
              <p>Shipping and any applicable taxes are not included in this subtotal. Final charges must be confirmed at checkout.</p>
              <Link href="/checkout" className="nw-primary-link nw-primary-link--wide">Continue to checkout <span>↗</span></Link>
              <span className="nw-summary-footnote">Your cart is saved in this browser.</span>
            </aside>
          </div>
        )}
      </main>
    </StoreFrame>
  );
}
