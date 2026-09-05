"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Check,
  Zap,
  Star,
  Rocket,
  Crown,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { identityApi, type PlanResp } from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import { ROUTES } from "@/lib/config/routes";

// react-paystack touches `window` at module-evaluation time, which crashes
// Next.js's server-side prerender pass for this page (a "use client"
// component still gets SSR'd once for the initial HTML). Deferring to a
// client-only dynamic import skips that SSR pass for this subtree entirely.
const PlanCheckoutModal = dynamic(() => import("./PlanCheckoutModal"), { ssr: false });

const PLAN_META: Record<
  string,
  {
    icon: React.ElementType;
    accent: string;
    badge?: string;
    cta: string;
  }
> = {
  free: { icon: Zap, accent: "#22c55e", cta: "Start for free" },
  starter: { icon: Star, accent: "#3b82f6", cta: "Get started" },
  growth: {
    icon: Rocket,
    accent: "#1A7A42",
    badge: "Most popular",
    cta: "Grow your store",
  },
  scale: { icon: Crown, accent: "#a855f7", cta: "Go unlimited" },
};

export default function PlanSelection() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [plans, setPlans] = useState<PlanResp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PlanResp | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    // startOnboarding is idempotent — silently ignore 409 (already exists).
    identityApi
      .startOnboarding(accessToken)
      .catch(() => {})
      .finally(() => {
        identityApi
          .listPlans(accessToken)
          .then(setPlans)
          .catch(() => setPlans([]))
          .finally(() => setLoading(false));
      });
  }, [accessToken]);

  function handleSelect(plan: PlanResp) {
    if (plan.price_kobo === 0) {
      confirmPlan(plan, undefined);
    } else {
      setSelected(plan);
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
      // swallow — still proceed to store setup
    }
    router.push(ROUTES.ONBOARDING.SETUP);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top nav — no skip: a plan (even Free) is required before setup,
          there's no cost-based reason left to defer it. */}
      <div className="border-b border-slate-200">
        <div className="px-6 py-4 flex items-center max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] flex items-center justify-center bg-[#0A2E1A]">
              <span className="text-white text-[13px] font-extrabold">G</span>
            </div>
            <span className="text-[#0A2E1A] font-extrabold text-[15px]">
              GoMarketi
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 py-12 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide mb-5 bg-[#F0FAF3] text-[#1A7A42] border border-[#c8e6d2]">
            Step 2 of 4 · Choose your plan
          </div>
          <h1 className="text-[32px] md:text-[40px] font-extrabold text-[#0A2E1A] leading-tight mb-3 tracking-tight">
            Pick a plan that fits your store
          </h1>
          <p className="text-[15px] text-slate-500 max-w-md mx-auto">
            Start free — no credit card required. Upgrade anytime as you grow.
          </p>
        </div>

        {!loading && plans.length > 0 && (
          <div className="mb-8 flex items-center justify-center gap-2 rounded-[12px] border border-[#c8e6d2] bg-[#F0FAF3] px-4 py-3 text-center">
            <span className="text-[13px] font-semibold text-[#0A2E1A]">
              🎉 First 3 months, every feature unlocked — no matter which plan
              you pick below.
            </span>
          </div>
        )}

        {/* Plan cards */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-[14px]">Loading plans…</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(() => {
              const clickableIds = new Set(
                plans
                  .slice()
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .slice(0, 2)
                  .map((p) => p.id),
              );
              return plans.map((plan) => {
              const meta = PLAN_META[plan.slug] ?? PLAN_META.starter;
              const Icon = meta.icon;
              const isPopular = !!meta.badge;
              const isClickable = clickableIds.has(plan.id);

              return (
                <div
                  key={plan.id}
                  className="relative rounded-[16px] p-6 flex flex-col bg-white transition-all hover:border-slate-300"
                  style={{
                    border: `1.5px solid ${isPopular ? "#1A7A42" : "#e2e8f0"}`,
                    boxShadow: isPopular
                      ? "0 4px 16px rgba(26,122,66,0.08)"
                      : "none",
                    opacity: isClickable ? 1 : 0.5,
                  }}
                >
                  {meta.badge && (
                    <div className="absolute -top-2.5 left-6 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white bg-[#1A7A42]">
                      {meta.badge}
                    </div>
                  )}

                  {/* Icon + price row */}
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className="w-10 h-10 rounded-[10px] flex items-center justify-center"
                      style={{ background: `${meta.accent}15` }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: meta.accent }}
                      />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[28px] font-extrabold text-[#0A2E1A] leading-none tracking-tight">
                        {plan.price_kobo === 0
                          ? "Free"
                          : `₦${(plan.price_kobo / 100).toLocaleString("en-NG")}`}
                      </span>
                      {plan.price_kobo > 0 && (
                        <span className="text-[12px] text-slate-400">/mo</span>
                      )}
                    </div>
                  </div>

                  {/* Name + description */}
                  <p className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-slate-500 mb-1.5">
                    {plan.display_name}
                  </p>
                  <p className="text-[13px] text-slate-500 leading-relaxed mb-5">
                    {plan.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2.5 flex-1 mb-5">
                    {plan.features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-[13px] text-slate-700"
                      >
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: `${meta.accent}20` }}
                        >
                          <Check
                            className="w-2.5 h-2.5"
                            style={{ color: meta.accent }}
                            strokeWidth={3}
                          />
                        </div>
                        <span className="leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Limits row */}
                  <div className="flex items-center gap-3 pt-4 mb-5 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
                    <span>
                      {plan.product_limit === -1 ? "∞" : plan.product_limit}{" "}
                      products
                    </span>
                    <span className="text-slate-300">·</span>
                    <span>
                      {plan.store_limit === -1 ? "∞" : plan.store_limit} store
                      {plan.store_limit !== 1 ? "s" : ""}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span>
                      {plan.team_limit === -1 ? "∞" : plan.team_limit} member
                      {plan.team_limit !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* CTA */}
                  {isClickable ? (
                    <button
                      onClick={() => handleSelect(plan)}
                      className="w-full h-11 rounded-[10px] text-[13px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                      style={
                        isPopular
                          ? { background: "#0A2E1A", color: "#fff" }
                          : {
                              background: "#F0FAF3",
                              color: "#0A2E1A",
                              border: "1px solid #c8e6d2",
                            }
                      }
                    >
                      {meta.cta}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div
                      className="w-full h-11 rounded-[10px] text-[13px] font-bold flex items-center justify-center gap-2 cursor-not-allowed"
                      style={{
                        background: "#f1f5f9",
                        color: "#94a3b8",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      Coming soon
                    </div>
                  )}
                </div>
              );
              });
            })()}
          </div>
        )}

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-10 text-[12px] text-slate-400">
          {[
            "No credit card required",
            "Cancel anytime",
            "Upgrade or downgrade instantly",
            "Nigerian businesses only",
          ].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#22c55e]" strokeWidth={3} />{" "}
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Paystack checkout modal for paid plans */}
      {selected && (
        <PlanCheckoutModal
          plan={selected}
          onSuccess={(ref) => {
            const chosen = selected;
            setSelected(null);
            confirmPlan(chosen, ref);
          }}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
