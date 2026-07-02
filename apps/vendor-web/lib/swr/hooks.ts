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
import {
  catalogueApi,
  ordersApi,
  analyticsApi,
  walletApi,
  crmApi,
  storefrontApi,
  identityApi,
  type PlanResp,
} from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";

// ── Token helper ──────────────────────────────────────────────────────────────

function tok() {
  return useAuthStore.getState().accessToken ?? "";
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
    { revalidateOnFocus: true, dedupingInterval: 30_000 } // 30 sec
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

// ── Wallet ────────────────────────────────────────────────────────────────────

export function useWallet() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useSWR(
    accessToken ? "wallet:balance" : null,
    () => walletApi.getBalance(tok()),
    { revalidateOnFocus: true, dedupingInterval: 30_000 } // 30 sec
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
};
