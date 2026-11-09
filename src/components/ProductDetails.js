"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";

function formatPrice(price, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(price) || 0);
}

function getVideoEmbedUrl(url, type) {
  if (!url) return "";
  if (type === "youtube") {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/);
    return match ? `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0&modestbranding=1` : "";
  }
  if (type === "vimeo") {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : "";
  }
  return "";
}

function ProductImage({ src, alt, className = "", loading = "lazy" }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className={`nw-product-image-fallback ${className}`} aria-label={alt || "Product image unavailable"}>
      <span>N.</span>
      <small>Product image</small>
    </div>;
  }
  return <img className={className} src={src} alt={alt || "NELLWICK product"} loading={loading} onError={() => setFailed(true)} />;
}

function VideoPanel({ url, type, poster, title }) {
  if (!url) return null;
  const embedUrl = getVideoEmbedUrl(url, type);
  return (
    <section className="nw-product-film" aria-label="Product video">
      <div className="nw-product-section-heading">
        <span className="nw-product-eyebrow">SEE IT IN USE</span>
        <h2>A closer look.</h2>
      </div>
      <div className="nw-product-film__frame">
        {type === "mp4" ? (
          <video controls playsInline preload="metadata" poster={poster || undefined}>
            <source src={url} type="video/mp4" />
            Your browser does not support this video.
          </video>
        ) : embedUrl ? (
          <iframe
            src={embedUrl}
            title={`${title} product video`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <p className="nw-product-film__error">The video link could not be displayed. Please check the media URL in your store catalogue.</p>
        )}
      </div>
    </section>
  );
}

export default function ProductDetails({ product, relatedProducts = [] }) {
  const { addItem } = useCart();
  const router = useRouter();
  const availableVariants = useMemo(
    () => (product.variants || []).filter((variant) => variant.available),
    [product.variants]
  );
  const [selectedVariantId, setSelectedVariantId] = useState(availableVariants[0]?.id || "");
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedVariant = availableVariants.find((variant) => variant.id === selectedVariantId) || availableVariants[0] || null;
  const variantImages = selectedVariant?.imageUrls || [];
  const baseImages = product.imageUrls || [];
  // Variant-specific images take priority so a colour change updates the gallery.
  const galleryImages = variantImages.length ? variantImages : baseImages;
  const activePrice = selectedVariant?.price ?? product.price;
  const videoUrl = selectedVariant?.videoUrl || product.videoUrl || "";
  const videoType = selectedVariant?.videoUrl ? selectedVariant.videoType : product.videoType;
  const videoPoster = product.videoPosterUrl || galleryImages[0] || "";

  useEffect(() => {
    setActiveImage(0);
    setAdded(false);
  }, [selectedVariantId]);

  function selectVariant(variant) {
    setSelectedVariantId(variant.id);
    setActiveImage(0);
    setAdded(false);
  }

  function addSelectedVariantToCart() {
    if (!selectedVariant) return false;
    // Preserve the selected variant's image and price in the cart line.
    addItem(
      { ...product, price: activePrice, imageUrls: galleryImages },
      { ...selectedVariant, imageUrls: galleryImages },
      quantity
    );
    setAdded(true);
    return true;
  }

  function handleAddToCart() {
    addSelectedVariantToCart();
  }

  function handleBuyNow() {
    if (!addSelectedVariantToCart()) return;
    router.push("/checkout");
  }

  const productFaqs = product.faqs || [];
  const detailSections = product.detailSections || [];
  const featureCards = product.featureCards || [];
  const specifications = product.specifications || [];

  return (
    <main className="nw-product-page">
      <nav className="nw-product-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>/</span><Link href="/shop">Shop</Link><span>/</span><span aria-current="page">{product.shortName || product.name}</span>
      </nav>

      <section className="nw-product-hero">
        <div className="nw-product-gallery">
          <div className="nw-product-gallery__main">
            <div className="nw-product-gallery__aura" aria-hidden="true" />
            {galleryImages.length ? (
              <ProductImage
                key={`${selectedVariant?.id || "product"}-${galleryImages[activeImage]}`}
                src={galleryImages[activeImage]}
                alt={`${selectedVariant?.label ? `${selectedVariant.label} — ` : ""}${product.imageAlt || product.name}`}
                className="nw-product-gallery__image"
                loading="eager"
              />
            ) : (
              <div className="nw-product-gallery__empty">
                <span className="nw-product-gallery__monogram">N.</span>
                <strong>{product.shortName || product.name}</strong>
                <small>Product photography will appear here</small>
              </div>
            )}
            <div className="nw-product-gallery__counter">
              {galleryImages.length ? `${String(activeImage + 1).padStart(2, "0")} / ${String(galleryImages.length).padStart(2, "0")}` : "NELLWICK"}
            </div>
            {selectedVariant?.label && <div className="nw-product-gallery__variant-label">{selectedVariant.label}</div>}
          </div>

          {galleryImages.length > 1 && (
            <div className="nw-product-thumbnails" aria-label="Product images">
              {galleryImages.map((image, index) => (
                <button key={`${image}-${index}`} type="button" className={`nw-product-thumbnail ${activeImage === index ? "is-active" : ""}`} onClick={() => setActiveImage(index)} aria-label={`Show image ${index + 1}`} aria-pressed={activeImage === index}>
                  <ProductImage src={image} alt="" />
                </button>
              ))}
            </div>
          )}
          <p className="nw-product-gallery__caption">Images shown are for the selected product option when variant-specific photography is available.</p>
        </div>

        <div className="nw-product-buy-panel">
          <span className="nw-product-eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="nw-product-short-description">{product.shortDescription}</p>
          <div className="nw-product-price-row">
            <strong>{formatPrice(activePrice, product.currency || "USD")}</strong>
            <span>USD</span>
          </div>

          <div className="nw-product-divider" />

          {availableVariants.length > 0 && (
            <div className="nw-product-option-block">
              <div className="nw-product-option-heading">
                <span>{selectedVariant?.optionName || "Choose an option"}</span>
                <strong>{selectedVariant?.label}</strong>
              </div>
              <div className="nw-variant-grid" role="group" aria-label={`Choose ${selectedVariant?.optionName || "product variant"}`}>
                {availableVariants.map((variant) => {
                  const variantImage = variant.imageUrls?.[0] || "";
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      className={`nw-variant-choice ${isSelected ? "is-selected" : ""}`}
                      onClick={() => selectVariant(variant)}
                      aria-pressed={isSelected}
                      aria-label={`Choose ${variant.label}`}
                    >
                      {variantImage ? (
                        <ProductImage src={variantImage} alt="" className="nw-variant-choice__image" />
                      ) : (
                        <span className="nw-variant-choice__swatch" style={{ backgroundColor: variant.color || "#779B88" }} />
                      )}
                      <span className="nw-variant-choice__label">{variant.label}</span>
                      {variant.price !== product.price && <small>{formatPrice(variant.price, product.currency || "USD")}</small>}
                      {isSelected && <span className="nw-variant-choice__check" aria-hidden="true">✓</span>}
                    </button>
                  );
                })}
              </div>
              {selectedVariant?.imageUrls?.length > 0 && (
                <p className="nw-product-variant-note">The gallery is showing images for {selectedVariant.label}.</p>
              )}
            </div>
          )}

          <div className="nw-product-option-block">
            <div className="nw-product-option-heading"><span>Quantity</span><strong>{quantity}</strong></div>
            <div className="nw-product-quantity">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1} aria-label="Decrease quantity">−</button>
              <span aria-live="polite">{quantity}</span>
              <button type="button" onClick={() => setQuantity((value) => Math.min(10, value + 1))} disabled={quantity >= 10} aria-label="Increase quantity">+</button>
            </div>
          </div>

          <div className="nw-product-buy-actions">
            <button type="button" className="nw-product-buy-now" onClick={handleBuyNow} disabled={!selectedVariant}>
              <span>Buy now</span><span aria-hidden="true">→</span>
            </button>
            <button type="button" className="nw-product-add" onClick={handleAddToCart} disabled={!selectedVariant}>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 1.9-1.4L21 8H6" />
                <circle cx="10" cy="20" r="1.25" />
                <circle cx="18" cy="20" r="1.25" />
              </svg>
              <span>{added ? "Added to cart" : "Add to cart"}</span>
            </button>
          </div>
          {added && <div className="nw-product-added" role="status"><span>{quantity} × {selectedVariant?.label} added to your cart.</span><Link href="/cart">View cart →</Link></div>}
          <div className="nw-product-assurance"><span>Thoughtfully selected</span><span>Secure checkout after launch</span></div>

          {product.highlights?.length > 0 && (
            <div className="nw-product-highlights">
              {product.highlights.map((highlight) => <div key={highlight}><span>✳</span>{highlight}</div>)}
            </div>
          )}
        </div>
      </section>

      <section className="nw-product-overview">
        <div className="nw-product-overview__intro">
          <span className="nw-product-eyebrow">THE NELLWICK DETAIL</span>
          <h2>Everyday care,<br /><em>thoughtfully considered.</em></h2>
          <p>{product.description}</p>
        </div>
        {featureCards.length > 0 && (
          <div className="nw-product-feature-grid">
            {featureCards.map((feature, index) => (
              <article className="nw-product-feature" key={`${feature.title}-${index}`}>
                <span className="nw-product-feature__number">0{index + 1}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <VideoPanel url={videoUrl} type={videoType} poster={videoPoster} title={product.name} />

      {detailSections.length > 0 && (
        <section className="nw-product-editorial-sections">
          {detailSections.map((section, index) => (
            <article className="nw-product-editorial" key={`${section.title}-${index}`}>
              <span className="nw-product-editorial__index">0{index + 1}</span>
              <div><h2>{section.title}</h2><p>{section.body}</p></div>
            </article>
          ))}
        </section>
      )}

      {(product.howToUse || product.careInstructions) && (
        <section className="nw-product-guides">
          {product.howToUse && <article><span className="nw-product-eyebrow">A GENTLE GUIDE</span><h2>How to use it</h2><p>{product.howToUse}</p></article>}
          {product.careInstructions && <article><span className="nw-product-eyebrow">KEEP IT READY</span><h2>Care instructions</h2><p>{product.careInstructions}</p></article>}
        </section>
      )}

      {(specifications.length > 0 || product.whatIsIncluded?.length > 0) && (
        <section className="nw-product-specifications">
          <div className="nw-product-section-heading"><span className="nw-product-eyebrow">GOOD TO KNOW</span><h2>The details.</h2></div>
          <div className="nw-product-specifications__grid">
            {specifications.length > 0 && <div className="nw-product-spec-table">{specifications.map((spec) => <div key={spec.label}><span>{spec.label}</span><strong>{spec.value}</strong></div>)}</div>}
            {product.whatIsIncluded?.length > 0 && <div className="nw-product-included"><h3>What's included</h3><ul>{product.whatIsIncluded.map((item) => <li key={item}>{item}</li>)}</ul></div>}
          </div>
        </section>
      )}

      {(product.shippingNote || product.returnsNote) && (
        <section className="nw-product-policies">
          {product.shippingNote && <article><span className="nw-product-eyebrow">DELIVERY</span><h3>Shipping information</h3><p>{product.shippingNote}</p><Link href="/shipping">Read shipping information →</Link></article>}
          {product.returnsNote && <article><span className="nw-product-eyebrow">PEACE OF MIND</span><h3>Returns information</h3><p>{product.returnsNote}</p><Link href="/returns">Read the returns policy →</Link></article>}
        </section>
      )}

      {productFaqs.length > 0 && (
        <section className="nw-product-faq">
          <div className="nw-product-section-heading"><span className="nw-product-eyebrow">QUESTIONS, ANSWERED</span><h2>A few things to know.</h2></div>
          <div className="nw-product-faq__list">
            {productFaqs.map((faq, index) => <details key={`${faq.question}-${index}`}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
          </div>
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="nw-product-related">
          <div className="nw-product-section-heading"><span className="nw-product-eyebrow">COMPLETE THE ROUTINE</span><h2>More thoughtful essentials.</h2></div>
          <div className="nw-product-related__grid">
            {relatedProducts.map((related) => (
              <Link href={`/products/${related.slug}`} className="nw-product-related-card" key={related.id}>
                <div className="nw-product-related-card__image">{related.imageUrls?.[0] ? <ProductImage src={related.imageUrls[0]} alt={related.imageAlt || related.name} /> : <span>N.</span>}</div>
                <div><span>{related.category}</span><h3>{related.shortName || related.name}</h3></div>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
