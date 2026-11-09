import Link from "next/link";

export default function StoreFooter() {
  return (
    <footer className="nw-footer">
      <div className="nw-footer__main">
        <div className="nw-footer__brand-block">
          <Link href="/" className="nw-brand nw-brand--footer">
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
          <p>Thoughtful essentials for life with pets.</p>
        </div>

        <div className="nw-footer__column">
          <span className="nw-footer__heading">Explore</span>
          <Link href="/shop">Shop all</Link>
          <Link href="/collections">Collections</Link>
          <Link href="/about">Our story</Link>
        </div>

        <div className="nw-footer__column">
          <span className="nw-footer__heading">Customer care</span>
          <Link href="/contact">Contact</Link>
          <Link href="/faq">FAQs</Link>
          <Link href="/shipping">Shipping</Link>
          <Link href="/returns">Returns</Link>
          <Link href="/track-order">Track an order</Link>
        </div>

        <div className="nw-footer__column">
          <span className="nw-footer__heading">Information</span>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </div>

      <div className="nw-footer__bottom">
        <span>© 2026 NELLWICK. All rights reserved.</span>
        <span>Made for the everyday moments with pets.</span>
      </div>
    </footer>
  );
}
