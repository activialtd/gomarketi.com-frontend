"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

// Minimal type for our real API products — no mock dependency
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

type CartContextValue = {
  lines: CartLine[];
  customer: CustomerInfo | null;
  addToCart: (product: StorefrontCartProduct, quantity?: number) => void;
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

  const addToCart = useCallback((product: StorefrontCartProduct, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.lineId === product.id);
      if (existing) {
        return prev.map((l) =>
          l.lineId === product.id ? { ...l, quantity: l.quantity + quantity } : l,
        );
      }
      return [
        ...prev,
        {
          lineId: product.id,
          productId: product.id,
          productName: product.name,
          productImage: product.images[0] ?? "",
          unitPrice: product.price_kobo,
          quantity,
          isDigital: product.is_digital,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    if (quantity < 1) return;
    setLines((prev) =>
      prev.map((l) => (l.lineId === lineId ? { ...l, quantity } : l)),
    );
  }, []);

  const removeLine = useCallback(
    (lineId: string) => setLines((prev) => prev.filter((l) => l.lineId !== lineId)),
    [],
  );

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
      value={{ lines, customer, addToCart, updateQuantity, removeLine, clearCart, setCustomer, subtotal, itemCount }}
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
