"use client";

import { create } from "zustand";
import type { UserDTO } from "@gomarket/api-client";

function parseJwtPayload(token: string): Record<string, unknown> {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return {};
  }
}

export type StaffRole = "manager" | "fulfillment" | "support" | "analytics_only";

interface AuthState {
  user: UserDTO | null;
  accessToken: string | null;
  staffRole: StaffRole | null;
  hydrating: boolean;
  signupPhone: string | null;
  setAuth: (user: UserDTO, accessToken: string) => void;
  clearAuth: () => void;
  setHydrated: () => void;
  setSignupPhone: (phone: string) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  staffRole: null,
  hydrating: true,
  signupPhone: null,
  setAuth: (user, accessToken) => {
    const claims = parseJwtPayload(accessToken);
    const role = (claims.staff_role as StaffRole) ?? null;
    set({ user, accessToken, staffRole: role });
  },
  clearAuth: () => set({ user: null, accessToken: null, staffRole: null, signupPhone: null }),
  setHydrated: () => set({ hydrating: false }),
  setSignupPhone: (phone) => set({ signupPhone: phone }),
}));
