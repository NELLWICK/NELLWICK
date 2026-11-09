"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "nellwick_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem(STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setItems(parsedCart.filter((item) =>
            item && typeof item.key === "string" &&
            typeof item.name === "string" && typeof item.slug === "string" &&
            Number.isFinite(Number(item.price)) && Number(item.quantity) > 0
          ));
        }
      }
    } catch (error) {
      console.error("Unable to load the saved NELLWICK cart:", error);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Unable to save the NELLWICK cart:", error);
    }
  }, [items, hydrated]);

  const addItem = useCallback((product, variant, quantity = 1) => {
    if (!product || !variant) return;
    const safeQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
    const key = `${product.id}:${variant.id}`;

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.key === key);
      if (existingItem) {
        return currentItems.map((item) => item.key === key
          ? { ...item, quantity: Math.min(99, item.quantity + safeQuantity) }
          : item);
      }
      return [...currentItems, {
        key,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: Number(product.price),
        currency: product.currency || "USD",
        imageUrl: variant.imageUrls?.[0] || variant.imageUrl || product.imageUrls?.[0] || "",
        variantId: variant.id,
        variantLabel: variant.label,
        quantity: Math.min(99, safeQuantity),
      }];
    });
  }, []);

  const updateQuantity = useCallback((key, quantity) => {
    const safeQuantity = Math.floor(Number(quantity));
    if (!Number.isFinite(safeQuantity) || safeQuantity < 1 || safeQuantity > 99) return;
    setItems((currentItems) => currentItems.map((item) =>
      item.key === key ? { ...item, quantity: safeQuantity } : item
    ));
  }, []);

  const removeItem = useCallback((key) => {
    setItems((currentItems) => currentItems.filter((item) => item.key !== key));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const itemCount = useMemo(() => items.reduce((total, item) => total + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((total, item) => total + Number(item.price) * item.quantity, 0), [items]);

  const value = useMemo(() => ({
    items, itemCount, subtotal, hydrated,
    addItem, updateQuantity, removeItem, clearCart,
  }), [items, itemCount, subtotal, hydrated, addItem, updateQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider.");
  return context;
}
