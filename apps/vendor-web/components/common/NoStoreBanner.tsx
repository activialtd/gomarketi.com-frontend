"use client";

import { useRouter } from "next/navigation";
import { Store, ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/config/routes";

// Shown on Overview/Wallet in place of misleading "₦0 / 0 orders" zeros when
// a vendor has reached the dashboard without a store yet — those pages'
// data all comes from store-scoped endpoints that 403 with no store, which
// otherwise renders as if the vendor genuinely has an empty account rather
// than no account at all.
export function NoStoreBanner({
  title = "Set up your store to get started",
  body = "Your dashboard is ready, but you haven't created a store yet — nothing here will show real data until you do.",
}: {
  title?: string;
  body?: string;
}) {
  const router = useRouter();

  return (
    <div
      className="rounded-[16px] border overflow-hidden flex items-center gap-4 px-6 py-5"
      style={{ background: "#F0FAF3", borderColor: "#c8e6d2" }}
    >
      <div
        className="w-11 h-11 rounded-[10px] flex items-center justify-center shrink-0"
        style={{ background: "#0A2E1A" }}
      >
        <Store className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-extrabold" style={{ color: "#0A2E1A" }}>
          {title}
        </p>
        <p className="text-[12.5px] mt-0.5" style={{ color: "#3f6b52" }}>
          {body}
        </p>
      </div>
      <button
        type="button"
        onClick={() => router.push(ROUTES.ONBOARDING.SETUP)}
        className="flex items-center gap-1.5 h-10 px-4 rounded-[10px] text-white text-[13px] font-bold shrink-0 transition-all active:scale-[0.98]"
        style={{ background: "#0A2E1A", boxShadow: "0 2px 8px rgba(26,122,66,0.25)" }}
      >
        Create your store
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
