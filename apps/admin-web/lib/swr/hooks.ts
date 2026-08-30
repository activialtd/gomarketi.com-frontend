"use client";

import useSWR from "swr";
import { adminApi, type AdminListParams } from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";

function tok(): string {
  return useAuthStore.getState().accessToken ?? "";
}

export function useAdminMe() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useSWR(accessToken ? "admin:me" : null, () => adminApi.me(tok()), {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });
}

export function useCustomers(params: AdminListParams = {}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const key = accessToken ? `admin:customers:${JSON.stringify(params)}` : null;
  return useSWR(key, () => adminApi.listCustomers(params, tok()), {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });
}

export function useCustomer(id: string | undefined) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const key = accessToken && id ? `admin:customer:${id}` : null;
  return useSWR(key, () => adminApi.getCustomer(id!, tok()), {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });
}

export function useVendors(params: AdminListParams = {}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const key = accessToken ? `admin:vendors:${JSON.stringify(params)}` : null;
  return useSWR(key, () => adminApi.listVendors(params, tok()), {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });
}

export function useVendor(id: string | undefined) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const key = accessToken && id ? `admin:vendor:${id}` : null;
  return useSWR(key, () => adminApi.getVendor(id!, tok()), {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });
}
