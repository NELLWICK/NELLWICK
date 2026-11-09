import { Suspense } from "react";
import StoreFrame from "@/components/StoreFrame";
import PageIntro from "@/components/PageIntro";
import ProductCard from "@/components/ProductCard";
import { getStoreProducts } from "@/lib/catalogue";

export const metadata = {
  title: "Shop Pet Care Essentials | NELLWICK",
  description: "Explore thoughtful grooming and everyday pet-care essentials from NELLWICK.",
};

async function ShopContent() {
  const products = await getStoreProducts();

  return (
    <main className="nw-page">
      <PageIntro
        eyebrow="THE NELLWICK EDIT"
        title={<>Good care begins<br />with the little things.</>}
        description="Explore useful essentials chosen to make everyday life with pets a little easier."
      />
      <div className="nw-shop-toolbar">
        <span>{products.length} products</span>
        <span>Thoughtful essentials, selected with care</span>
      </div>
      {products.length ? (
        <div className="nw-product-grid">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      ) : (
        <div className="nw-empty-state">
          <span className="nw-eyebrow">COMING INTO VIEW</span>
          <h2>Our first essentials are being prepared.</h2>
          <p>Products appear here after they are validated, published and synchronised to the NELLWICK catalogue.</p>
        </div>
      )}
      <div className="nw-bottom-note">
        <span className="nw-eyebrow">A NOTE FROM NELLWICK</span>
        <p>We believe good pet care is built from small, thoughtful moments. We are starting with a focused collection and will grow it carefully.</p>
      </div>
    </main>
  );
}

export default function ShopPage() {
  return (
    <StoreFrame>
      <Suspense fallback={<main className="nw-page" aria-busy="true"><p className="nw-eyebrow">Loading the NELLWICK collection…</p></main>}>
        <ShopContent />
      </Suspense>
    </StoreFrame>
  );
}
