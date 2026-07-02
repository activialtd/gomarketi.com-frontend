"use client";

import { useRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import gsap from "gsap";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  EyeOff,
  Eye,
  Loader2,
  ChevronRight,
  Upload,
  FileText,
  X,
  Shield,
  ShieldCheck,
  Zap,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/config/routes";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TierStatus = "completed" | "active" | "locked";
export type KycTier = 1 | 2 | 3;

export type TierInfo = {
  tier: KycTier;
  name: string;
  tagline: string;
  icon: React.ElementType;
  color: string;
  unlocks: string[];
  status: TierStatus;
};

// ─── Schemas ─────────────────────────────────────────────────────────────────

// Tier 1 — Individual identity (CBN: BVN or NIN required)
export const identitySchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    method: z.enum(["bvn", "nin"]),
    bvn: z.string().optional(),
    nin: z.string().optional(),
    consent: z.boolean().refine((v) => v, "You must consent to data processing"),
  })
  .superRefine((d, ctx) => {
    const val = d.method === "bvn" ? d.bvn : d.nin;
    if (!val || !/^\d{11}$/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${d.method === "bvn" ? "BVN" : "NIN"} must be exactly 11 digits`,
        path: [d.method],
      });
    }
  });

// Tier 2 — Business / KYB (CBN: CAC + TIN required)
export const kybSchema = z.object({
  rcNumber: z.string().min(4, "Enter your RC number (e.g. RC1234567)").max(20),
  businessName: z.string().min(2, "Registered business name is required"),
  tin: z
    .string()
    .min(8, "TIN must be at least 8 digits")
    .max(15)
    .regex(/^\d+(-\d+)?$/, "Enter a valid TIN (digits only)"),
  directorName: z.string().min(3, "Director / owner full name is required"),
  consent: z.boolean().refine((v) => v, "You must consent to data processing"),
});

export type IdentityValues = z.infer<typeof identitySchema>;
export type KYBValues = z.infer<typeof kybSchema>;

// Keep legacy aliases so KYC.tsx import doesn't break immediately
export const ninSchema = identitySchema;
export const cacSchema = kybSchema;
export type NINValues = IdentityValues;
export type CACValues = KYBValues;

// ─── Tier config ──────────────────────────────────────────────────────────────

export function getTiers(completedTiers: KycTier[]): TierInfo[] {
  const completed = (t: KycTier) => completedTiers.includes(t);
  return [
    {
      tier: 1,
      name: "Active seller",
      tagline: "Store open, manual payouts",
      icon: Zap,
      color: "#6b7280",
      unlocks: [
        "Create your storefront",
        "List unlimited products",
        "Accept orders via your store link",
      ],
      status: "completed", // always completed — signup grants this
    },
    {
      tier: 2,
      name: "Individual / Casual Seller",
      tagline: "BVN or NIN — Tier 1 CBN",
      icon: Shield,
      color: "#3b82f6",
      unlocks: [
        "Automated Paystack payouts",
        "Up to ₦50,000 withdrawal/day",
        "GoMarket identity badge",
        "Faster dispute resolution",
      ],
      status: completed(2) ? "completed" : "active", // always unlocked
    },
    {
      tier: 3,
      name: "Registered Business",
      tagline: "CAC + TIN — Tier 2 CBN (KYB)",
      icon: Building2,
      color: "#1A7A42",
      unlocks: [
        "Unlimited daily withdrawals",
        "GoMarket Verified Business badge",
        "Priority support & account manager",
        "Featured storefront placement",
      ],
      status: completed(3) ? "completed" : completed(2) ? "active" : "locked",
    },
  ];
}

// ─── Shared field wrapper ─────────────────────────────────────────────────────

export function KYCInput({
  label,
  hint,
  error,
  required = false,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        className="text-[11px] font-bold uppercase tracking-[0.1em]"
        style={{ color: "#3D6B4F" }}
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px]" style={{ color: "#94a3b8" }}>
          {hint}
        </p>
      )}
      {error && (
        <div className="flex items-center gap-1.5">
          <AlertCircle
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: "#dc2626" }}
          />
          <p className="text-[11px]" style={{ color: "#dc2626" }}>
            {error}
          </p>
        </div>
      )}
    </div>
  );
}

export const inputClass =
  "w-full h-[44px] px-3.5 rounded-[10px] border text-[13px] font-medium outline-none transition-all bg-[#F0FAF3] focus:bg-white focus:border-[#1A7A42] focus:outline-[2px] focus:outline-[#1A7A42] focus:outline-offset-[-2px]";
export const inputStyle = { borderColor: "#e2e8f0", color: "#1C1C1C" };

// ─── Step indicator ───────────────────────────────────────────────────────────

export function StepIndicator({
  current,
  steps,
}: {
  current: number;
  steps: string[];
}) {
  return (
    <div className="flex items-center">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-extrabold transition-all duration-300"
                style={{
                  background: done ? "#0A2E1A" : active ? "#0A2E1A" : "#f1f5f9",
                  color: done || active ? "#fff" : "#94a3b8",
                  boxShadow: active ? "0 0 0 3px rgba(26,122,66,0.2)" : "none",
                }}
              >
                {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <p
                className="text-[10px] font-bold whitespace-nowrap"
                style={{
                  color: active ? "#0A2E1A" : done ? "#1A7A42" : "#94a3b8",
                }}
              >
                {label}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div
                className="w-12 sm:w-20 h-px mb-5 mx-1 transition-all duration-500"
                style={{ background: done ? "#1A7A42" : "#e2e8f0" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Animated shield ──────────────────────────────────────────────────────────

export function AnimatedShield({ filled }: { filled: boolean }) {
  const fillRef = useRef<SVGPathElement>(null);
  const checkRef = useRef<SVGGElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!fillRef.current || !checkRef.current || !ringRef.current) return;
    if (filled) {
      const tl = gsap.timeline();
      tl.to(fillRef.current, {
        scaleY: 1,
        transformOrigin: "bottom center",
        duration: 0.6,
        ease: "power3.out",
      })
        .to(
          ringRef.current,
          { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" },
          "-=0.2",
        )
        .to(
          checkRef.current,
          {
            opacity: 1,
            scale: 1,
            transformOrigin: "center",
            duration: 0.35,
            ease: "back.out(2)",
          },
          "-=0.1",
        );
    } else {
      gsap.to(fillRef.current, { scaleY: 0, duration: 0.3, ease: "power2.in" });
      gsap.to(checkRef.current, { opacity: 0, scale: 0.5, duration: 0.2 });
      gsap.to(ringRef.current, { strokeDashoffset: 157, duration: 0.3 });
    }
  }, [filled]);

  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        ref={ringRef}
        cx="48"
        cy="48"
        r="44"
        stroke={filled ? "#1A7A42" : "#e2e8f0"}
        strokeWidth="1.5"
        strokeDasharray="276"
        strokeDashoffset={filled ? 0 : 276}
        style={{ transition: "stroke 0.3s" }}
      />
      <path
        d="M48 16L22 26V46C22 60 33 73 48 80C63 73 74 60 74 46V26L48 16Z"
        fill="#F0FAF3"
        stroke="#e2e8f0"
        strokeWidth="1.5"
      />
      <path
        ref={fillRef}
        d="M48 16L22 26V46C22 60 33 73 48 80C63 73 74 60 74 46V26L48 16Z"
        fill="#1A7A42"
        style={{ transform: "scaleY(0)", transformOrigin: "80px center" }}
      />
      <g
        ref={checkRef}
        style={{
          opacity: 0,
          transform: "scale(0.5)",
          transformOrigin: "48px 48px",
        }}
      >
        <path
          d="M35 48L44 57L61 40"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      {!filled && (
        <g style={{ opacity: 0.35 }}>
          <rect
            x="40"
            y="46"
            width="16"
            height="12"
            rx="2"
            stroke="#6b7280"
            strokeWidth="1.5"
          />
          <path
            d="M43 46v-3a5 5 0 0110 0v3"
            stroke="#6b7280"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
}

// ─── Step NIN ─────────────────────────────────────────────────────────────────

// StepNIN is now the Tier 1 individual identity step (BVN or NIN — CBN framework)
export function StepNIN({ onNext, onVerify }: {
  onNext: () => void;
  onVerify?: (idValue: string, method: "bvn" | "nin", firstName: string, lastName: string, dob: string) => Promise<void>;
}) {
  const formRef = useRef<HTMLDivElement>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [valueVisible, setValueVisible] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IdentityValues>({ resolver: zodResolver(identitySchema), defaultValues: { method: "bvn" } });

  const method = watch("method");

  useEffect(() => {
    if (!formRef.current) return;
    gsap.fromTo(
      formRef.current.querySelectorAll("[data-field]"),
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, stagger: 0.07, duration: 0.45, ease: "power2.out", delay: 0.1 },
    );
  }, []);

  async function onSubmit(data: IdentityValues) {
    setVerifying(true);
    setVerifyError("");
    try {
      const idValue = data.method === "bvn" ? data.bvn! : data.nin!;
      if (onVerify) {
        await onVerify(idValue, data.method, data.firstName, data.lastName, data.dateOfBirth);
      } else {
        await new Promise((r) => setTimeout(r, 1500));
      }
      onNext();
    } catch {
      setVerifyError(`Verification failed. Please check your ${method.toUpperCase()} and try again.`);
    } finally {
      setVerifying(false);
    }
  }

  const idError = method === "bvn" ? (errors as Record<string, { message?: string }>).bvn?.message : (errors as Record<string, { message?: string }>).nin?.message;

  return (
    <div ref={formRef} className="space-y-5">
      {/* CBN Tier 1 info */}
      <div data-field className="flex items-start gap-3 p-4 rounded-[10px]" style={{ background: "#eff6ff", border: "1px solid rgba(59,130,246,0.2)" }}>
        <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#3b82f6" }} />
        <p className="text-[12.5px] leading-relaxed" style={{ color: "#1e40af" }}>
          This is your <strong>Tier 1 CBN verification</strong> — required for automated payouts up to ₦50,000/day.
          Your BVN or NIN is encrypted end-to-end and never shared with third parties.
        </p>
      </div>

      {/* BVN vs NIN choice */}
      <div data-field>
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] mb-2.5" style={{ color: "#3D6B4F" }}>
          Verification method
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(["bvn", "nin"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setValue("method", m)}
              className="flex flex-col items-start px-4 py-3 rounded-[10px] border text-left transition-all"
              style={{ borderColor: method === m ? "#1A7A42" : "#e2e8f0", background: method === m ? "rgba(26,122,66,0.04)" : "#fafafa" }}>
              <p className="text-[13px] font-bold" style={{ color: method === m ? "#1A7A42" : "#1C1C1C" }}>
                {m === "bvn" ? "BVN" : "NIN"}
              </p>
              <p className="text-[11px]" style={{ color: "#6b7280" }}>
                {m === "bvn" ? "Bank Verification Number" : "National ID Number"}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Name fields */}
      <div data-field className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KYCInput label="First name" required error={errors.firstName?.message}>
          <input className={inputClass} style={inputStyle} placeholder="As on your ID" {...register("firstName")} />
        </KYCInput>
        <KYCInput label="Last name" required error={errors.lastName?.message}>
          <input className={inputClass} style={inputStyle} placeholder="As on your ID" {...register("lastName")} />
        </KYCInput>
      </div>

      {/* Date of birth */}
      <div data-field>
        <KYCInput label="Date of birth" required error={errors.dateOfBirth?.message}>
          <input className={inputClass} style={inputStyle} type="date" {...register("dateOfBirth")} />
        </KYCInput>
      </div>

      {/* BVN / NIN field */}
      <div data-field>
        <KYCInput
          label={method === "bvn" ? "BVN (Bank Verification Number)" : "NIN (National Identification Number)"}
          required
          hint={method === "bvn" ? "11-digit number — dial *565*0# on your registered phone" : "11-digit number on your NIMC card or slip"}
          error={idError}
        >
          <div className="relative">
            <input
              className={`${inputClass} pr-10`}
              style={{ ...inputStyle, letterSpacing: valueVisible ? "normal" : "0.2em", fontFamily: "monospace" }}
              type={valueVisible ? "text" : "password"}
              placeholder="00000000000"
              maxLength={11}
              {...register(method)}
            />
            <button type="button" onClick={() => setValueVisible((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[#F0FAF3] transition-colors">
              {valueVisible ? <EyeOff className="w-4 h-4" style={{ color: "#94a3b8" }} /> : <Eye className="w-4 h-4" style={{ color: "#94a3b8" }} />}
            </button>
          </div>
        </KYCInput>
      </div>

      {/* NDPA Consent — required by Nigeria Data Protection Act */}
      <div data-field className="flex items-start gap-3 p-3.5 rounded-[10px] border" style={{ borderColor: "#e2e8f0", background: "#fafafa" }}>
        <input type="checkbox" id="id-consent" className="w-4 h-4 mt-0.5 accent-[#1A7A42] shrink-0" {...register("consent")} />
        <label htmlFor="id-consent" className="text-[12px] leading-relaxed cursor-pointer" style={{ color: "#374151" }}>
          I consent to GoMarketi processing my {method === "bvn" ? "BVN" : "NIN"} for identity verification purposes
          in accordance with the <strong>Nigeria Data Protection Act (NDPA)</strong>. My data is encrypted
          and will only be used to verify my identity on this platform.
        </label>
      </div>
      {errors.consent && <p className="text-[11px]" style={{ color: "#dc2626" }}>{errors.consent.message}</p>}

      <button type="button" onClick={handleSubmit(onSubmit)} disabled={verifying}
        className="w-full h-[48px] rounded-[12px] text-[14px] font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
        style={{ background: "#0A2E1A", boxShadow: "0 4px 14px rgba(26,122,66,0.3)" }}
        onMouseOver={(e) => !verifying && (e.currentTarget.style.background = "#239452")}
        onMouseOut={(e) => (e.currentTarget.style.background = "#0A2E1A")}
      >
        {verifying ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : <>Verify {method.toUpperCase()} <ChevronRight className="w-4 h-4" /></>}
      </button>
      {verifyError && <p className="text-[12px] text-center" style={{ color: "#dc2626" }}>{verifyError}</p>}
      <p className="text-center text-[11px]" style={{ color: "#94a3b8" }}>
        🔒 AES-256 encrypted · Verified via licensed KYC provider · NDPA compliant
      </p>
    </div>
  );
}

// ─── Step CAC / KYB — Tier 2 Business Verification (CBN framework) ────────────

export function StepCAC({ onNext, onVerify }: { onNext: () => void; onVerify?: (cac_number: string) => Promise<void> }) {
  const formRef = useRef<HTMLDivElement>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<KYBValues>({ resolver: zodResolver(kybSchema) });

  useEffect(() => {
    if (!formRef.current) return;
    gsap.fromTo(
      formRef.current.querySelectorAll("[data-field]"),
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, stagger: 0.07, duration: 0.45, ease: "power2.out", delay: 0.1 },
    );
  }, []);

  async function onSubmit(data: KYBValues) {
    setVerifying(true);
    setVerifyError("");
    try {
      if (onVerify) await onVerify(data.rcNumber);
      else await new Promise((r) => setTimeout(r, 1600));
      onNext();
    } catch {
      setVerifyError("Business verification failed. Please check your RC number and try again.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div ref={formRef} className="space-y-5">
      {/* KYB info banner */}
      <div data-field className="flex items-start gap-3 p-4 rounded-[10px]" style={{ background: "#F0FAF3", border: "1px solid rgba(26,122,66,0.2)" }}>
        <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#1A7A42" }} />
        <p className="text-[12.5px] leading-relaxed" style={{ color: "#0A2E1A" }}>
          This is your <strong>Tier 2 KYB (Know Your Business)</strong> check — required for unlimited payouts.
          We verify directly against the CAC and FIRS databases.
        </p>
      </div>

      {/* Business name */}
      <div data-field>
        <KYCInput label="Registered business name" required error={errors.businessName?.message} hint="Exactly as it appears on your Certificate of Incorporation">
          <input className={inputClass} style={inputStyle} placeholder="Eko Fashion House Limited" {...register("businessName")} />
        </KYCInput>
      </div>

      {/* RC Number */}
      <div data-field>
        <KYCInput label="CAC RC Number" required error={errors.rcNumber?.message} hint="On your Certificate of Incorporation (e.g. RC1234567)">
          <input className={inputClass} style={inputStyle} placeholder="RC1234567" {...register("rcNumber")} />
        </KYCInput>
      </div>

      {/* TIN */}
      <div data-field>
        <KYCInput label="Tax Identification Number (TIN)" required error={errors.tin?.message} hint="From the FIRS TIN portal (tin.firs.gov.ng)">
          <input className={inputClass} style={inputStyle} placeholder="1234567-0001" {...register("tin")} />
        </KYCInput>
      </div>

      {/* Director info */}
      <div data-field>
        <KYCInput label="Director / Beneficial owner full name" required error={errors.directorName?.message} hint="A person with 25% or more ownership of the business">
          <input className={inputClass} style={inputStyle} placeholder="Akachi Ezekiel Okonkwo" {...register("directorName")} />
        </KYCInput>
      </div>

      {/* NDPA Consent */}
      <div data-field className="flex items-start gap-3 p-3.5 rounded-[10px] border" style={{ borderColor: "#e2e8f0", background: "#fafafa" }}>
        <input type="checkbox" id="kyb-consent" className="w-4 h-4 mt-0.5 accent-[#1A7A42] shrink-0" {...register("consent")} />
        <label htmlFor="kyb-consent" className="text-[12px] leading-relaxed cursor-pointer" style={{ color: "#374151" }}>
          I confirm that the business information provided is accurate and I am authorised to submit this on behalf of the company.
          I consent to GoMarketi verifying this information via CAC and FIRS databases in accordance with the <strong>Nigeria Data Protection Act (NDPA)</strong>.
        </label>
      </div>
      {errors.consent && <p className="text-[11px]" style={{ color: "#dc2626" }}>{errors.consent.message}</p>}

      <button type="button" onClick={handleSubmit(onSubmit)} disabled={verifying}
        className="w-full h-[48px] rounded-[12px] text-[14px] font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
        style={{ background: "#0A2E1A", boxShadow: "0 4px 14px rgba(26,122,66,0.3)" }}
        onMouseOver={(e) => !verifying && (e.currentTarget.style.background = "#239452")}
        onMouseOut={(e) => (e.currentTarget.style.background = "#0A2E1A")}
      >
        {verifying ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying with CAC…</> : <>Submit business verification <ChevronRight className="w-4 h-4" /></>}
      </button>
      {verifyError && <p className="text-[12px] text-center" style={{ color: "#dc2626" }}>{verifyError}</p>}
      <p className="text-center text-[11px]" style={{ color: "#94a3b8" }}>
        🔒 Verified directly against CAC & FIRS databases · NDPA compliant
      </p>
    </div>
  );
}

// ─── Step Bank Statement (single file) ────────────────────────────────────────

export function StepBankStatement({ onNext }: { onNext: () => void }) {
  const dropRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!dropRef.current) return;
    gsap.fromTo(
      dropRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
    );
  }, []);

  // Animate file row in
  useEffect(() => {
    if (!file) return;
    const el = document.getElementById("file-row");
    if (el)
      gsap.fromTo(
        el,
        { opacity: 0, x: -14 },
        { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" },
      );
  }, [file]);

  function removeFile() {
    const el = document.getElementById("file-row");
    if (el) {
      gsap.to(el, {
        opacity: 0,
        x: 14,
        height: 0,
        padding: 0,
        marginBottom: 0,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => setFile(null),
      });
    } else setFile(null);
  }

  async function handleSubmit() {
    if (!file) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    onNext();
  }

  const formatSize = (b: number) =>
    b < 1024 * 1024
      ? `${(b / 1024).toFixed(0)} KB`
      : `${(b / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-3 p-4 rounded-[10px]"
        style={{
          background: "#fffbeb",
          border: "1px solid rgba(245,158,11,0.2)",
        }}
      >
        <Info
          className="w-4 h-4 shrink-0 mt-0.5"
          style={{ color: "#f59e0b" }}
        />
        <div
          className="text-[12.5px] leading-relaxed"
          style={{ color: "#92400e" }}
        >
          <p className="font-bold mb-0.5">6-month bank statement required</p>
          <p>
            PDF preferred · Max 10MB · Must show business name, account number,
            and recent transactions
          </p>
        </div>
      </div>

      <div ref={dropRef}>
        {!file ? (
          <div
            className="rounded-[12px] border-2 border-dashed p-8 flex flex-col items-center gap-3 text-center cursor-pointer transition-all"
            style={{
              borderColor: dragging ? "#1A7A42" : "#d1fae5",
              background: dragging ? "#F0FAF3" : "transparent",
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) setFile(f);
            }}
            onClick={() => inputRef.current?.click()}
          >
            <div
              className="w-12 h-12 rounded-[12px] flex items-center justify-center"
              style={{ background: "#F0FAF3" }}
            >
              <Upload className="w-5 h-5" style={{ color: "#1A7A42" }} />
            </div>
            <div>
              <p className="text-[14px] font-bold" style={{ color: "#1C1C1C" }}>
                Drop your bank statement here
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
                or{" "}
                <span className="font-bold" style={{ color: "#1A7A42" }}>
                  click to browse
                </span>{" "}
                · PDF, JPG, PNG
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFile(f);
                e.target.value = "";
              }}
            />
          </div>
        ) : (
          <div
            id="file-row"
            className="flex items-center gap-3 px-4 py-3.5 rounded-[10px] border"
            style={{ borderColor: "#1A7A42", background: "#F0FAF3" }}
          >
            <div
              className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0"
              style={{ background: "#fff" }}
            >
              <FileText className="w-4 h-4" style={{ color: "#1A7A42" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[13px] font-semibold truncate"
                style={{ color: "#1C1C1C" }}
              >
                {file.name}
              </p>
              <p className="text-[11px]" style={{ color: "#3D6B4F" }}>
                {formatSize(file.size)} · Ready to upload
              </p>
            </div>
            <CheckCircle2
              className="w-4 h-4 shrink-0"
              style={{ color: "#1A7A42" }}
            />
            <button
              onClick={removeFile}
              className="p-1.5 rounded-[5px] hover:bg-red-50 transition-colors shrink-0 ml-1"
            >
              <X className="w-3.5 h-3.5" style={{ color: "#dc2626" }} />
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!file || submitting}
        className="w-full h-[48px] rounded-[12px] text-[14px] font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: "#0A2E1A",
          boxShadow: "0 4px 14px rgba(26,122,66,0.3)",
        }}
        onMouseOver={(e) =>
          file && !submitting && (e.currentTarget.style.background = "#239452")
        }
        onMouseOut={(e) => (e.currentTarget.style.background = "#0A2E1A")}
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
          </>
        ) : (
          <>
            Submit for review <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}

// ─── Step Success ─────────────────────────────────────────────────────────────

export function StepSuccess({
  tier,
  onDone,
}: {
  tier: 2 | 3;
  onDone: () => void;
}) {
  const shieldRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shieldRef.current || !contentRef.current) return;
    const tl = gsap.timeline();
    tl.fromTo(
      shieldRef.current,
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2)" },
    ).fromTo(
      contentRef.current.querySelectorAll("[data-line]"),
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.4, ease: "power2.out" },
      "-=0.2",
    );
  }, []);

  return (
    <div className="flex flex-col items-center text-center py-6">
      <div ref={shieldRef}>
        <AnimatedShield filled />
      </div>
      <div ref={contentRef} className="mt-6 space-y-3 w-full">
        <p
          data-line
          className="text-[22px] font-extrabold"
          style={{ color: "#1C1C1C", letterSpacing: "-0.4px" }}
        >
          Submitted for review
        </p>
        <p
          data-line
          className="text-[14px] leading-relaxed max-w-sm mx-auto"
          style={{ color: "#6b7280" }}
        >
          {tier === 2
            ? "Our team will verify your NIN within 1–2 business days and notify you by email."
            : "Your CAC registration and bank statement are under review. This takes 2–3 business days."}
        </p>
        <div data-line className="grid grid-cols-3 gap-3 mt-6">
          {["Documents submitted", "Team review", "Email notification"].map(
            (s, i) => (
              <div
                key={s}
                className="flex flex-col items-center gap-1.5 p-3 rounded-[12px]"
                style={{ background: "#F0FAF3" }}
              >
                <p
                  className="text-[13px] font-extrabold"
                  style={{ color: "#1A7A42" }}
                >
                  0{i + 1}
                </p>
                <p
                  className="text-[11px] font-medium"
                  style={{ color: "#3D6B4F" }}
                >
                  {s}
                </p>
              </div>
            ),
          )}
        </div>
        <div data-line className="pt-4 flex gap-3 justify-center">
          <button
            type="button"
            onClick={onDone}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] text-white text-[13px] font-bold hover:opacity-90 transition-all"
            style={{ background: "#0A2E1A" }}
          >
            Continue to dashboard <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
