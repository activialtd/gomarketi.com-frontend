"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { authApi, ApiError } from "@gomarket/api-client";
import { clearAuthSession } from "@/lib/auth/session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, setAuth, clearAuth } = useAuthStore();
  const attempted = useRef(false);

  useEffect(() => {
    // Already have a token in memory — nothing to do.
    if (accessToken || attempted.current) return;
    attempted.current = true;

    // Try to silently recover the session via the refresh-token httpOnly cookie
    // that the backend set. If the cookie is missing or expired this will 401.
    authApi
      .refreshTokens()
      .then((resp) => {
        setAuth(resp.user, resp.access_token);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          // Refresh token is gone / revoked — clear the sentinel cookie so
          // the middleware will redirect to login on the next navigation.
          clearAuth();
          clearAuthSession();
        }
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
