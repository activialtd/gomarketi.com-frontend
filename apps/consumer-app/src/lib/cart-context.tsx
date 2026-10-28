import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { Product } from "./types";

/**
 * A negotiated deal a cart line is bought on. The server checks all three at
 * checkout: the offer must still be accepted, price_kobo must equal the
 * agreed unit price, and the quantity can't exceed what the deal covers.
 */
export type CartDeal = {
  offerId: string;
  unitKobo: number;
  quantity: number;
};

export type CartLine = {
  key: string; // product.id | offer id
  product: Product;
  qty: number;
  deal?: CartDeal;
};

/** What one unit of this line costs — the agreed price on a deal line. */
export const lineUnitKobo = (line: CartLine) =>
  line.deal ? line.deal.unitKobo : line.product.priceKobo;

const lineKey = (p: Product, deal?: CartDeal) =>
  [p.id, deal?.offerId ?? ""].join("|");

type CartState = {
  items: CartLine[];
  count: number;
  /** Goods only. Shipping is added at checkout, once an area is chosen. */
  subtotalKobo: number;
  add: (p: Product, opts?: { qty?: number; deal?: CartDeal }) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartState | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);

  const add: CartState["add"] = (p, opts) => {
    const deal = opts?.deal;
    const key = lineKey(p, deal);
    const addQty = opts?.qty ?? 1;
    setItems((cur) => {
      // A deal line holds exactly the deal's quantity — adding it again
      // replaces it rather than stacking past what the vendor agreed to.
      if (deal) {
        const line: CartLine = { key, product: p, qty: deal.quantity, deal };
        return cur.some((i) => i.key === key)
          ? cur.map((i) => (i.key === key ? line : i))
          : [...cur, line];
      }
      const hit = cur.find((i) => i.key === key);
      return hit
        ? cur.map((i) => (i.key === key ? { ...i, qty: i.qty + addQty } : i))
        : [...cur, { key, product: p, qty: addQty }];
    });
  };

  const remove = (key: string) =>
    setItems((cur) => cur.filter((i) => i.key !== key));

  const setQty = (key: string, qty: number) =>
    qty <= 0
      ? remove(key)
      : setItems((cur) =>
          // Quantity on a deal line is locked to the deal.
          cur.map((i) => (i.key === key && !i.deal ? { ...i, qty } : i)),
        );

  const clear = () => setItems([]);

  const value = useMemo(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    // The cart knows what the goods cost and nothing else. Shipping is the
    // vendor's own price for a chosen area and is only known at checkout —
    // a placeholder fee here was once charged through Paystack without the
    // server ever agreeing to it.
    const subtotalKobo = items.reduce((n, i) => n + lineUnitKobo(i) * i.qty, 0);
    return {
      items,
      count,
      subtotalKobo,
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
