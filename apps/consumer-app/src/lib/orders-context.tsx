import React, { createContext, useContext, useState, ReactNode } from "react";
import { CartLine } from "./cart-context";

export type OrderStatus =
  "confirmed" | "preparing" | "on_the_way" | "delivered";

export type Order = {
  id: string; // real backend order id — one per vendor store
  reference: string; // shared Paystack reference across every order in one checkout
  items: CartLine[]; // this order's slice of the cart (one store's items only)
  totalUsd: number;
  address: string;
  status: OrderStatus;
  placedAt: number;
  storeId?: string;
  storeName?: string;
};

type OrdersState = {
  orders: Order[];
  // Registers N real backend-created orders from one checkout (one per
  // vendor store) in a single state update.
  registerOrders: (batch: Array<Omit<Order, "status" | "placedAt">>) => Order[];
  advance: (id: string) => void; // demo: step status forward
};

const OrdersContext = createContext<OrdersState | undefined>(undefined);
const FLOW: OrderStatus[] = [
  "confirmed",
  "preparing",
  "on_the_way",
  "delivered",
];

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  const registerOrders: OrdersState["registerOrders"] = (batch) => {
    const placedAt = Date.now();
    const newOrders: Order[] = batch.map((o) => ({
      ...o,
      status: "confirmed",
      placedAt,
    }));
    setOrders((cur) => [...newOrders, ...cur]);
    return newOrders;
  };

  const advance = (id: string) =>
    setOrders((cur) =>
      cur.map((o) => {
        if (o.id !== id) return o;
        const next =
          FLOW[Math.min(FLOW.indexOf(o.status) + 1, FLOW.length - 1)];
        return { ...o, status: next };
      }),
    );

  return (
    <OrdersContext.Provider value={{ orders, registerOrders, advance }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}
