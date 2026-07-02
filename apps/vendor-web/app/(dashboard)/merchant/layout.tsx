"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/common/Sidebar";
import { Header } from "@/components/common/Header";
import { useAuthStore } from "@/store/useAuthStore";
import { PageWrapper } from "@/components/animations/PageWrapper";
import { DashboardTour } from "@/components/merchant/tour/DashboardTour";
import { SWRProvider } from "@/lib/swr/provider";
import { authApi, storefrontApi, setTokenRefreshCallback } from "@gomarket/api-client";
import { clearAuthSession } from "@/lib/auth/session";
import { ROUTES } from "@/lib/config/routes";

const STORE_DOMAIN = process.env.NEXT_PUBLIC_STORE_DOMAIN ?? "gomarketi.com";

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [storeName, setStoreName] = useState("My Store");
  const [storeSlug, setStoreSlug] = useState("");
  const router = useRouter();
  const { user, hydrating, clearAuth, accessToken, setAuth } = useAuthStore();

  // Register a global token-refresh callback so any API call that gets a 401
  // silently refreshes the JWT and retries — no manual handling needed per-page.
  useEffect(() => {
    setTokenRefreshCallback(async () => {
      try {
        const fresh = await authApi.refreshTokens();
        setAuth(fresh.user, fresh.access_token);
        return fresh.access_token;
      } catch {
        clearAuth();
        return null;
      }
    });
  }, [setAuth, clearAuth]);

  const merchantName = user?.full_name ?? user?.email?.split("@")[0] ?? "";
  const avatarInitials = merchantName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    if (!accessToken) return;
    storefrontApi
      .getMyStore(accessToken)
      .then((store) => {
        setStoreName(store.name);
        setStoreSlug(store.slug);
      })
      .catch(() => {});
  }, [accessToken]);

  async function handleSignOut() {
    try {
      await authApi.logout();
    } catch {}
    clearAuth();
    clearAuthSession();
    router.push(ROUTES.AUTH.LOGIN);
  }

  if (hydrating) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div
          className="w-8 h-8 rounded-full border-[3px] border-t-transparent animate-spin"
          style={{ borderColor: "#0A2E1A", borderTopColor: "transparent" }}
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  // if (!user) {

  // }

  return (
    <SWRProvider>
    <div className="flex h-screen overflow-hidden bg-[#f4f6f9]">
      <DashboardTour />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSignOut={handleSignOut}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          merchantName={merchantName}
          avatarInitials={avatarInitials}
          userEmail={user?.email}
          storeName={storeName}
          storeSlug={storeSlug}
          storeDomain={STORE_DOMAIN}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 overflow-y-auto bg-[#f4f6f9]">
          <PageWrapper className="px-5 lg:px-7 py-6">{children}</PageWrapper>
        </main>
      </div>
    </div>
    </SWRProvider>
  );
}
