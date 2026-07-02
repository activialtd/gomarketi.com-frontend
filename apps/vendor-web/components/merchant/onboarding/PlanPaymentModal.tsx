"use client";

import { useState, useRef } from "react";
import { X, CreditCard, Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { type PlanResp } from "@gomarket/api-client";

function fmt(kobo: number) {
  return "₦" + (kobo / 100).toLocaleString("en-NG");
}

function formatCardNumber(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
}

type Stage = "form" | "processing" | "success" | "failed";

export default function PlanPaymentModal({
  plan,
  onSuccess,
  onClose,
}: {
  plan: PlanResp;
  onSuccess: (ref: string) => void;
  onClose: () => void;
}) {
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [stage, setStage] = useState<Stage>("form");
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function isFailCard() {
    return card.replace(/\s/g, "").startsWith("0");
  }

  const canPay = card.replace(/\s/g, "").length === 16 && expiry.length === 5 && cvv.length === 3 && name.trim().length > 1;

  function handlePay() {
    setStage("processing");
    setProgress(0);
    let p = 0;
    timerRef.current = setInterval(() => {
      p += Math.random() * 12 + 4;
      if (p >= 100) {
        p = 100;
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeout(() => {
          if (isFailCard()) {
            setStage("failed");
          } else {
            setStage("success");
            const ref = `PAY_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
            setTimeout(() => onSuccess(ref), 1600);
          }
        }, 400);
      }
      setProgress(Math.min(p, 100));
    }, 120);
  }

  const inputCls = "w-full h-11 px-3.5 rounded-[10px] border text-[13px] outline-none transition-all";
  const inputStyle = { borderColor: "#e2e8f0", background: "#f8fafc", color: "#1C1C1C" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={stage === "form" ? onClose : undefined}
    >
      <div
        className="w-full max-w-[420px] rounded-[22px] overflow-hidden shadow-2xl"
        style={{ background: "#fff" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ background: "#0A2E1A" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[15px] font-extrabold text-white leading-tight">Pay with Paystack</p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.55)" }}>{plan.display_name} plan · {fmt(plan.price_kobo)}/month</p>
            </div>
          </div>
          {stage === "form" && (
            <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        <div className="p-6">
          {stage === "form" && (
            <div className="space-y-4">
              {/* Test mode banner */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-[8px] text-[11px] font-semibold" style={{ background: "#fef9c3", color: "#854d0e", border: "1px solid #fde68a" }}>
                🧪 Test mode — use any card. Card starting with "0" simulates failure.
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wide block mb-1.5" style={{ color: "#374151", letterSpacing: "0.06em" }}>
                  Cardholder name
                </label>
                <input
                  className={inputCls}
                  style={inputStyle}
                  placeholder="John Adeyemi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wide block mb-1.5" style={{ color: "#374151", letterSpacing: "0.06em" }}>
                  Card number
                </label>
                <input
                  className={inputCls}
                  style={inputStyle}
                  placeholder="4532 0151 1234 5678"
                  value={card}
                  onChange={(e) => setCard(formatCardNumber(e.target.value))}
                  inputMode="numeric"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wide block mb-1.5" style={{ color: "#374151", letterSpacing: "0.06em" }}>
                    Expiry
                  </label>
                  <input
                    className={inputCls}
                    style={inputStyle}
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wide block mb-1.5" style={{ color: "#374151", letterSpacing: "0.06em" }}>
                    CVV
                  </label>
                  <input
                    className={inputCls}
                    style={inputStyle}
                    placeholder="•••"
                    maxLength={3}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    inputMode="numeric"
                    type="password"
                  />
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={!canPay}
                className="w-full h-12 rounded-[12px] text-white text-[14px] font-extrabold flex items-center justify-center gap-2 mt-2 transition-all disabled:opacity-40"
                style={{ background: "#0A2E1A", boxShadow: canPay ? "0 4px 14px rgba(26,122,66,0.4)" : "none" }}
              >
                <Lock className="w-4 h-4" />
                Pay {fmt(plan.price_kobo)}
              </button>

              <p className="text-center text-[11px] flex items-center justify-center gap-1.5" style={{ color: "#94a3b8" }}>
                <Lock className="w-3 h-3" /> Secured by Paystack · SSL encrypted
              </p>
            </div>
          )}

          {stage === "processing" && (
            <div className="py-10 flex flex-col items-center gap-5">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                  <circle
                    cx="32" cy="32" r="28" fill="none" stroke="#1A7A42" strokeWidth="4"
                    strokeDasharray={`${175.9 * progress / 100} 175.9`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 0.15s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[13px] font-bold" style={{ color: "#1A7A42" }}>{Math.round(progress)}%</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[15px] font-bold" style={{ color: "#1C1C1C" }}>Processing payment…</p>
                <p className="text-[12px] mt-1" style={{ color: "#6b7280" }}>Confirming with your bank</p>
              </div>
            </div>
          )}

          {stage === "success" && (
            <div className="py-10 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#F0FAF3" }}>
                <CheckCircle2 className="w-8 h-8" style={{ color: "#1A7A42" }} />
              </div>
              <div className="text-center">
                <p className="text-[17px] font-extrabold" style={{ color: "#1C1C1C" }}>Payment successful!</p>
                <p className="text-[13px] mt-1" style={{ color: "#6b7280" }}>
                  You&apos;re on the {plan.display_name} plan. Setting up your store…
                </p>
              </div>
              <Loader2 className="w-5 h-5 animate-spin mt-2" style={{ color: "#1A7A42" }} />
            </div>
          )}

          {stage === "failed" && (
            <div className="py-8 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#fee2e2" }}>
                <AlertCircle className="w-8 h-8" style={{ color: "#dc2626" }} />
              </div>
              <div className="text-center">
                <p className="text-[17px] font-extrabold" style={{ color: "#1C1C1C" }}>Payment failed</p>
                <p className="text-[13px] mt-1" style={{ color: "#6b7280" }}>Your card was declined. Please try again.</p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => { setStage("form"); setCard(""); setCvv(""); setExpiry(""); }}
                  className="flex-1 h-10 rounded-[10px] border text-[13px] font-semibold"
                  style={{ borderColor: "#e2e8f0", color: "#374151" }}
                >
                  Try again
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 h-10 rounded-[10px] text-[13px] font-semibold"
                  style={{ background: "#f1f5f9", color: "#374151" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
