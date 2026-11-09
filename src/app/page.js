import Link from "next/link";
import { Suspense } from "react";
import HeroScene from "@/components/HeroScene";
import MotionMarquee from "@/components/MotionMarquee";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import { getStoreProducts } from "@/lib/catalogue";
import { homeMedia } from "@/data/siteMedia";

export const metadata = {
  title: "NELLWICK | Thoughtful Pet Essentials",
  description:
    "Thoughtful grooming and care essentials for everyday life with pets.",
};

function formatPrice(price, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(price) || 0);
}

function ProductArtwork({ product }) {
  const imageUrl = product.imageUrls?.find(Boolean);

  if (imageUrl) {
    return (
      <img
        className="home-product-image"
        src={imageUrl}
        alt={product.imageAlt || product.name}
        loading="lazy"
      />
    );
  }

  if (product.id === "NWL-PET-001") {
    return (
      <svg viewBox="0 0 320 300" fill="none" role="img" aria-label="Illustration of a pet grooming brush">
        <defs>
          <linearGradient id="homeBrushHandle" x1="120" y1="130" x2="210" y2="280">
            <stop stopColor="#B9E8C8" />
            <stop offset="1" stopColor="#6F9B83" />
          </linearGradient>
          <linearGradient id="homeBrushHead" x1="105" y1="50" x2="230" y2="170">
            <stop stopColor="#D7E5D8" />
            <stop offset="1" stopColor="#8EAC98" />
          </linearGradient>
        </defs>
        <g transform="rotate(-27 160 150)">
          <rect x="139" y="139" width="43" height="139" rx="21.5" fill="url(#homeBrushHandle)" />
          <rect x="105" y="49" width="111" height="119" rx="28" fill="url(#homeBrushHead)" />
          <rect x="115" y="59" width="91" height="99" rx="21" fill="#294D3C" />
          <path d="M139 166h44" stroke="#E8E8D9" strokeOpacity=".45" strokeWidth="2" />
          <path d="M150 225h21" stroke="#E8E8D9" strokeOpacity=".28" strokeWidth="2" strokeLinecap="round" />
          <g stroke="#C6D9C9" strokeWidth="2" strokeLinecap="round" opacity=".85">
            <path d="M130 77v19 M151 77v19 M172 77v19 M193 77v19" />
            <path d="M130 105v19 M151 105v19 M172 105v19 M193 105v19" />
            <path d="M130 133v8 M151 133v8 M172 133v8 M193 133v8" />
          </g>
        </g>
      </svg>
    );
  }

  if (product.id === "NWL-PET-002") {
    return (
      <svg viewBox="0 0 320 300" fill="none" role="img" aria-label="Illustration of a pet hair-removal glove">
        <defs>
          <linearGradient id="homeGloveBody" x1="93" y1="57" x2="236" y2="244">
            <stop stopColor="#71877A" />
            <stop offset="1" stopColor="#263D32" />
          </linearGradient>
          <linearGradient id="homeGlovePalm" x1="110" y1="120" x2="215" y2="232">
            <stop stopColor="#A8F0C6" stopOpacity=".6" />
            <stop offset="1" stopColor="#779B88" stopOpacity=".15" />
          </linearGradient>
        </defs>
        <path d="M110 238C91 234 79 218 82 198L92 123C94 107 106 99 118 104C127 108 130 117 128 128L131 87C132 70 146 61 159 66C170 70 173 81 171 93L171 111L178 66C180 50 195 44 207 51C218 57 220 68 216 82L209 120L225 86C231 72 246 70 257 79C267 88 265 101 258 115L231 194C222 220 199 237 171 242Z" fill="url(#homeGloveBody)" stroke="#B9DCC5" strokeOpacity=".55" strokeWidth="2" />
        <path d="M111 198C126 179 151 168 178 171C199 173 216 184 225 199L218 218C207 234 190 242 170 242L125 235C113 229 107 214 111 198Z" fill="url(#homeGlovePalm)" />
        <path d="M111 125L104 193 M148 82L145 157 M195 68L184 151 M242 91L210 163" stroke="#D8E9DA" strokeOpacity=".45" strokeWidth="2" strokeLinecap="round" />
        <path d="M128 215C146 224 179 228 205 213" stroke="#D8E9DA" strokeOpacity=".45" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  return <span className="home-product-monogram" aria-hidden="true">N.</span>;
}

function ProductCard({ product, index }) {
  return (
    <article className="product-card" style={{ "--card-index": index }}>
      <Link
        className="product-art product-art-link"
        href={`/products/${product.slug}`}
        aria-label={`View ${product.name}`}
      >
        <span className="product-tag">{product.category}</span>
        <ProductArtwork product={product} />
        <span className="home-product-open" aria-hidden="true">↗</span>
      </Link>

      <div className="product-details">
        <div className="home-product-copy">
          <div className="product-kicker">NELLWICK · {String(product.id).split("-").slice(-1)[0]}</div>
          <h3><Link href={`/products/${product.slug}`}>{product.shortName || product.name}</Link></h3>
          <p className="product-description">{product.shortDescription}</p>
          <div className="product-swatches" aria-label="Available colours">
            {product.variants.filter((variant) => variant.available).map((variant) => (
              <span
                className="swatch"
                key={variant.id}
                title={variant.label}
                aria-label={variant.label}
                style={{ backgroundColor: variant.color }}
              />
            ))}
          </div>
        </div>

        <div className="home-product-purchase">
          <div className="product-price">{formatPrice(product.price, product.currency)}</div>
          <Link className="home-product-arrow" href={`/products/${product.slug}`} aria-label={`Discover ${product.shortName || product.name}`}>
            ↗
          </Link>
        </div>
      </div>
    </article>
  );
}

async function HomeProductGrid() {
  const products = await getStoreProducts();

  if (!products.length) {
    return (
      <div className="home-catalogue-empty">
        <span className="eyebrow">THE COLLECTION IS BEING PREPARED</span>
        <p>We're getting the first NELLWICK essentials ready. Please check back soon.</p>
        <Link href="/about" className="story-link">
          Get to know NELLWICK <span aria-hidden="true">→</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}

function HomePageContent() {
  return (
    <div className="nw-store-frame site-shell" id="home">
      <div className="announcement">
        A little more care for the ones who make life better
      </div>

      <StoreHeader />

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">The NELLWICK way</div>

            <h1>
              A little less fur.
              <br />
              A lot more <em>together.</em>
            </h1>

            <p className="hero-description">
              Everyday grooming essentials for the little moments you share
              with the pets who make a house feel like home.
            </p>

            <div className="hero-actions">
              <Link className="button button-primary" href="/shop">
                Explore the collection
                <span className="button-arrow" aria-hidden="true">→</span>
              </Link>

              <Link className="button button-quiet" href="/about">
                Get to know us <span aria-hidden="true">↗</span>
              </Link>
            </div>

            <div className="hero-footnote">
              <span aria-hidden="true" />
              Made for the everyday moments that matter
            </div>
          </div>

          <div className="hero-visual" aria-label="NELLWICK brand imagery">
            <div className="hero-aura" aria-hidden="true" />

            <div className="hero-photo">
              {homeMedia.heroVideoUrl ? (
                <video
                  className="hero-photo-media"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={homeMedia.heroImageUrl || undefined}
                  aria-hidden="true"
                >
                  <source src={homeMedia.heroVideoUrl} type="video/mp4" />
                </video>
              ) : homeMedia.heroImageUrl ? (
                <img
                  className="hero-photo-media"
                  src={homeMedia.heroImageUrl}
                  alt="A golden retriever enjoying a quiet moment"
                  fetchPriority="high"
                />
              ) : null}

              <div className="hero-photo-label">
                <small>Good days, closely shared</small>
                For all the love
                <br />
                that comes with fur.
              </div>
            </div>

            <HeroScene />

            <div className="hero-side-note">
              <strong>More care.</strong>
              <span>For the ones who make every day brighter</span>
            </div>

            <div className="hero-index">01 — 03</div>
          </div>
        </section>

        <MotionMarquee
          label="NELLWICK brand messages"
          variant="marquee-hero"
          items={["GOOD CARE", "GOOD COMPANY", "LESS MESS", "MORE MOMENTS"]}
        />

        <section className="section" id="shop">
          <div className="section-heading">
            <div>
              <div className="eyebrow">The first little things</div>
              <h2>Small tools. Better everyday moments.</h2>
            </div>
            <div className="home-section-aside">
              <p>A considered start to a collection of useful essentials for life with the pets you love.</p>
              <Link href="/shop" className="story-link">Shop all essentials <span aria-hidden="true">→</span></Link>
            </div>
          </div>

          <Suspense fallback={
            <div className="home-catalogue-empty" aria-live="polite" aria-busy="true">
              <span className="eyebrow">THE COLLECTION IS COMING INTO VIEW</span>
              <p>Loading the latest NELLWICK essentials…</p>
            </div>
          }>
            <HomeProductGrid />
          </Suspense>
        </section>

        <MotionMarquee
          label="Grooming and everyday care"
          variant="marquee-products"
          items={["GROOM", "CONNECT", "CARE", "REPEAT", "MAKE IT A MOMENT"]}
        />

        <section className="story-section" id="story">
          <div className="story-art" role="img" aria-label="A close-up portrait of a happy family dog">
            {homeMedia.storyImageUrl ? (
              <img className="story-art-media" src={homeMedia.storyImageUrl} alt="A happy dog enjoying a quiet moment" loading="lazy" />
            ) : null}
            <div className="story-art-caption">The little things are never really little.</div>
          </div>

          <div className="story-copy">
            <div className="eyebrow">A thought behind the name</div>
            <h2>
              Life with pets is full of little things.
              <br />
              <em>We care about those.</em>
            </h2>
            <p>
              The welcome at the door. The favourite spot on the sofa.
              The familiar sound of paws coming your way.
            </p>
            <p>
              NELLWICK is being built around the everyday side of life with
              pets: practical essentials, considered choices and a little
              more care in the routines we share.
            </p>
            <Link className="story-link" href="/about">
              Get to know NELLWICK <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        <MotionMarquee
          label="The NELLWICK philosophy"
          variant="marquee-story"
          items={["LIFE WITH PETS", "THE LITTLE THINGS", "MORE TOGETHER", "EVERYDAY JOY"]}
        />

        <section className="values-section" id="values">
          <article className="value-item">
            <div className="value-number">01</div>
            <h3>Useful by nature</h3>
            <p>Everyday pieces should have a purpose and make sense in real life with pets.</p>
          </article>
          <article className="value-item">
            <div className="value-number">02</div>
            <h3>Thoughtfully chosen</h3>
            <p>We want to grow the collection with care, not fill it with things that do not belong.</p>
          </article>
          <article className="value-item">
            <div className="value-number">03</div>
            <h3>Made for together</h3>
            <p>The best part of caring for a pet is the bond built in all those ordinary moments.</p>
          </article>
        </section>

        <MotionMarquee
          label="NELLWICK brand signature"
          variant="marquee-signature"
          items={["THOUGHTFUL ESSENTIALS", "MADE FOR LIFE WITH PETS", "A LITTLE MORE CARE"]}
        />

        <section className="section faq-section" id="faq">
          <div className="faq-intro">
            <div className="eyebrow">A few good questions</div>
            <h2>Good to know.</h2>
            <p>A little more about the thinking behind NELLWICK and the collection.</p>
            <Link className="story-link" href="/faq">Visit our help centre <span aria-hidden="true">→</span></Link>
          </div>

          <div className="faq-list">
            <details>
              <summary>What is NELLWICK all about?</summary>
              <p>NELLWICK is a pet essentials brand focused on practical grooming and care products for everyday life with pets.</p>
            </details>
            <details>
              <summary>What can I find in the first collection?</summary>
              <p>The opening collection starts with a grooming brush and a reusable hair-removal glove. The range will grow carefully as we find more useful essentials.</p>
            </details>
            <details>
              <summary>How do I choose the right grooming tool?</summary>
              <p>Think about your pet&apos;s coat, the kind of grooming you do and what feels comfortable for both of you. Always follow the product instructions and use a gentle touch.</p>
            </details>
          </div>
        </section>
      </main>

      <StoreFooter />
    </div>
  );
}

export default function Home() {
  return <HomePageContent />;
}
