"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export default function StoreHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount, hydrated } = useCart();

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="nw-header">
      <div className="nw-header__inner">
        <Link href="/" className="nw-brand" aria-label="NELLWICK home" onClick={closeMenu}>
          <span className="nw-brand__mark" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <circle cx="10" cy="10" r="3.2" />
              <circle cx="21.5" cy="9.5" r="3.2" />
              <circle cx="7.5" cy="18" r="3" />
              <circle cx="24" cy="17.5" r="3" />
              <path d="M15.8 14.2c-4.7 0-8.1 4.2-7.2 8.2.5 2.1 2.5 3 4.2 1.7l3-2.2 3.1 2.2c1.7 1.3 3.7.4 4.2-1.7.9-4-2.6-8.2-7.3-8.2Z" />
            </svg>
          </span>
          <span className="nw-brand__word">NELLWICK</span>
        </Link>

        <button
          className={`nw-menu-toggle ${menuOpen ? "is-open" : ""}`}
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>

        <nav className={`nw-nav ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
          <Link href="/shop" onClick={closeMenu}>Shop</Link>
          <Link href="/collections" onClick={closeMenu}>Collections</Link>
          <Link href="/about" onClick={closeMenu}>Our story</Link>
          <Link href="/faq" onClick={closeMenu}>Help</Link>
        </nav>

        <Link
          href="/cart"
          className="nw-header__cart"
          onClick={closeMenu}
          aria-label={`Cart, ${hydrated ? itemCount : 0} items`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 1.9-1.4L21 8H6" />
            <circle cx="10" cy="20" r="1.25" />
            <circle cx="18" cy="20" r="1.25" />
          </svg>
          <span className="nw-header__cart-label">Cart</span>
          <span className="nw-header__count" aria-hidden="true">
            {hydrated ? itemCount : 0}
          </span>
        </Link>
      </div>
    </header>
  );
}
