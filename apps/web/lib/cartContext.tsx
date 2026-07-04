"use client";

import { createContext, useContext, useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type StorefrontCartProduct = {
  id: string;
  name: string;
  price_kobo: number;
  images: string[];
  is_digital: boolean;
};

export type CartLine = {
  lineId: string;
  productId: string;
  productName: string;
  productImage: string;
  unitPrice: number; // kobo
  quantity: number;
  isDigital: boolean;
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

// ── Zustand store (persisted to localStorage) ────────────────────────────────

type CartStore = {
  lines: CartLine[];
  customer: CustomerInfo | null;
  addToCart: (product: StorefrontCartProduct, quantity?: number) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;
  setCustomer: (info: CustomerInfo) => void;
};

const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      lines: [],
      customer: null,

      addToCart(product, quantity = 1) {
        set((s) => {
          const existing = s.lines.find((l) => l.lineId === product.id);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.lineId === product.id
                  ? { ...l, quantity: l.quantity + quantity }
                  : l,
              ),
            };
          }
          return {
            lines: [
              ...s.lines,
              {
                lineId: product.id,
                productId: product.id,
                productName: product.name,
                productImage: product.images[0] ?? "",
                unitPrice: product.price_kobo,
                quantity,
                isDigital: product.is_digital,
              },
            ],
          };
        });
      },

      updateQuantity(lineId, quantity) {
        if (quantity < 1) return;
        set((s) => ({
          lines: s.lines.map((l) =>
            l.lineId === lineId ? { ...l, quantity } : l,
          ),
        }));
      },

      removeLine(lineId) {
        set((s) => ({ lines: s.lines.filter((l) => l.lineId !== lineId) }));
      },

      clearCart() {
        set({ lines: [] });
      },

      setCustomer(info) {
        set({ customer: info });
      },
    }),
    {
      name: "gm-storefront-cart",
      partialize: (s) => ({ lines: s.lines, customer: s.customer }),
    },
  ),
);

// ── Context (keeps same API surface for all consumers) ───────────────────────

type CartContextValue = CartStore & {
  subtotal: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const store = useCartStore();

  const subtotal = useMemo(
    () => store.lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
    [store.lines],
  );
  const itemCount = useMemo(
    () => store.lines.reduce((s, l) => s + l.quantity, 0),
    [store.lines],
  );

  const value = useMemo(
    () => ({ ...store, subtotal, itemCount }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, subtotal, itemCount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
