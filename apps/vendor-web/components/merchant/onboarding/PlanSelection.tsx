"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Zap, Star, Rocket, Crown, Loader2, ArrowRight, X } from "lucide-react";
import { identityApi, type PlanResp } from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import { ROUTES } from "@/lib/config/routes";
import { fmtNaira } from "@gomarket/shared-utils";
import PlanPaymentModal from "./PlanPaymentModal";

const PLAN_META: Record<string, {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  badge?: string;
  badgeBg?: string;
  borderColor: string;
  cta: string;
}> = {
  free:    { icon: Zap,    iconBg: "#f0fdf4", iconColor: "#22c55e", borderColor: "#e2e8f0", cta: "Start for free" },
  starter: { icon: Star,   iconBg: "#eff6ff", iconColor: "#3b82f6", borderColor: "#e2e8f0", cta: "Get started" },
  growth:  { icon: Rocket, iconBg: "#F0FAF3", iconColor: "#1A7A42", badge: "Most popular", badgeBg: "#1A7A42", borderColor: "#1A7A42", cta: "Grow your store" },
  scale:   { icon: Crown,  iconBg: "#fdf4ff", iconColor: "#a855f7", borderColor: "#e2e8f0", cta: "Go unlimited" },
};

export default function PlanSelection() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [plans, setPlans] = useState<PlanResp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PlanResp | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    identityApi.listPlans(accessToken)
      .then(setPlans)
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, [accessToken]);

  function handleSelect(plan: PlanResp) {
    if (plan.price_kobo === 0) {
      // Free — skip payment, select immediately
      confirmPlan(plan, undefined);
    } else {
      setSelected(plan);
      setPaying(true);
    }
  }

  async function confirmPlan(plan: PlanResp, paymentRef: string | undefined) {
    if (!accessToken) return;
    try {
      await identityApi.selectPlan(
        { plan_id: plan.id, payment_reference: paymentRef },
        accessToken,
      );
    } catch {
      // swallow — still proceed to store setup (plan defaults to free on server anyway)
    }
    router.push(ROUTES.ONBOARDING.SETUP);
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a1a0e 0%, #0f2a15 50%, #0a1a0e 100%)" }}>
      {/* Top nav */}
      <div className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ background: "#1A7A42" }}>
            <span className="text-white text-[13px] font-extrabold">G</span>
          </div>
          <span className="text-white font-extrabold text-[16px]">GoMarketi</span>
        </div>
        <button
          onClick={() => router.push(ROUTES.ONBOARDING.SETUP)}
          className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full transition-colors"
          style={{ color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.08)" }}
        >
          Skip <X className="w-3 h-3" />
        </button>
      </div>

      <div className="px-4 pb-16 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-bold mb-6"
            style={{ background: "rgba(26,122,66,0.25)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" }}
          >
            <Zap className="w-3.5 h-3.5" /> Step 2 of 4 — Choose a plan
          </div>
          <h1
            className="text-[36px] md:text-[48px] font-extrabold text-white leading-tight mb-4"
            style={{ letterSpacing: "-1px" }}
          >
            Simple, transparent pricing
          </h1>
          <p className="text-[17px] max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
            Start free — no credit card required. Upgrade anytime as your business grows.
          </p>
        </div>

        {/* Plan cards */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3" style={{ color: "rgba(255,255,255,0.5)" }}>
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-[15px]">Loading plans…</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => {
              const meta = PLAN_META[plan.slug] ?? PLAN_META.starter;
              const Icon = meta.icon;
              const isPopular = !!meta.badge;

              return (
                <div
                  key={plan.id}
                  className="relative rounded-[20px] p-5 flex flex-col transition-all duration-200"
                  style={{
                    background: isPopular
                      ? "linear-gradient(145deg, #0f3320, #1A7A42)"
                      : "rgba(255,255,255,0.06)",
                    border: `1.5px solid ${isPopular ? "#2fb85a" : "rgba(255,255,255,0.12)"}`,
                    backdropFilter: "blur(12px)",
                  }}
                >
                  {/* Popular badge */}
                  {meta.badge && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-extrabold text-white whitespace-nowrap"
                      style={{ background: "#1A7A42", boxShadow: "0 4px 12px rgba(26,122,66,0.6)" }}
                    >
                      ⭐ {meta.badge}
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className="w-11 h-11 rounded-[12px] flex items-center justify-center mb-4"
                    style={{ background: meta.iconBg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: meta.iconColor }} />
                  </div>

                  {/* Name */}
                  <p className="text-[13px] font-extrabold uppercase tracking-[0.08em] mb-1"
                    style={{ color: isPopular ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.55)" }}>
                    {plan.display_name}
                  </p>

                  {/* Price */}
                  <div className="flex items-end gap-1 mb-2">
                    <span
                      className="text-[34px] font-extrabold leading-none"
                      style={{ color: "#fff", letterSpacing: "-1px" }}
                    >
                      {plan.price_kobo === 0 ? "Free" : `₦${(plan.price_kobo / 100).toLocaleString("en-NG")}`}
                    </span>
                    {plan.price_kobo > 0 && (
                      <span className="text-[13px] pb-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                        /mo
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-[12px] leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {plan.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 flex-1 mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px]" style={{ color: "rgba(255,255,255,0.8)" }}>
                        <Check
                          className="w-3.5 h-3.5 shrink-0 mt-0.5"
                          style={{ color: isPopular ? "#4ade80" : "rgba(255,255,255,0.45)" }}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* Limits row */}
                  <div
                    className="flex gap-3 mb-5 px-3 py-2.5 rounded-[10px] text-[10px] font-semibold"
                    style={{ background: "rgba(0,0,0,0.25)", color: "rgba(255,255,255,0.5)" }}
                  >
                    <span>
                      {plan.product_limit === -1 ? "∞" : plan.product_limit} products
                    </span>
                    <span>·</span>
                    <span>
                      {plan.store_limit === -1 ? "∞" : plan.store_limit} store{plan.store_limit !== 1 ? "s" : ""}
                    </span>
                    <span>·</span>
                    <span>
                      {plan.team_limit === -1 ? "∞" : plan.team_limit} member{plan.team_limit !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleSelect(plan)}
                    className="w-full h-11 rounded-[12px] text-[13px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    style={
                      isPopular
                        ? { background: "#fff", color: "#0f3320", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }
                        : { background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }
                    }
                    onMouseOver={(e) => {
                      if (!isPopular) e.currentTarget.style.background = "rgba(255,255,255,0.18)";
                    }}
                    onMouseOut={(e) => {
                      if (!isPopular) e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                    }}
                  >
                    {meta.cta}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-[12px]"
          style={{ color: "rgba(255,255,255,0.4)" }}>
          {["No credit card required", "Cancel anytime", "Upgrade or downgrade instantly", "Nigerian businesses only"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <Check className="w-3 h-3" style={{ color: "#4ade80" }} /> {t}
            </span>
          ))}
        </div>
      </div>

      {/* Payment modal for paid plans */}
      {paying && selected && (
        <PlanPaymentModal
          plan={selected}
          onSuccess={(ref) => {
            setPaying(false);
            confirmPlan(selected, ref);
          }}
          onClose={() => {
            setPaying(false);
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}
