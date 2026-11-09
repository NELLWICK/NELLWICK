import { Suspense } from "react";
import StoreFrame from "@/components/StoreFrame";
import PageIntro from "@/components/PageIntro";
import ProductCard from "@/components/ProductCard";
import { getStoreProducts } from "@/lib/catalogue";
import { collections, getCollectionBySlug } from "@/data/collections";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return collections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  return {
    title: collection ? `${collection.title} | NELLWICK` : "Collection not found | NELLWICK",
    description: collection?.description || "Explore NELLWICK pet-care essentials.",
  };
}

async function CollectionContent({ params }) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) notFound();

  const products = await getStoreProducts();
  const collectionProducts = collection.productSlugs
    .map((productSlug) => products.find((product) => product.slug === productSlug))
    .filter(Boolean);

  return (
    <main className="nw-page">
      <PageIntro eyebrow={collection.eyebrow} title={collection.title} description={collection.description} />
      {collectionProducts.length ? (
        <div className="nw-product-grid">
          {collectionProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      ) : (
        <div className="nw-empty-state">
          <h2>More thoughtful essentials are on the way.</h2>
          <p>We are carefully growing this collection.</p>
        </div>
      )}
    </main>
  );
}

export default function CollectionPage({ params }) {
  return (
    <StoreFrame>
      <Suspense fallback={<main className="nw-page" aria-busy="true"><p className="nw-eyebrow">Loading this collection…</p></main>}>
        <CollectionContent params={params} />
      </Suspense>
    </StoreFrame>
  );
}
