import { Suspense } from "react";
import { notFound } from "next/navigation";
import StoreFrame from "@/components/StoreFrame";
import ProductDetails from "@/components/ProductDetails";
import { getStoreProductBySlug, getStoreProductsBySlugs } from "@/lib/catalogue";
import "./product-page.css";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);
  if (!product) return { title: "Product not found | NELLWICK" };
  return {
    title: product.seo?.title || `${product.name} | NELLWICK`,
    description: product.seo?.description || product.shortDescription,
  };
}

async function ProductContent({ params }) {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);
  if (!product) notFound();

  const relatedProducts = await getStoreProductsBySlugs(product.relatedProductSlugs || []);

  return <ProductDetails product={product} relatedProducts={relatedProducts} />;
}

export default function ProductPage({ params }) {
  return (
    <StoreFrame>
      <Suspense fallback={<main className="nw-page" aria-busy="true"><p className="nw-eyebrow">Preparing this NELLWICK product…</p></main>}>
        <ProductContent params={params} />
      </Suspense>
    </StoreFrame>
  );
}
