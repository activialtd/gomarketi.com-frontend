"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { authApi, ApiError, setTokenRefreshCallback } from "@gomarket/api-client";
import { clearAuthSession } from "@/lib/auth/session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, setAuth, clearAuth, setHydrated } = useAuthStore();
  const attempted = useRef(false);

  // Registered once, app-wide (this provider wraps every route, including
  // onboarding) — previously this only lived in the dashboard layout, so a
  // token expiring while still in /(setup) had no way to silently refresh
  // and every call there just failed with a bare 401.
  useEffect(() => {
    setTokenRefreshCallback(async () => {
      try {
        const fresh = await authApi.refreshTokens();
        setAuth(fresh.user, fresh.access_token);
        return fresh.access_token;
      } catch {
        clearAuth();
        clearAuthSession();
        return null;
      }
    });
  }, [setAuth, clearAuth]);

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
