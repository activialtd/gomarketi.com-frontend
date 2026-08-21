"use client";

/**
 * Typed SWR hooks for the GoMarketi vendor dashboard.
 *
 * Every hook follows the stale-while-revalidate pattern:
 *  1. Return cached data immediately (zero-latency navigation)
 *  2. Revalidate in the background so the user always sees fresh data
 *
 * Cache times are tuned per data type:
 *  - Products / categories / collections: 5 min (change infrequently)
 *  - Orders / customers: 30 sec (change as sales come in)
 *  - Analytics / wallet: 60 sec (aggregate data, slightly stale is fine)
 *  - Store / plan info: 10 min (almost never changes)
 *
 * Usage:
 *   const { data: products, isLoading } = useProducts();
 *   const { data: orders }             = useOrders({ status: "confirmed" });
 *
 * To force a refresh (e.g. after creating a product):
 *   import { mutate } from 'swr';
 *   mutate("products");
 */

import useSWR, { mutate } from "swr";
import { useEffect, useRef, useCallback } from "react";
import {
  catalogueApi,
  ordersApi,
  analyticsApi,
  walletApi,
  crmApi,
  campaignsApi,
  paymentGatewaysApi,
  storefrontApi,
  identityApi,
  staffApi,
  type PlanResp,
} from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";

// ── Token helper ──────────────────────────────────────────────────────────────

function tok() {
  return useAuthStore.getState().accessToken ?? "";
}

function koboToNaira(kobo: number) {
  return (
    "₦" +
    (kobo / 100).toLocaleString("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

// ── Products ──────────────────────────────────────────────────────────────────

export function useProducts(params: { per_page?: number; q?: string } = {}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const key = accessToken ? `products:${JSON.stringify(params)}` : null;
  return useSWR(
    key,
    () => catalogueApi.listProducts({ per_page: 100, ...params }, tok()),
    { revalidateOnFocus: false, dedupingInterval: 300_000 } // 5 min
  );
}

export function useCategories() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useSWR(
    accessToken ? "categories" : null,
    () => catalogueApi.listCategories(tok()),
    { revalidateOnFocus: false, dedupingInterval: 600_000 } // 10 min
  );
}

export function useCollections() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useSWR(
    accessToken ? "collections" : null,
    () => catalogueApi.listCollections(tok()),
    { revalidateOnFocus: false, dedupingInterval: 300_000 } // 5 min
  );
}

// ── Orders ────────────────────────────────────────────────────────────────────

export function useOrders(
  params: { per_page?: number; status?: string; q?: string } = {}
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const key = accessToken ? `orders:${JSON.stringify(params)}` : null;
  return useSWR(
    key,
    () => ordersApi.listOrders({ per_page: 100, ...params }, tok()),
    { revalidateOnFocus: false, dedupingInterval: 30_000 } // SSE drives updates
  );
}

export function useAbandonedCarts() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useSWR(
    accessToken ? "abandoned-carts" : null,
    () => ordersApi.listAbandonedCarts({ per_page: 100 }, tok()),
    { revalidateOnFocus: false, dedupingInterval: 120_000 } // 2 min
  );
}

// ── Customers ─────────────────────────────────────────────────────────────────

export function useCustomers(params: { per_page?: number; q?: string } = {}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const key = accessToken ? `customers:${JSON.stringify(params)}` : null;
  return useSWR(
    key,
    () => crmApi.listCustomers({ per_page: 100, ...params }, tok()),
    { revalidateOnFocus: false, dedupingInterval: 60_000 } // 1 min
  );
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export function useAnalyticsOverview() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useSWR(
    accessToken ? "analytics:overview" : null,
    () => analyticsApi.getOverview(tok()),
    { revalidateOnFocus: false, dedupingInterval: 60_000 } // 1 min
  );
}

export function useTopProducts(limit = 5) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useSWR(
    accessToken ? `analytics:top-products:${limit}` : null,
    () => analyticsApi.getTopProducts(limit, tok()),
    { revalidateOnFocus: false, dedupingInterval: 300_000 } // 5 min
  );
}

export function useRevenueTrend(days = 30) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useSWR(
    accessToken ? `analytics:revenue-trend:${days}` : null,
    () => analyticsApi.getRevenueTrend(days, tok()),
    { revalidateOnFocus: false, dedupingInterval: 120_000 } // 2 min
  );
}

