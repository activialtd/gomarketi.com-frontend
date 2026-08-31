import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import { getMyOrders, confirmDelivery, type OrderResp, type OrderStatus } from "./api-client";
import { useAuth } from "./auth-context";

export type { OrderStatus };

// Order mirrors the backend's real OrderResp directly — no more
// reconstructing display data from the local cart, since that only exists
// during an active checkout session and disappears on app reload.
export type Order = OrderResp;

// A batch is every order sharing one payment_reference (one checkout,
// possibly spanning several vendors) — matches the admin center's own
// batch concept, computed client-side the same way.
export type Batch = {
  reference: string;
  orders: Order[];
  placedAt: number;
};

type OrdersState = {
  orders: Order[];
  batches: Batch[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  // Optimistically prepends the real orders createCheckout just returned,
  // so the orders list shows them immediately without waiting on a refetch.
  registerOrders: (newOrders: Order[]) => void;
  // The real "I've received this" action — releases the vendor's held
  // escrow. Only meaningful once an order's status is "shipped".
  confirmReceived: (orderId: string) => Promise<void>;
};

const OrdersContext = createContext<OrdersState | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { orders: fetched } = await getMyOrders();
      setOrders(fetched);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load your orders");
    } finally {
      setLoading(false);
    }
  }, []);

  const registerOrders = useCallback((newOrders: Order[]) => {
    setOrders((cur) => [...newOrders, ...cur.filter((o) => !newOrders.some((n) => n.id === o.id))]);
  }, []);

  const confirmReceived = useCallback(
    async (orderId: string) => {
      if (!user?.email) throw new Error("No account email on file");
      const updated = await confirmDelivery(orderId, user.email);
      setOrders((cur) => cur.map((o) => (o.id === orderId ? updated : o)));
    },
    [user?.email],
  );

  const batches = useMemo<Batch[]>(() => {
    const byRef = new Map<string, Order[]>();
    for (const o of orders) {
      const ref = o.payment_reference ?? o.id; // fall back to order id if somehow unset
      const list = byRef.get(ref) ?? [];
      list.push(o);
      byRef.set(ref, list);
    }
    return Array.from(byRef.entries())
      .map(([reference, batchOrders]) => ({
        reference,
        orders: batchOrders,
        placedAt: Math.max(...batchOrders.map((o) => new Date(o.created_at).getTime())),
      }))
      .sort((a, b) => b.placedAt - a.placedAt);
  }, [orders]);

  return (
    <OrdersContext.Provider value={{ orders, batches, loading, error, refresh, registerOrders, confirmReceived }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}
