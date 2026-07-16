import React, { createContext, useContext, useState, ReactNode } from "react";
import { CartLine } from "./cart-context";

export type OrderStatus =
  "confirmed" | "preparing" | "on_the_way" | "delivered";

export type Order = {
  id: string;
  reference: string; // Paystack reference
  items: CartLine[];
  totalUsd: number;
  address: string;
  status: OrderStatus;
  placedAt: number;
};

type OrdersState = {
  orders: Order[];
  placeOrder: (o: Omit<Order, "id" | "status" | "placedAt">) => Order;
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

  const placeOrder: OrdersState["placeOrder"] = (o) => {
    // TODO(backend): POST /orders after server-side Paystack verification
    const order: Order = {
      ...o,
      id: `ord_${Date.now()}`,
      status: "confirmed",
      placedAt: Date.now(),
    };
    setOrders((cur) => [order, ...cur]);
    return order;
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
    <OrdersContext.Provider value={{ orders, placeOrder, advance }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}
