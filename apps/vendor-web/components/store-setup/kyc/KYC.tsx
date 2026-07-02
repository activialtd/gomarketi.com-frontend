"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Lock,
  ChevronRight,
  Zap,
  Shield,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { identityApi } from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import { ROUTES } from "@/lib/config/routes";
import {
  StepIndicator,
  StepNIN,
  StepCAC,
  StepSuccess,
  getTiers,
  type KycTier,
  type TierInfo,
} from "./helpers";

// ─── Tier card ────────────────────────────────────────────────────────────────

function TierCard({
  tier,
  onStart,
}: {
  tier: TierInfo;
  onStart: (t: KycTier) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isCompleted = tier.status === "completed";
  const isActive = tier.status === "active";
  const isLocked = tier.status === "locked";

  const Icon = tier.icon;

  return (
    <div
      ref={ref}
      className="rounded-[16px] border overflow-hidden transition-all"
      style={{
        borderColor: isCompleted ? "#1A7A42" : isActive ? "#0A2E1A" : "#e2e8f0",
        background: isCompleted ? "rgba(26,122,66,0.03)" : "#fff",
        opacity: isLocked ? 0.6 : 1,
      }}
    >
      {/* Top strip */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{
          background: isCompleted
            ? "#0A2E1A"
            : isActive
              ? "#0A2E1A"
              : "#fafafa",
          borderBottom: "1px solid",
          borderColor:
            isCompleted || isActive ? "rgba(255,255,255,0.08)" : "#f1f5f9",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0"
            style={{
              background:
                isCompleted || isActive
                  ? "rgba(255,255,255,0.12)"
                  : `${tier.color}14`,
            }}
          >
            <Icon
              className="w-4 h-4"
              style={{ color: isCompleted || isActive ? "#fff" : tier.color }}
            />
          </div>
          <div>
            <p
              className="text-[14px] font-extrabold"
              style={{ color: isCompleted || isActive ? "#fff" : "#1C1C1C" }}
            >
              Tier {tier.tier} · {tier.name}
            </p>
            <p
              className="text-[11px] mt-0.5"
              style={{
                color:
                  isCompleted || isActive ? "rgba(255,255,255,0.5)" : "#94a3b8",
              }}
            >
              {tier.tagline}
            </p>
          </div>
        </div>

        {/* Status chip */}
        {isCompleted && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0"
            style={{ background: "rgba(34,197,94,0.15)", color: "#86efac" }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Complete
          </div>
        )}
        {isLocked && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0"
            style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}
          >
            <Lock className="w-3.5 h-3.5" />
            Locked
          </div>
        )}
      </div>

      {/* Unlocks list */}
      <div className="px-5 py-4 space-y-2.5">
        {tier.unlocks.map((item) => (
          <div key={item} className="flex items-center gap-2.5">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: isCompleted ? "#F0FAF3" : "#f1f5f9",
              }}
            >
              <CheckCircle2
                className="w-2.5 h-2.5"
                style={{ color: isCompleted ? "#1A7A42" : "#9ca3af" }}
              />
            </div>
            <span
              className="text-[12.5px] font-medium"
              style={{
                color: isCompleted
                  ? "#374151"
                  : isLocked
                    ? "#9ca3af"
                    : "#374151",
              }}
            >
              {item}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      {isActive && (
        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={() => onStart(tier.tier)}
            className="w-full h-11 rounded-[10px] border border-[#1A7A42] cursor-pointer text-[13px] font-bold flex items-center justify-center gap-2 transition-all text-black "
          >
            Start verification
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

// Tier 2: BVN/NIN identity check (CBN Tier 1 individual)
const TIER2_STEPS = ["Identity", "Complete"];

// Tier 3: CAC + TIN business check (CBN Tier 2 KYB — bank statement removed)
const TIER3_STEPS = ["Business (KYB)", "Complete"];

export default function KYCPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [completedTiers, setCompletedTiers] = useState<KycTier[]>([1]);
  const [activeTier, setActiveTier] = useState<KycTier | null>(null);
  const [step, setStep] = useState(0);

  // Load current KYC status
  useEffect(() => {
    if (!accessToken) return;
    identityApi.getVendorProfile(accessToken).then((p) => {
      const done: KycTier[] = [1];
      if (p.has_nin || p.has_bvn) done.push(2);
      if (p.cac_number) done.push(3);
      setCompletedTiers(done);
    }).catch(() => {});
  }, [accessToken]);

  // idValue is either a BVN or NIN — backend accepts both via the same field
  async function verifyNIN(idValue: string) {
    if (!accessToken) return;
    // 11-digit BVN and NIN go to their respective fields; length is the same
    // We send as nin by default; the KYC form tells the user which they're submitting
    await identityApi.submitKYC({ nin: idValue }, accessToken);
  }

  async function verifyCAC(cac_number: string) {
    if (!accessToken) return;
    await identityApi.submitKYC({ cac_number }, accessToken);
  }

  function skipKYC() {
    router.push(ROUTES.MERCHANT.OVERVIEW);
  }

  const tiers = getTiers(completedTiers);

  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const tiersRef = useRef<HTMLDivElement>(null);

  // Entrance animation — header fades in first, cards stagger up
  useEffect(() => {
    const tl = gsap.timeline();
    if (headerRef.current) {
      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
      );
    }
    if (tiersRef.current) {
      tl.fromTo(
        tiersRef.current.querySelectorAll("[data-tier-card]"),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.4, ease: "power2.out" },
        "-=0.2",
      );
    }
  }, []);

  // When starting a tier flow — slide tier list out, slide card in
  function handleStartTier(tier: KycTier) {
    if (!tiersRef.current) {
      setActiveTier(tier);
      setStep(0);
      return;
    }
    gsap.to(tiersRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        setActiveTier(tier);
        setStep(0);
      },
    });
  }

  // Step advance with slide animation
  function nextStep() {
    const card = pageRef.current?.querySelector("[data-card]");
    if (card) {
      gsap.to(card, {
        x: -30,
        opacity: 0,
        duration: 0.28,
        ease: "power2.in",
        onComplete: () => {
          setStep((s) => s + 1);
          setTimeout(() => {
            const newCard = pageRef.current?.querySelector("[data-card]");
            if (newCard)
              gsap.fromTo(
                newCard,
                { x: 30, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.32, ease: "power2.out" },
              );
          }, 40);
        },
      });
    } else {
      setStep((s) => s + 1);
    }
  }

  // When a tier flow completes
  function handleTierComplete() {
    if (activeTier)
      setCompletedTiers((prev) => [...prev, activeTier] as KycTier[]);
    setActiveTier(null);
    setStep(0);
    // Redirect to dashboard after completing any tier
    router.push(ROUTES.MERCHANT.OVERVIEW);
    // Animate tiers back in
    setTimeout(() => {
      if (tiersRef.current) {
        gsap.fromTo(
          tiersRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
        );
      }
    }, 50);
  }

  // Which steps array to use
  const steps = activeTier === 2 ? TIER2_STEPS : TIER3_STEPS;

  // Last step index = success step
  const isSuccessStep = step === steps.length - 1;

  return (
    <div ref={pageRef} className="w-full max-w-2xl mx-auto">
      {/* ── Header ─────────────────────────────────────────── */}
      <div ref={headerRef} className="mb-8">
        <Link
          href={ROUTES.MERCHANT.SETTINGS}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium mb-5 group transition-colors"
          style={{ color: "#6b7280" }}
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to settings
        </Link>

        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0"
            style={{ background: "#0A2E1A" }}
          >
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1
              className="text-[20px] font-extrabold"
              style={{ color: "#1C1C1C", letterSpacing: "-0.3px" }}
            >
              Verification & KYC
            </h1>
            <p className="text-[12px]" style={{ color: "#6b7280" }}>
              Complete tiers to unlock more features and higher payout limits
            </p>
          </div>
        </div>
      </div>

      {/* ── Tier overview (shown when no active flow) ──────── */}
      {!activeTier && (
        <div ref={tiersRef} className="space-y-4">
          {tiers.map((tier) => (
            <div key={tier.tier} data-tier-card>
              <TierCard tier={tier} onStart={handleStartTier} />
            </div>
          ))}

          {/* Skip KYC */}
          <button
            type="button"
            onClick={skipKYC}
            className="w-full py-3 text-[13px] font-semibold transition-colors rounded-[10px] border"
            style={{ borderColor: "#e2e8f0", color: "#6b7280", background: "#fafafa" }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#f1f5f9")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#fafafa")}
          >
            Skip verification for now — go to dashboard →
          </button>
          <p className="text-center text-[11px]" style={{ color: "#94a3b8" }}>
            You can always complete verification later from Settings.
          </p>
        </div>
      )}

      {/* ── Active verification flow ──────────────────────── */}
      {activeTier && (
        <div>
          {/* Back to tiers */}
          {!isSuccessStep && (
            <button
              type="button"
              onClick={() => {
                setActiveTier(null);
                setStep(0);
              }}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium mb-6 group transition-colors"
              style={{ color: "#6b7280" }}
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              Back to tiers
            </button>
          )}

          {/* Step indicator */}
          <div className="flex justify-center mb-8">
            <StepIndicator current={step} steps={steps} />
          </div>

          {/* Card */}
          <div
            data-card
            className="rounded-[16px] border p-6"
            style={{
              background: "#fff",
              borderColor: "#e2e8f0",
              boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
            }}
          >
            {/* Tier 2 — CBN Tier 1 Individual (BVN or NIN) */}
            {activeTier === 2 && step === 0 && (
              <>
                <p className="text-[16px] font-extrabold mb-1" style={{ color: "#1C1C1C" }}>
                  Individual identity verification
                </p>
                <p className="text-[12.5px] mb-1" style={{ color: "#6b7280" }}>
                  Submit your BVN or NIN to unlock payouts up to ₦50,000/day.
                </p>
                <div className="flex items-center gap-2 mb-5 px-2.5 py-1.5 rounded-[6px] w-fit" style={{ background: "#eff6ff" }}>
                  <span className="text-[11px] font-bold" style={{ color: "#3b82f6" }}>CBN Tier 1 · Max ₦50,000/day withdrawal</span>
                </div>
                <StepNIN onNext={nextStep} onVerify={verifyNIN} />
              </>
            )}
            {activeTier === 2 && isSuccessStep && (
              <StepSuccess tier={2} onDone={handleTierComplete} />
            )}

            {/* Tier 3 — CBN Tier 2 KYB (CAC + TIN, no bank statement required) */}
            {activeTier === 3 && step === 0 && (
              <>
                <p className="text-[16px] font-extrabold mb-1" style={{ color: "#1C1C1C" }}>
                  Business verification (KYB)
                </p>
                <p className="text-[12.5px] mb-1" style={{ color: "#6b7280" }}>
                  Register your business to unlock unlimited payouts and the GoMarket Verified badge.
                </p>
                <div className="flex items-center gap-2 mb-5 px-2.5 py-1.5 rounded-[6px] w-fit" style={{ background: "#F0FAF3" }}>
                  <span className="text-[11px] font-bold" style={{ color: "#1A7A42" }}>CBN Tier 2 · Unlimited withdrawals</span>
                </div>
                <StepCAC onNext={nextStep} onVerify={verifyCAC} />
              </>
            )}
            {activeTier === 3 && isSuccessStep && (
              <StepSuccess tier={3} onDone={handleTierComplete} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
