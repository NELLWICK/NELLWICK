import Link from "next/link";

function formatPrice(price, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(price) || 0);
}

export default function ProductCard({ product, index = 0 }) {
  const image = product.imageUrls?.find(Boolean);

  return (
    <article className="nw-product-card" style={{ "--card-index": index }}>
      <Link href={`/products/${product.slug}`} className="nw-product-card__visual">
        {image ? (
          <img src={image} alt={product.imageAlt || product.name} loading="lazy" />
        ) : (
          <span className="nw-product-card__placeholder" aria-hidden="true">
            <span>N.</span>
          </span>
        )}
        <span className="nw-product-card__open" aria-hidden="true">↗</span>
      </Link>
      <div className="nw-product-card__meta">
        <div>
          <span className="nw-product-card__category">{product.category}</span>
          <h3><Link href={`/products/${product.slug}`}>{product.shortName || product.name}</Link></h3>
        </div>
        <span className="nw-product-card__price">{formatPrice(product.price, product.currency)}</span>
      </div>
      <p>{product.shortDescription}</p>
      <Link className="nw-text-link" href={`/products/${product.slug}`}>Discover product <span aria-hidden="true">↗</span></Link>
    </article>
  );
}
