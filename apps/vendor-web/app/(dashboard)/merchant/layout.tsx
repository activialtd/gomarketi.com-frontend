"use client";

import { useState } from "react";
import { Sidebar } from "@/components/common/Sidebar";
import { Header } from "@/components/common/Header";

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#f8fafc" }}
    >
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Main column ─────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          storeName="Eko Fashion House"
          storeSlug="eko-fashion"
          merchantName="Akachi Ezekiel"
          hasNotifications
          trialDaysLeft={14}
        />

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ background: "#f8fafc" }}
        >
          {/* Trial banner — full width, above content */}
          <TrialBanner daysLeft={14} />

          <div className="px-4 lg:px-6 py-5">{children}</div>
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
