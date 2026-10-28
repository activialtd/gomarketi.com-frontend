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
  // ── Negotiated lines only ──
  // A deal agreed through "Make an offer". It sits in the cart as its own
  // line (lineId `offer:<id>`), so the same product can be there twice: once
  // at the deal price, once at the list price. The orders service re-checks
  // all of this at checkout — these fields are for showing it and for
  // catching a mismatch before the buyer gets to Paystack.
  offerId?: string;
  /** The list price the deal was struck against, shown struck through. */
  listUnitPrice?: number;
  /** The deal belongs to this email; checkout must use the same one. */
  offerEmail?: string;
  /** RFC3339 — the deal lapses after this. */
  offerExpiresAt?: string;
};

/** What a cart line needs from an accepted offer. */
export type CartOffer = {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  list_price_kobo: number;
  agreed_kobo?: number;
  quantity: number;
  customer_email: string;
  expires_at: string;
};

export function offerLineId(offerId: string) {
  return `offer:${offerId}`;
}

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
  /** Adds (or refreshes) an accepted deal; quantity is the deal's, locked. */
  addOfferToCart: (offer: CartOffer, isDigital: boolean) => void;
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

      addOfferToCart(offer, isDigital) {
        if (offer.agreed_kobo == null) return;
        const line: CartLine = {
          lineId: offerLineId(offer.id),
          productId: offer.product_id,
          productName: offer.product_name,
          productImage: offer.product_image ?? "",
          unitPrice: offer.agreed_kobo,
          quantity: offer.quantity,
          isDigital,
          offerId: offer.id,
          listUnitPrice: offer.list_price_kobo,
          offerEmail: offer.customer_email,
          offerExpiresAt: offer.expires_at,
        };
        set((s) => {
          // Pressing "Buy" twice must not double the deal — the server only
          // honours it up to the agreed quantity — so replace, never add.
          const exists = s.lines.some((l) => l.lineId === line.lineId);
          return {
            lines: exists
              ? s.lines.map((l) => (l.lineId === line.lineId ? line : l))
              : [...s.lines, line],
          };
        });
      },

      updateQuantity(lineId, quantity) {
        if (quantity < 1) return;
        set((s) => ({
          lines: s.lines.map((l) =>
            // A negotiated line's quantity is the deal's: the price was agreed
            // for exactly that many, so it does not move.
            l.lineId === lineId && !l.offerId ? { ...l, quantity } : l,
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
