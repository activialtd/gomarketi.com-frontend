"use client";

import { create } from "zustand";
import type { UserDTO } from "@gomarket/api-client";

interface AuthState {
  user: UserDTO | null;
  accessToken: string | null;
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
  hydrating: true,
  signupPhone: null,
  setAuth: (user, accessToken) => set({ user, accessToken }),
  clearAuth: () => set({ user: null, accessToken: null, signupPhone: null }),
  setHydrated: () => set({ hydrating: false }),
  setSignupPhone: (phone) => set({ signupPhone: phone }),
}));
