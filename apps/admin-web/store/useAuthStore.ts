"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdminResp, AdminRole } from "@gomarket/api-client";

// admin-api issues a single access token with no refresh-token flow yet
// (Phase 1 scope — see services/admin-api/src/auth) — persisting it directly
// to localStorage is how the session survives a page reload for now. A
// proper refresh-token rotation, mirroring vendor-web's cookie-based one,
// is a reasonable later improvement once the ticket/directory/analytics
// phases are further along.
interface AuthState {
  admin: AdminResp | null;
  accessToken: string | null;
  hydrated: boolean;
  setAuth: (admin: AdminResp, accessToken: string) => void;
  clearAuth: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      accessToken: null,
      hydrated: false,
      setAuth: (admin, accessToken) => set({ admin, accessToken }),
      clearAuth: () => set({ admin: null, accessToken: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "gomarketi-admin-auth",
      partialize: (state) => ({ admin: state.admin, accessToken: state.accessToken }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

export function roleAtLeast(role: AdminRole | undefined, required: AdminRole): boolean {
  const order: Record<AdminRole, number> = { agent: 0, supervisor: 1, super_admin: 2 };
  return order[role ?? "agent"] >= order[required];
}
