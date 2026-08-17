"use client";

import { useState } from "react";
import { X, Shield, ArrowRight, Loader2 } from "lucide-react";
import { usePaystackPayment } from "react-paystack";
import { type PlanResp } from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";

function fmt(kobo: number) {
  return "₦" + (kobo / 100).toLocaleString("en-NG");
}

export default function PlanCheckoutModal({
  plan,
  onSuccess,
  onClose,
}: {
  plan: PlanResp;
  onSuccess: (ref: string) => void;
  onClose: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const email = user?.email ?? "";
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";

  const [launching, setLaunching] = useState(false);

  const config = {
    reference: `PLAN_${plan.id}_${Date.now()}`,
    email,
    amount: plan.price_kobo, // already in kobo
    publicKey,
    metadata: {
      plan_id: plan.id,
      plan_slug: plan.slug,
      custom_fields: [
        {
          display_name: "Plan",
          variable_name: "plan",
          value: plan.display_name,
        },
      ],
    },
  };

  const initializePayment = usePaystackPayment(config);
  const canPay = !!email && !!publicKey;

  function handlePay() {
    if (!canPay) return;
    setLaunching(true);
    initializePayment({
      onSuccess: (res: { reference?: string; trxref?: string }) => {
        setLaunching(false);
        onSuccess(res?.reference ?? res?.trxref ?? config.reference);
      },
      onClose: () => {
        setLaunching(false);
      },
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] rounded-[16px] overflow-hidden bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
          <div>
            <p className="text-[15px] font-extrabold text-[#0A2E1A] leading-tight">
              Confirm your plan
            </p>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Review before checkout
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Plan summary */}
          <div className="rounded-[12px] border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                {plan.display_name} plan
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                Monthly
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[28px] font-extrabold text-[#0A2E1A] tracking-tight leading-none">
                {fmt(plan.price_kobo)}
              </span>
              <span className="text-[13px] text-slate-400">/month</span>
            </div>
            <p className="text-[12px] text-slate-500 mt-2 leading-relaxed">
              {plan.description}
            </p>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-1">
            <span className="text-[13px] font-semibold text-slate-600">
              Total due today
            </span>
            <span className="text-[16px] font-extrabold text-[#0A2E1A]">
              {fmt(plan.price_kobo)}
            </span>
          </div>

          {!canPay && (
            <div className="text-[12px] p-3 rounded-[8px] bg-amber-50 text-amber-800 border border-amber-200">
              Missing account email or Paystack config. Please refresh and try
              again.
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={!canPay || launching}
            className="w-full h-12 rounded-[12px] text-white text-[14px] font-extrabold flex items-center justify-center gap-2 bg-[#0A2E1A] transition-all disabled:opacity-40 active:scale-[0.99]"
          >
            {launching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Opening Paystack…
              </>
            ) : (
              <>
                Continue to Paystack
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-[11px] flex items-center justify-center gap-1.5 text-slate-400">
            <Shield className="w-3 h-3" /> Charged securely on Paystack. We
            never see your card.
          </p>
        </div>
      </div>
    </div>
  );
}
