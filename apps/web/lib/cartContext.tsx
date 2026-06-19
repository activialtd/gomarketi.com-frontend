"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { Product, Variant } from "./data/products";

export type CartLine = {
  lineId: string; 
  productId: string;
  productName: string;
  productImage: string;
  variantId?: string;
  variantLabel?: string;
  unitPrice: number; // kobo
  quantity: number;
  maxStock: number;
};

export type CustomerInfo = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  note?: string;
};

type CartContextValue = {
  lines: CartLine[];
  customer: CustomerInfo | null;
  addToCart: (
    product: Product,
    variant: Variant | undefined,
    quantity: number,
  ) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;
  setCustomer: (info: CustomerInfo) => void;
  subtotal: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [customer, setCustomerState] = useState<CustomerInfo | null>(null);

  const addToCart = useCallback(
    (product: Product, variant: Variant | undefined, quantity: number) => {
      const lineId = variant ? `${product.id}__${variant.id}` : product.id;
      const unitPrice = variant?.price ?? product.price;
      const maxStock = variant?.stock ?? product.stock;
      const variantLabel = variant
        ? Object.entries(variant.options)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" / ")
        : undefined;

      setLines((prev) => {
        const existing = prev.find((l) => l.lineId === lineId);
        if (existing) {
          const newQty = Math.min(existing.quantity + quantity, maxStock);
          return prev.map((l) =>
            l.lineId === lineId ? { ...l, quantity: newQty } : l,
          );
        }
        return [
          ...prev,
          {
            lineId,
            productId: product.id,
            productName: product.name,
            productImage: product.images[0] ?? "",
            variantId: variant?.id,
            variantLabel,
            unitPrice,
            quantity: Math.min(quantity, maxStock),
            maxStock,
          },
        ];
      });
    },
    [],
  );

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    setLines((prev) =>
      prev.map((l) =>
        l.lineId === lineId
          ? { ...l, quantity: Math.max(1, Math.min(quantity, l.maxStock)) }
          : l,
      ),
    );
  }, []);

  const removeLine = useCallback((lineId: string) => {
    setLines((prev) => prev.filter((l) => l.lineId !== lineId));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const setCustomer = useCallback(
    (info: CustomerInfo) => setCustomerState(info),
    [],
  );

  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
    [lines],
  );
  const itemCount = useMemo(
    () => lines.reduce((s, l) => s + l.quantity, 0),
    [lines],
  );

  return (
    <CartContext.Provider
      value={{
        lines,
        customer,
        addToCart,
        updateQuantity,
        removeLine,
        clearCart,
        setCustomer,
        subtotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
