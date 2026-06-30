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

export const ninSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nin: z
    .string()
    .length(11, "NIN must be exactly 11 digits")
    .regex(/^\d{11}$/, "NIN must contain only numbers"),
});

export const cacSchema = z.object({
  rcNumber: z.string().min(4, "Enter your RC number").max(20),
  businessName: z.string().min(2, "Business name is required"),
});

export type NINValues = z.infer<typeof ninSchema>;
export type CACValues = z.infer<typeof cacSchema>;

// ─── Tier config ──────────────────────────────────────────────────────────────

export function getTiers(completedTiers: KycTier[]): TierInfo[] {
  const completed = (t: KycTier) => completedTiers.includes(t);
  return [
    {
      tier: 1,
      name: "Free access",
      tagline: "Basic store + product listing",
      icon: Zap,
      color: "#6b7280",
      unlocks: [
        "Create your store",
        "List up to 10 products",
        "Accept manual orders",
      ],
      status: "completed", // always completed — no action needed
    },
    {
      tier: 2,
      name: "Identity verified",
      tagline: "NIN verification",
      icon: Shield,
      color: "#3b82f6",
      unlocks: [
        "Receive Paystack payouts",
        "Payouts up to ₦500,000/month",
        "GoMarket trust badge",
      ],
      status: completed(2) ? "completed" : completed(1) ? "active" : "locked",
    },
    {
      tier: 3,
      name: "Business verified",
      tagline: "CAC + bank statement",
      icon: Building2,
      color: "#1A7A42",
      unlocks: [
        "Unlimited payouts",
        "GoMarket Verified Business badge",
        "Priority support",
        "Storefront featured placement",
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

export function StepNIN({ onNext }: { onNext: () => void }) {
  const formRef = useRef<HTMLDivElement>(null);
  const [verifying, setVerifying] = useState(false);
  const [ninVisible, setNinVisible] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NINValues>({ resolver: zodResolver(ninSchema) });

  useEffect(() => {
    if (!formRef.current) return;
    gsap.fromTo(
      formRef.current.querySelectorAll("[data-field]"),
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.07,
        duration: 0.45,
        ease: "power2.out",
        delay: 0.1,
      },
    );
  }, []);

  async function onSubmit() {
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 1800));
    setVerifying(false);
    onNext();
  }

  return (
    <div ref={formRef} className="space-y-5">
      <div
        data-field
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
        <p
          className="text-[12.5px] leading-relaxed"
          style={{ color: "#92400e" }}
        >
          Your NIN is an 11-digit number on your National ID Card, NIN slip, or
          NIMC app. Used solely to confirm your identity — never shared with
          third parties.
        </p>
      </div>
      <div data-field className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KYCInput label="First name" required error={errors.firstName?.message}>
          <input
            className={inputClass}
            style={inputStyle}
            placeholder="As on your ID"
            {...register("firstName")}
          />
        </KYCInput>
        <KYCInput label="Last name" required error={errors.lastName?.message}>
          <input
            className={inputClass}
            style={inputStyle}
            placeholder="As on your ID"
            {...register("lastName")}
          />
        </KYCInput>
      </div>
      <div data-field>
        <KYCInput
          label="Date of birth"
          required
          error={errors.dateOfBirth?.message}
        >
          <input
            className={inputClass}
            style={inputStyle}
            type="date"
            {...register("dateOfBirth")}
          />
        </KYCInput>
      </div>
      <div data-field>
        <KYCInput
          label="NIN (National Identification Number)"
          required
          hint="11-digit number on your NIMC card or slip"
          error={errors.nin?.message}
        >
          <div className="relative">
            <input
              className={`${inputClass} pr-10`}
              style={{
                ...inputStyle,
                letterSpacing: ninVisible ? "normal" : "0.2em",
                fontFamily: "monospace",
              }}
              type={ninVisible ? "text" : "password"}
              placeholder="00000000000"
              maxLength={11}
              {...register("nin")}
            />
            <button
              type="button"
              onClick={() => setNinVisible((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[#F0FAF3] transition-colors"
            >
              {ninVisible ? (
                <EyeOff className="w-4 h-4" style={{ color: "#94a3b8" }} />
              ) : (
                <Eye className="w-4 h-4" style={{ color: "#94a3b8" }} />
              )}
            </button>
          </div>
        </KYCInput>
      </div>
      <div data-field>
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={verifying}
          className="w-full h-[48px] rounded-[12px] text-[14px] font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
          style={{
            background: "#0A2E1A",
            boxShadow: "0 4px 14px rgba(26,122,66,0.3)",
          }}
          onMouseOver={(e) =>
            !verifying && (e.currentTarget.style.background = "#239452")
          }
          onMouseOut={(e) => (e.currentTarget.style.background = "#0A2E1A")}
        >
          {verifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Verifying with NIMC…
            </>
          ) : (
            <>
              Verify NIN <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
      <p
        data-field
        className="text-center text-[11px]"
        style={{ color: "#94a3b8" }}
      >
        🔒 Encrypted and securely processed via NIMC API. Your NIN is never
        stored on our servers.
      </p>
    </div>
  );
}

// ─── Step CAC ─────────────────────────────────────────────────────────────────

export function StepCAC({ onNext }: { onNext: () => void }) {
  const formRef = useRef<HTMLDivElement>(null);
  const [verifying, setVerifying] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CACValues>({ resolver: zodResolver(cacSchema) });

  useEffect(() => {
    if (!formRef.current) return;
    gsap.fromTo(
      formRef.current.querySelectorAll("[data-field]"),
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.07,
        duration: 0.45,
        ease: "power2.out",
        delay: 0.1,
      },
    );
  }, []);

  async function onSubmit() {
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 1600));
    setVerifying(false);
    onNext();
  }

  return (
    <div ref={formRef} className="space-y-5">
      <div
        data-field
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
        <p
          className="text-[12.5px] leading-relaxed"
          style={{ color: "#92400e" }}
        >
          Your CAC RC number is on your Certificate of Incorporation. We verify
          against the Corporate Affairs Commission (CAC) database.
        </p>
      </div>
      <div data-field>
        <KYCInput
          label="Business name"
          required
          error={errors.businessName?.message}
          hint="Exactly as registered with CAC"
        >
          <input
            className={inputClass}
            style={inputStyle}
            placeholder="Eko Fashion House Limited"
            {...register("businessName")}
          />
        </KYCInput>
      </div>
      <div data-field>
        <KYCInput
          label="RC Number"
          required
          error={errors.rcNumber?.message}
          hint="e.g. RC1234567 — found on your Certificate of Incorporation"
        >
          <input
            className={inputClass}
            style={inputStyle}
            placeholder="RC1234567"
            {...register("rcNumber")}
          />
        </KYCInput>
      </div>
      <div data-field>
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={verifying}
          className="w-full h-[48px] rounded-[12px] text-[14px] font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
          style={{
            background: "#0A2E1A",
            boxShadow: "0 4px 14px rgba(26,122,66,0.3)",
          }}
          onMouseOver={(e) =>
            !verifying && (e.currentTarget.style.background = "#239452")
          }
          onMouseOut={(e) => (e.currentTarget.style.background = "#0A2E1A")}
        >
          {verifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Verifying with CAC…
            </>
          ) : (
            <>
              Verify business <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
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
        <div data-line className="pt-4">
          <Link
            href={ROUTES.MERCHANT.SETTINGS}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] text-white text-[13px] font-bold hover:opacity-90 transition-all"
            style={{ background: "#0A2E1A" }}
          >
            Back to settings <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
