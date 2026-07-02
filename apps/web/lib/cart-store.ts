'use client';
// Zustand-based per-slug cart store.
// REQUIRES: pnpm add zustand --filter web
// Until zustand is installed, the app uses lib/cartContext.tsx (React Context).
// This file will become active once zustand is added to apps/web/package.json.

import type { CartItem } from './storefront-api';

interface CartStore {
  /** Keyed by storeSlug so each storefront has its own cart */
  carts: Record<string, CartItem[]>;
  addItem: (slug: string, item: CartItem) => void;
  removeItem: (slug: string, productId: string) => void;
  updateQty: (slug: string, productId: string, qty: number) => void;
  clearCart: (slug: string) => void;
  getCart: (slug: string) => CartItem[];
  getTotal: (slug: string) => number;
  getCount: (slug: string) => number;
}

// Stub implementation — replace with actual zustand once the dep is added:
//
//   import { create } from 'zustand';
//   import { persist } from 'zustand/middleware';
//
//   export const useCartStore = create<CartStore>()(
//     persist(
//       (set, get) => ({
//         carts: {},
//         addItem: (slug, item) => set((s) => { ... }),
//         ...
//       }),
//       { name: 'gm-cart' },
//     ),
//   );

let _state: CartStore['carts'] = {};

function getCart(slug: string): CartItem[] {
  return _state[slug] ?? [];
}

/** Lightweight in-memory fallback — loses data on refresh until zustand is wired. */
export const useCartStore = (): CartStore => ({
  carts: _state,
  addItem: (slug, item) => {
    const cart = [...(_state[slug] ?? [])];
    const idx = cart.findIndex((i) => i.product_id === item.product_id);
    if (idx >= 0) {
      cart[idx] = { ...cart[idx], quantity: cart[idx].quantity + item.quantity };
    } else {
      cart.push(item);
    }
    _state = { ..._state, [slug]: cart };
  },
  removeItem: (slug, id) => {
    _state = {
      ..._state,
      [slug]: (_state[slug] ?? []).filter((i) => i.product_id !== id),
    };
  },
  updateQty: (slug, id, qty) => {
    _state = {
      ..._state,
      [slug]:
        qty <= 0
          ? (_state[slug] ?? []).filter((i) => i.product_id !== id)
          : (_state[slug] ?? []).map((i) =>
              i.product_id === id ? { ...i, quantity: qty } : i,
            ),
    };
  },
  clearCart: (slug) => {
    _state = { ..._state, [slug]: [] };
  },
  getCart,
  getTotal: (slug) =>
    getCart(slug).reduce((sum, i) => sum + i.price_kobo * i.quantity, 0),
  getCount: (slug) => getCart(slug).reduce((sum, i) => sum + i.quantity, 0),
});
