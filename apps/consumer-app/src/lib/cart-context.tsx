import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { Product } from "./mock-products";

export type CartLine = {
  key: string; // product.id | variant | size
  product: Product;
  qty: number;
  variant?: string;
  size?: string;
};

/** TODO(backend): real pricing/currency from API. Display-only NGN rate. */
export const NGN_RATE = 1500;
export const toNaira = (usd: number) => Math.round(usd * NGN_RATE);
export const formatNaira = (usd: number) => `₦${toNaira(usd).toLocaleString()}`;

const lineKey = (p: Product, variant?: string, size?: string) =>
  [p.id, variant ?? "", size ?? ""].join("|");

type CartState = {
  items: CartLine[];
  count: number;
  subtotalUsd: number;
  deliveryUsd: number;
  totalUsd: number;
  add: (
    p: Product,
    opts?: { variant?: string; size?: string; qty?: number },
  ) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartState | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);

  const add: CartState["add"] = (p, opts) => {
    const key = lineKey(p, opts?.variant, opts?.size);
    const addQty = opts?.qty ?? 1;
    setItems((cur) => {
      const hit = cur.find((i) => i.key === key);
      return hit
        ? cur.map((i) => (i.key === key ? { ...i, qty: i.qty + addQty } : i))
        : [
            ...cur,
            {
              key,
              product: p,
              qty: addQty,
              variant: opts?.variant,
              size: opts?.size,
            },
          ];
    });
  };

  const remove = (key: string) =>
    setItems((cur) => cur.filter((i) => i.key !== key));

  const setQty = (key: string, qty: number) =>
    qty <= 0
      ? remove(key)
      : setItems((cur) => cur.map((i) => (i.key === key ? { ...i, qty } : i)));

  const clear = () => setItems([]);

  const value = useMemo(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotalUsd = items.reduce((n, i) => n + i.product.price * i.qty, 0);
    const deliveryUsd = items.length ? 1.5 : 0; // TODO(backend): quoted fee
    return {
      items,
      count,
      subtotalUsd,
      deliveryUsd,
      totalUsd: subtotalUsd + deliveryUsd,
      add,
      remove,
      setQty,
      clear,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
