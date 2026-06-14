"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { authApi, ApiError } from "@gomarket/api-client";
import { clearAuthSession } from "@/lib/auth/session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, setAuth, clearAuth, setHydrated } = useAuthStore();
  const attempted = useRef(false);

  useEffect(() => {
    // Already have a token in memory — session is live, unblock the UI immediately.
    if (accessToken) {
      setHydrated();
      return;
    }
    if (attempted.current) return;
    attempted.current = true;

    authApi
      .refreshTokens()
      .then((resp) => {
        setAuth(resp.user, resp.access_token);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearAuth();
          clearAuthSession();
        }
      })
      .finally(() => {
        setHydrated();
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
