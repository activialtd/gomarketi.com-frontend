"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Lock,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { identityApi } from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import { ROUTES } from "@/lib/config/routes";
import {
  StepIndicator,
  StepNIN,
  StepOTP,
  StepCAC,
  StepSuccess,
  getTiers,
  type KycTier,
  type TierInfo,
} from "./helpers";

function JourneyRail({ tiers }: { tiers: TierInfo[] }) {
  const stamped = tiers.filter((t) => t.status === "completed").length;
  return (
    <div className="px-1 py-4">
      <p
        className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4"
        style={{ color: "#94a3b8" }}
      >
        Access level · {stamped}/{tiers.length} verified
      </p>
      <div className="flex items-center">
        {tiers.map((tier, i) => {
          const done = tier.status === "completed";
          const active = tier.status === "active";
          return (
            <div
              key={tier.tier}
              className="flex items-center flex-1 last:flex-none"
            >
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background: done ? "#0A2E1A" : active ? "#fff" : "#f1f5f9",
                    border: active
                      ? "2px solid #1A7A42"
                      : done
                        ? "none"
                        : "2px solid #e2e8f0",
                  }}
                >
                  {done ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <span
                      className="text-[12px] font-extrabold"
                      style={{ color: active ? "#1A7A42" : "#94a3b8" }}
                    >
                      {tier.tier}
                    </span>
                  )}
                </div>
                <p
                  className="text-[10px] font-bold text-center leading-tight max-w-[72px]"
                  style={{ color: done || active ? "#1C1C1C" : "#94a3b8" }}
                >
                  {tier.name}
                </p>
              </div>
              {i < tiers.length - 1 && (
                <div
                  className="flex-1 h-0 mx-2 mb-4"
                  style={{
                    borderTop: `2px dashed ${done ? "#1A7A42" : "#e2e8f0"}`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Spotlight card — the one tier that currently needs action ────────────────

function TierSpotlight({
  tier,
  onStart,
}: {
  tier: TierInfo;
  onStart: (t: KycTier) => void;
}) {
  const Icon = tier.icon;
  return (
    <div
      className="rounded-[16px] border overflow-hidden"
      style={{
        borderColor: "#1A7A42",
        background: "#fff",
        boxShadow: "0 8px 28px rgba(10,46,26,0.08)",
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-0">
        {/* left rail */}
        <div
          className="p-5 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-4 sm:w-[120px]"
          style={{ background: "#F0FAF3", borderBottom: "1px solid #d1e8da" }}
        >
          <div
            className="w-11 h-11 rounded-[10px] flex items-center justify-center shrink-0"
            style={{ background: "#0A2E1A" }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="sm:mt-1">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.15em]"
              style={{ color: "#1A7A42" }}
            >
              Next up
            </p>
            <p
              className="text-[11px] font-semibold"
              style={{ color: "#3D6B4F" }}
            >
              Tier {tier.tier}
            </p>
          </div>
        </div>

        {/* right content */}
        <div className="p-5">
          <p
            className="text-[16px] font-extrabold"
            style={{ color: "#1C1C1C" }}
          >
            {tier.name}
          </p>
          <p className="text-[12.5px] mt-0.5" style={{ color: "#6b7280" }}>
            {tier.tagline}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
            {tier.unlocks.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "#F0FAF3" }}
                >
                  <CheckCircle2
                    className="w-2.5 h-2.5"
                    style={{ color: "#1A7A42" }}
                  />
                </div>
                <span
                  className="text-[12px] font-medium"
                  style={{ color: "#374151" }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onStart(tier.tier)}
            className="mt-5 w-full sm:w-auto h-11 px-6 rounded-[10px] text-[13px] font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{
              background: "#0A2E1A",
              boxShadow: "0 4px 14px rgba(26,122,66,0.3)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#239452")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#0A2E1A")}
          >
            Start verification
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Condensed row for a completed or locked tier ──────────────────────────────

function TierRow({
  tier,
  unlockHint,
}: {
  tier: TierInfo;
  unlockHint?: string;
}) {
  const done = tier.status === "completed";
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-[12px] border"
      style={{
        borderColor: done ? "#1A7A42" : "#e2e8f0",
        borderStyle: done ? "solid" : "dashed",
        background: done ? "rgba(26,122,66,0.03)" : "#fafafa",
        opacity: done ? 1 : 0.75,
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ background: done ? "#0A2E1A" : "#f1f5f9" }}
      >
        {done ? (
          <CheckCircle2 className="w-4 h-4 text-white" />
        ) : (
          <Lock className="w-3.5 h-3.5" style={{ color: "#94a3b8" }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-[13px] font-bold truncate"
          style={{ color: "#1C1C1C" }}
        >
          Tier {tier.tier} · {tier.name}
        </p>
        <p className="text-[11px]" style={{ color: "#94a3b8" }}>
          {done
            ? "Stamped — verification complete"
            : (unlockHint ?? "Locked for now")}
        </p>
      </div>
      {done && (
        <span
          className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0"
          style={{ background: "rgba(26,122,66,0.1)", color: "#1A7A42" }}
        >
          Verified
        </span>
      )}
    </div>
  );
}

// ─── Context panel — shown beside the active form during a verification flow ──

function ContextPanel({ tier }: { tier: TierInfo }) {
  const Icon = tier.icon;
  return (
    <div
      className="p-7 flex flex-col justify-between gap-8"
      style={{ background: "#0A2E1A" }}
    >
      <div>
        <div
          className="w-11 h-11 rounded-[10px] flex items-center justify-center mb-4"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p
          className="text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: "#86efac" }}
        >
          Tier {tier.tier}
        </p>
        <p className="text-[18px] font-extrabold text-white mt-1">
          {tier.name}
        </p>
        <p
          className="text-[13px] mt-3 leading-[1.6]"
          style={{ color: "rgba(255,255,255,0.62)" }}
        >
          {tier.tier === 2
            ? "We confirm your identity against CBN-licensed records, then text a one-time code to the phone number on file."
            : "We verify your business directly against the CAC and FIRS registries. No paperwork upload needed."}
        </p>
      </div>

      <div className="space-y-2.5">
        {tier.unlocks.slice(0, 3).map((item) => (
          <div key={item} className="flex items-start gap-2">
            <CheckCircle2
              className="w-3.5 h-3.5 shrink-0 mt-0.5"
              style={{ color: "#86efac" }}
            />
            <span
              className="text-[12px] leading-snug"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

// Tier 2: BVN/NIN identity check + OTP confirmation (CBN Tier 1 individual)
const TIER2_STEPS = ["Identity", "Confirm code", "Complete"];

// Tier 3: CAC + TIN business check (CBN Tier 2 KYB — no OTP, no bank statement)
const TIER3_STEPS = ["Business (KYB)", "Complete"];

export default function KYCPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [completedTiers, setCompletedTiers] = useState<KycTier[]>([1]);
  const [activeTier, setActiveTier] = useState<KycTier | null>(null);
  const [step, setStep] = useState(0);

  // Carried from the identity step into the OTP step
  const [otpMethod, setOtpMethod] = useState<"bvn" | "nin">("bvn");
  const [maskedPhone, setMaskedPhone] = useState<string | undefined>(undefined);

  // Load current KYC status
  useEffect(() => {
    if (!accessToken) return;
    identityApi
      .getVendorProfile(accessToken)
      .then((p) => {
        const done: KycTier[] = [1];
        if (p.has_nin || p.has_bvn) done.push(2);
        if (p.cac_number) done.push(3);
        setCompletedTiers(done);
      })
      .catch(() => {});
  }, [accessToken]);

  // Passes whichever of BVN/NIN the user chose, plus name/DOB for Smile ID matching.
  // The provider (bank for BVN, NIMC for NIN) responds by texting an OTP to the
  // phone number on file — we surface a masked version of it for the next step.
  async function verifyIdentity(
    idValue: string,
    method: "bvn" | "nin",
    firstName: string,
    lastName: string,
    dob: string,
  ) {
    if (!accessToken) return;
    const res = await identityApi.submitKYC(
      {
        [method]: idValue, // sends as bvn: or nin: based on user's choice
        first_name: firstName,
        last_name: lastName,
        dob: dob,
      },
      accessToken,
    );
    setOtpMethod(method);
    // TODO: confirm the exact field name your api-client returns for the
    // masked phone number the OTP was sent to (e.g. res.masked_phone).
    setMaskedPhone(
      (res as { masked_phone?: string } | undefined)?.masked_phone,
    );
  }

  // TODO: wire these to the actual endpoints once available on identityApi —
  // named to mirror submitKYC's (payload, accessToken) signature.
  async function verifyOtp(otp: string) {
    if (!accessToken) return;
    await (
      identityApi as unknown as {
        verifyKycOtp: (
          payload: { method: "bvn" | "nin"; otp: string },
          token: string,
        ) => Promise<unknown>;
      }
    ).verifyKycOtp({ method: otpMethod, otp }, accessToken);
    nextStep();
  }

  async function resendOtp() {
    if (!accessToken) return;
    await (
      identityApi as unknown as {
        resendKycOtp: (
          payload: { method: "bvn" | "nin" },
          token: string,
        ) => Promise<unknown>;
      }
    ).resendKycOtp({ method: otpMethod }, accessToken);
  }

  async function verifyCAC(cac_number: string) {
    if (!accessToken) return;
    await identityApi.submitKYC({ cac_number }, accessToken);
  }

  function skipKYC() {
    // Ensure tour shows on first dashboard visit for new users
    if (typeof window !== "undefined")
      localStorage.removeItem("gm_dash_tour_v2");
    router.push(ROUTES.MERCHANT.OVERVIEW);
  }

  const tiers = getTiers(completedTiers);
  const spotlightTier = tiers.find((t) => t.status === "active");

  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Entrance animation — header fades in first, body stacks up
  useEffect(() => {
    const tl = gsap.timeline();
    if (headerRef.current) {
      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
      );
    }
    if (bodyRef.current) {
      tl.fromTo(
        bodyRef.current.querySelectorAll("[data-block]"),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.4, ease: "power2.out" },
        "-=0.2",
      );
    }
  }, []);

  // When starting a tier flow — slide overview out, slide card in
  function handleStartTier(tier: KycTier) {
    if (!bodyRef.current) {
      setActiveTier(tier);
      setStep(0);
      return;
    }
    gsap.to(bodyRef.current, {
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
    // Redirect to dashboard — tour will show since key was cleared during onboarding
    if (typeof window !== "undefined")
      localStorage.removeItem("gm_dash_tour_v2");
    router.push(ROUTES.MERCHANT.OVERVIEW);
    // Animate overview back in
    setTimeout(() => {
      if (bodyRef.current) {
        gsap.fromTo(
          bodyRef.current,
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
  const activeTierInfo = tiers.find((t) => t.tier === activeTier);

  return (
    <div
      ref={pageRef}
      className={`w-full mx-auto ${activeTier ? "max-w-3xl" : "max-w-2xl"}`}
    >
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

      {/* ── Overview (shown when no active flow) ────────────── */}
      {!activeTier && (
        <div ref={bodyRef} className="space-y-4">
          <div data-block>
            <JourneyRail tiers={tiers} />
          </div>

          {spotlightTier && (
            <div data-block>
              <TierSpotlight tier={spotlightTier} onStart={handleStartTier} />
            </div>
          )}

          <div data-block className="space-y-2.5">
            {tiers
              .filter((t) => t.tier !== 1 && t.tier !== spotlightTier?.tier)
              .map((t) => (
                <TierRow
                  key={t.tier}
                  tier={t}
                  unlockHint={
                    t.status === "locked"
                      ? "Unlocks after Tier 2 is verified"
                      : undefined
                  }
                />
              ))}
          </div>

          {/* Skip KYC */}
          <div data-block>
            <button
              type="button"
              onClick={skipKYC}
              className="w-full py-3 text-[13px] font-semibold transition-colors rounded-[10px] border"
              style={{
                borderColor: "#e2e8f0",
                color: "#6b7280",
                background: "#fafafa",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#f1f5f9")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#fafafa")}
            >
              Skip verification for now — go to dashboard →
            </button>
            <p
              className="text-center text-[11px] mt-2"
              style={{ color: "#94a3b8" }}
            >
              You can always complete verification later from Settings.
            </p>
          </div>
        </div>
      )}

      {/* ── Active verification flow ──────────────────────── */}
      {activeTier && activeTierInfo && (
        <div>
          {/* Back to overview */}
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
              Back to overview
            </button>
          )}

          {/* Step indicator */}
          {!isSuccessStep && (
            <div className="mb-6">
              <StepIndicator current={step} steps={steps} />
            </div>
          )}

          {/* Card — split into context panel + form panel while a flow is in progress */}
          {isSuccessStep ? (
            <div
              data-card
              className="rounded-[16px] border p-6"
              style={{
                background: "#fff",
                borderColor: "#e2e8f0",
                boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
              }}
            >
              <StepSuccess
                tier={activeTier as 2 | 3}
                onDone={handleTierComplete}
              />
            </div>
          ) : (
            <div
              data-card
              className="rounded-[16px] border overflow-hidden grid grid-cols-1 sm:grid-cols-[280px_1fr]"
              style={{
                borderColor: "#e2e8f0",
                boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
              }}
            >
              <ContextPanel tier={activeTierInfo} />
              <div className="p-6 sm:p-8" style={{ background: "#fff" }}>
                {activeTier === 2 && step === 0 && (
                  <StepNIN onNext={nextStep} onVerify={verifyIdentity} />
                )}
                {activeTier === 2 && step === 1 && (
                  <StepOTP
                    method={otpMethod}
                    maskedPhone={maskedPhone}
                    onVerify={verifyOtp}
                    onResend={resendOtp}
                  />
                )}
                {activeTier === 3 && step === 0 && (
                  <StepCAC onNext={nextStep} onVerify={verifyCAC} />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