// ── Wallet ────────────────────────────────────────────────────────────────────

export function useWallet() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useSWR(
    accessToken ? "wallet:balance" : null,
    () => walletApi.getBalance(tok()),
    { revalidateOnFocus: false, dedupingInterval: 30_000 } // SSE drives updates
  );
}

// ── Store ─────────────────────────────────────────────────────────────────────

export function useMyStore() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useSWR(
    accessToken ? "store:mine" : null,
    () => storefrontApi.getMyStore(tok()),
    { revalidateOnFocus: false, dedupingInterval: 600_000 } // 10 min
  );
}

// ── Identity / plan ───────────────────────────────────────────────────────────

export function useVendorProfile() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useSWR(
    accessToken ? "identity:vendor-profile" : null,
    () => identityApi.getVendorProfile(tok()),
    { revalidateOnFocus: false, dedupingInterval: 300_000 } // 5 min
  );
}

export function useSubscription() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useSWR(
    accessToken ? "identity:subscription" : null,
    () => identityApi.getSubscription(tok()),
    {
      revalidateOnFocus: false,
      dedupingInterval: 600_000, // 10 min
      // 404 = no subscription yet — treat as empty, don't retry constantly
      onErrorRetry: (err, _key, _cfg, revalidate, { retryCount }) => {
        if (err?.status === 404) return;
        if (retryCount >= 3) return;
        setTimeout(() => revalidate({ retryCount }), 5000);
      },
    }
  );
}

export function usePlans() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useSWR(
    accessToken ? "identity:plans" : null,
    () => identityApi.listPlans(tok()),
    { revalidateOnFocus: false, dedupingInterval: 3_600_000 } // 1 hour — plans never change
  );
}

// ── Newsletter subscribers ────────────────────────────────────────────────────

export function useSubscribers(params: { page?: number; per_page?: number } = {}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const key = accessToken ? `subscribers:${JSON.stringify(params)}` : null;
  return useSWR(
    key,
    () => crmApi.listSubscribers({ per_page: 100, ...params }, tok()),
    { revalidateOnFocus: false, dedupingInterval: 60_000 }
  );
}

// ── Email campaigns ───────────────────────────────────────────────────────────

export function useCampaigns() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useSWR(
    accessToken ? "campaigns" : null,
    () => campaignsApi.list(tok()),
    { revalidateOnFocus: false, dedupingInterval: 30_000 }
  );
}

// ── Payment gateways ──────────────────────────────────────────────────────────

export function usePaymentGateways() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useSWR(
    accessToken ? "payment-gateways" : null,
    () => paymentGatewaysApi.list(tok()),
    { revalidateOnFocus: false, dedupingInterval: 300_000 } // 5 min
  );
}

// ── Staff ─────────────────────────────────────────────────────────────────────

export function useStaff() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useSWR(
    accessToken ? "staff" : null,
    () => staffApi.list(tok()),
    { revalidateOnFocus: false, dedupingInterval: 60_000 }
  );
}

// ── Invalidation helpers ──────────────────────────────────────────────────────
// Call these after mutations to force an immediate fresh fetch.

export const invalidate = {
  products: () => mutate((key: string) => key?.startsWith("products"), undefined, { revalidate: true }),
  categories: () => mutate("categories"),
  collections: () => mutate("collections"),
  orders: () => mutate((key: string) => key?.startsWith("orders"), undefined, { revalidate: true }),
  customers: () => mutate((key: string) => key?.startsWith("customers"), undefined, { revalidate: true }),
  analytics: () => mutate((key: string) => key?.startsWith("analytics"), undefined, { revalidate: true }),
  wallet: () => mutate("wallet:balance"),
  store: () => mutate("store:mine"),
  vendorProfile: () => mutate("identity:vendor-profile"),
  subscribers: () => mutate((key: string) => key?.startsWith("subscribers"), undefined, { revalidate: true }),
  campaigns: () => mutate("campaigns"),
  paymentGateways: () => mutate("payment-gateways"),
  staff: () => mutate("staff"),
};

// ── WebSocket real-time events ──────────────────────────────────────────────

// The backend only ever implemented GET /v1/orders/ws (gorilla/websocket) —
// there is no SSE endpoint, so this must speak WebSocket, not EventSource.
const WS_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/^http/, "ws");
const WS_MAX_RETRIES = 5;       // give up WS after 5 consecutive failures
const WS_FALLBACK_INTERVAL = 60_000; // poll every 60s after WS gives up

