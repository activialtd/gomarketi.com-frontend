"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/common/Sidebar";
import { Header } from "@/components/common/Header";
import { useAuthStore } from "@/store/useAuthStore";
import { PageWrapper } from "@/components/animations/PageWrapper";
import { DashboardTour } from "@/components/merchant/tour/DashboardTour";
import { authApi, storefrontApi } from "@gomarket/api-client";
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
  const { user, hydrating, clearAuth, accessToken } = useAuthStore();

  const merchantName = user?.full_name ?? user?.email?.split("@")[0] ?? "";
  const avatarInitials = merchantName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Fetch vendor's store to get real slug and name for the header
  useEffect(() => {
    if (!accessToken) return;
    storefrontApi
      .getMyStore(accessToken)
      .then((store) => {
        setStoreName(store.name);
        setStoreSlug(store.slug);
      })
      .catch(() => {
        // No store yet — vendor hasn't completed setup; leave defaults
      });
  }, [accessToken]);

  async function handleSignOut() {
    try {
      await authApi.logout();
    } catch {
      // best-effort — clear local state regardless
    }
    clearAuth();
    clearAuthSession();
    router.push(ROUTES.AUTH.LOGIN);
  }

  if (hydrating) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: "#f8fafc" }}
      >
        <div
          className="w-8 h-8 rounded-full border-[3px] border-[#1A7A42] border-t-transparent animate-spin"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  // if (!user) {
  //   router.replace(ROUTES.AUTH.LOGIN);
  //   return null;
  // }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#f8fafc" }}
    >
      {/* Dashboard tour — shown once to new vendors */}
      <DashboardTour />

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSignOut={handleSignOut}
      />

      {/* ── Main column ─────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          merchantName={merchantName}
          avatarInitials={avatarInitials}
          userEmail={user?.email}
          storeName={storeName}
          storeSlug={storeSlug}
          storeDomain={STORE_DOMAIN}
          trialDaysLeft={14}
          onSignOut={handleSignOut}
        />

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ background: "#f8fafc" }}
        >
          {/* Trial banner — full width, above content */}
          <TrialBanner daysLeft={14} />

          <PageWrapper className="px-4 lg:px-6 py-5">{children}</PageWrapper>
        </main>
      </div>
    </div>
  );
}

// ─── Trial / announcement banner ─────────────────────────────────────────────

function TrialBanner({ daysLeft }: { daysLeft: number }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      className="flex items-center justify-between px-4 lg:px-6 py-2.5 border-b text-[13px]"
      style={{
        background: "rgba(254,243,199,0.7)",
        borderColor: "rgba(245,158,11,0.2)",
      }}
    >
      <div className="flex items-center gap-2" style={{ color: "#92400e" }}>
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: "#f59e0b" }}
        />
        <span>
          Your free trial will expire in <strong>{daysLeft} days.</strong>
        </span>
        <button
          type="button"
          className="ml-1 font-bold underline underline-offset-2 hover:no-underline transition-all"
          style={{ color: "#1A7A42" }}
        >
          Upgrade Plan →
        </button>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="ml-4 text-[18px] leading-none opacity-40 hover:opacity-70 transition-opacity shrink-0"
        style={{ color: "#92400e" }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
