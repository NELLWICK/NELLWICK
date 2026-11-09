import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";

export default function StoreFrame({ children }) {
  return (
    <div className="nw-store-frame">
      <StoreHeader />
      {children}
      <StoreFooter />
    </div>
  );
}