interface WsMessage {
  type: string;
  id: string;
  data: unknown;
}

/**
 * useOrderEvents — subscribes to the orders WebSocket stream for real-time
 * notifications. Replaces polling: the server pushes a tiny event only when
 * an order or wallet balance actually changes.
 *
 * Fault-tolerance design:
 *  - Reconnects automatically with exponential backoff + jitter on close
 *  - Random jitter (0–3s... capped) on reconnect to prevent thundering-herd
 *    after a service restart with 10k concurrent vendors
 *  - Sends ?last_id= on reconnect so the server can replay missed events
 *  - After WS_MAX_RETRIES consecutive failures, falls back to 60s polling
 *    so the dashboard still updates even if WebSocket is broken
 *  - Polling is disabled while WebSocket is healthy (zero wasted requests)
 */
export function useOrderEvents() {
  const accessToken = useAuthStore.getState().accessToken;
  const retryCount = useRef(0);
  const lastIdRef = useRef("");
  const fallbackTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const stopFallback = useCallback(() => {
    if (fallbackTimer.current) {
      clearInterval(fallbackTimer.current);
      fallbackTimer.current = null;
    }
  }, []);

  const startFallback = useCallback(() => {
    if (fallbackTimer.current) return; // already running
    console.warn("[WS] switched to 60s polling fallback after repeated failures");
    fallbackTimer.current = setInterval(() => {
      invalidate.orders();
      invalidate.wallet();
      invalidate.analytics();
    }, WS_FALLBACK_INTERVAL);
  }, []);

  const connect = useCallback(() => {
    if (!accessToken) return;

    // Null wsRef BEFORE closing so the old socket's onclose fires with
    // wsRef.current !== ws and skips the reconnect logic.
    const prev = wsRef.current;
    wsRef.current = null;
    prev?.close();

    // Browser WebSocket cannot send custom headers — token goes in the query param;
    // the gateway promotes it to an Authorization header for upgrade requests.
    const params = new URLSearchParams({ token: accessToken });
    if (lastIdRef.current) params.set("last_id", lastIdRef.current);
    const ws = new WebSocket(`${WS_BASE}/v1/orders/ws?${params.toString()}`);
    wsRef.current = ws;

    ws.onopen = () => {
      // Successful (re)connect — reset retry counter and cancel fallback polling.
      retryCount.current = 0;
      stopFallback();
    };

    ws.onmessage = (event) => {
      let msg: WsMessage;
      try {
        msg = JSON.parse(event.data as string);
      } catch {
        return; // ignore malformed frames
      }
      if (msg.id) lastIdRef.current = msg.id;

      switch (msg.type) {
        case "order_created": {
          invalidate.orders();
          invalidate.wallet();
          invalidate.analytics();
          const data = msg.data as { total_kobo?: number } | undefined;
          useNotificationStore.getState().push({
            title: "New order received",
            body: typeof data?.total_kobo === "number" ? koboToNaira(data.total_kobo) : undefined,
          });
          break;
        }
        case "order_updated":
          invalidate.orders();
          invalidate.analytics();
          break;
        case "wallet_updated":
          invalidate.wallet();
          break;
      }
    };

    ws.onerror = () => {
      // The close event always follows error and carries the actual retry
      // decision — onerror alone gives no useful information here.
    };

    ws.onclose = () => {
      // If wsRef no longer points to this socket, it was either superseded by
      // a newer connect() call or deliberately closed by the cleanup function.
      // Either way, do not schedule a reconnect.
      if (wsRef.current !== ws) return;
      wsRef.current = null;
      retryCount.current += 1;

      if (retryCount.current >= WS_MAX_RETRIES) {
        startFallback();
        return; // stop trying WS — fallback polling takes over
      }

      // Exponential backoff capped at 30s, plus up to 1s of jitter.
      const delay =
        Math.min(1000 * 2 ** retryCount.current, 30_000) + Math.random() * 1000;
      reconnectTimer.current = setTimeout(connect, delay);
    };
  }, [accessToken, startFallback, stopFallback]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      // Null wsRef BEFORE closing so onclose sees it as superseded and
      // does not schedule a reconnect into the dead component.
      const closing = wsRef.current;
      wsRef.current = null;
      closing?.close();
      stopFallback();
    };
  }, [connect]);
}
