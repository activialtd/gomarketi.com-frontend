"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Store,
  ShieldCheck,
} from "lucide-react";
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gomarket/ui";
import { ROUTES } from "@/lib/config/routes";
import {
  storeSetupSchema,
  type StoreSetupFormValues,
} from "@/lib/validations/schemas";
import { toSlug } from "@gomarket/shared-utils";
import {
  Field,
  STORE_CATEGORIES,
  CURRENCIES,
  CurrencyCard,
  FieldLabel,
  TEAM_SIZES,
  FieldError,
  STAFF_RANGES,
} from "./helpers";

// ─── constants ────────────────────────────────────────────────
const BRAND = "#1A7A42";
const BRAND_LIGHT = "rgba(26,122,66,0.07)";
const BORDER = "#e2e8f0";

// ─── types ────────────────────────────────────────────────────
type Step = 0 | 1 | 2 | 3; // 0=welcome, 1=identity, 2=preferences, 3=kyc

// NOTE: add `phone: z.string().optional()` to your storeSetupSchema
type ExtendedFormValues = StoreSetupFormValues & { phone?: string };

// ─── progress indicator ───────────────────────────────────────
const STEP_LABELS = ["Your store", "Preferences", "Verify"];

function ProgressBar({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-0 mb-7">
      {STEP_LABELS.map((label, i) => {
        const idx = (i + 1) as 1 | 2 | 3;
        const done = idx < current;
        const active = idx === current;
        const last = i === STEP_LABELS.length - 1;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            {/* node */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-200"
                style={{
                  background: done || active ? BRAND : BORDER,
                  color: done || active ? "#fff" : "#94a3b8",
                }}
              >
                {done ? <Check className="w-3 h-3" /> : idx}
              </div>
              <span
                className="text-[12px] font-semibold hidden sm:block"
                style={{
                  color: active ? BRAND : done ? "#6b7280" : "#94a3b8",
                }}
              >
                {label}
              </span>
            </div>
            {/* connector */}
            {!last && (
              <div
                className="flex-1 h-px mx-2 transition-all duration-300"
                style={{ background: done ? BRAND : BORDER }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────
export function StoreSetupForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ExtendedFormValues>({
    resolver: zodResolver(storeSetupSchema) as any,
    defaultValues: {
      currency: "NGN",
      teamSize: "",
      staffRange: "",
      category: "",
      phone: "",
    },
  });

  const businessNameVal = watch("businessName") ?? "";
  const slugVal = watch("slug") ?? "";
  const teamSizeVal = watch("teamSize");
  const staffRangeVal = watch("staffRange");
  const currencyVal = watch("currency");

  const slugRegister = register("slug", {
    onChange: () => setSlugEdited(true),
  });

  // auto-generate slug from business name
  useEffect(() => {
    if (!slugEdited && businessNameVal) {
      setValue("slug", toSlug(businessNameVal), { shouldValidate: true });
    }
  }, [businessNameVal, slugEdited, setValue]);

  // personalization helpers
  const storeName = businessNameVal.trim() || null;
  const firstName = storeName ? storeName.split(" ")[0] : null;

  // validate step 1 fields before advancing
  async function handleStep1Next() {
    const valid = await trigger(["businessName", "category", "slug"]);
    if (valid) setStep(2);
  }

  // step 2 submit → save → advance to KYC
  async function onSubmit(_data: ExtendedFormValues) {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    setStep(3);
  }

  function handleVerifyKyc() {
    setKycLoading(true);
    // TODO: replace with ROUTES.MERCHANT.KYC when available
    router.push(ROUTES.MERCHANT.OVERVIEW);
  }

  function handleSkipKyc() {
    router.push(ROUTES.MERCHANT.OVERVIEW);
  }

  // ─── STEP 0: Welcome ────────────────────────────────────────
  if (step === 0) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center px-5">
        <div className="max-w-sm w-full text-center space-y-7 py-14">
          {/* icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{
              background: BRAND_LIGHT,
              border: `1.5px solid rgba(26,122,66,0.15)`,
            }}
          >
            <Store className="w-8 h-8" style={{ color: BRAND }} />
          </div>

          {/* copy */}
          <div className="space-y-3">
            <h1
              className="text-[26px] font-extrabold leading-tight"
              style={{ color: "#1C1C1C", letterSpacing: "-0.5px" }}
            >
              Welcome to GoMarket
            </h1>
            <p
              className="text-[14px] leading-relaxed"
              style={{ color: "#6b7280" }}
            >
              I'll walk you through setting up your store.
              <br />
              It takes just a few seconds — you can update everything later.
            </p>
          </div>

          {/* dots */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: i === 0 ? 20 : 6,
                  height: 6,
                  background: i === 0 ? BRAND : BORDER,
                  transition: "all 0.2s",
                }}
              />
            ))}
          </div>

          {/* cta */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full flex items-center justify-center gap-2 h-[46px] rounded-[12px] text-white text-[14px] font-bold transition-all active:scale-[0.98]"
            style={{
              background: BRAND,
              boxShadow: "0 4px 18px rgba(26,122,66,0.28)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#239452")}
            onMouseOut={(e) => (e.currentTarget.style.background = BRAND)}
          >
            Let's go
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px]" style={{ color: "#b0b8c1" }}>
            No credit card required · Free to start
          </p>
        </div>
      </div>
    );
  }

  // ─── STEP 3: KYC ────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center px-5">
        <div className="max-w-sm w-full text-center space-y-6 py-14">
          {/* icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{
              background: "#f0fdf4",
              border: "2px solid #86efac",
            }}
          >
            <ShieldCheck className="w-8 h-8" style={{ color: BRAND }} />
          </div>

          {/* copy */}
          <div className="space-y-2">
            <h2
              className="text-[24px] font-extrabold"
              style={{ color: "#1C1C1C", letterSpacing: "-0.4px" }}
            >
              {storeName
                ? `${storeName} is live! 🎉`
                : "Your store is live! 🎉"}
            </h2>
            <p
              className="text-[13px] leading-relaxed"
              style={{ color: "#6b7280" }}
            >
              One last thing — verify your identity to unlock higher transaction
              limits and build trust with customers. It only takes 2 minutes.
            </p>
          </div>

          {/* benefits */}
          <div
            className="rounded-[14px] p-4 text-left space-y-2.5"
            style={{
              background: BRAND_LIGHT,
              border: "1px solid rgba(26,122,66,0.14)",
            }}
          >
            {[
              "Higher daily transaction limits",
              "GoMarket Verified badge on your store",
              "Faster payout processing",
            ].map((b) => (
              <div key={b} className="flex items-center gap-2.5">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: BRAND }}
                >
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
                <span
                  className="text-[13px] font-medium"
                  style={{ color: "#1C1C1C" }}
                >
                  {b}
                </span>
              </div>
            ))}
          </div>

          {/* actions */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleVerifyKyc}
              disabled={kycLoading}
              className="w-full flex items-center justify-center gap-2 h-[46px] rounded-[12px] text-white text-[13px] font-bold transition-all active:scale-[0.98] disabled:opacity-60"
              style={{
                background: BRAND,
                boxShadow: "0 4px 14px rgba(26,122,66,0.25)",
              }}
              onMouseOver={(e) =>
                !kycLoading && (e.currentTarget.style.background = "#239452")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = BRAND)}
            >
              {kycLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Verify now
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSkipKyc}
              className="w-full flex items-center justify-center h-[44px] rounded-[12px] text-[13px] font-semibold transition-all"
              style={{
                color: "#6b7280",
                background: "#f8fafc",
                border: `1px solid ${BORDER}`,
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#f1f5f9")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#f8fafc")}
            >
              Skip — I'll do it later
            </button>
          </div>

          <p className="text-[11px]" style={{ color: "#94a3b8" }}>
            You can always complete verification from your dashboard settings.
          </p>
        </div>
      </div>
    );
  }

  // ─── STEPS 1 & 2: Form ──────────────────────────────────────
  return (
    <div className="w-full px-5">
      {/* header */}
      <div
        className="px-6 lg:px-10 py-5 border-b"
        style={{ borderColor: BORDER, background: "#fff" }}
      >
        <ProgressBar current={step as 1 | 2 | 3} />

        <div>
          <h1
            className="text-[20px] font-extrabold leading-tight"
            style={{ letterSpacing: "-0.4px", color: "#1C1C1C" }}
          >
            {step === 1
              ? "Tell us about your business"
              : firstName
                ? `Almost there, ${firstName}!`
                : "Almost there!"}
          </h1>
          <p
            className="text-[13px] mt-0.5 leading-relaxed"
            style={{ color: "#3D6B4F" }}
          >
            {step === 1
              ? "This is what your customers will see on your storefront."
              : "Your currency and team — then you're all set."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="py-8">
        {/* ── STEP 1: Identity ──────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              {/* Business name */}
              <Field label="Business name" error={errors.businessName?.message}>
                <Input
                  id="businessName"
                  placeholder="e.g. Eko Fashion House"
                  autoComplete="organization"
                  autoFocus
                  {...register("businessName")}
                />
              </Field>

              {/* Phone */}
              <Field label="Business phone">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g. 08012345678"
                  autoComplete="tel"
                  {...register("phone")}
                />
              </Field>

              {/* Category */}
              <Field label="Store category" error={errors.category?.message}>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <SelectTrigger
                        className="h-[42px] px-3.5 text-[13px] rounded-[10px] border w-full"
                        style={{
                          background: "#F0FAF3",
                          borderColor: errors.category ? "#ef4444" : BORDER,
                          color: field.value ? "#1C1C1C" : "#3D6B4F",
                        }}
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {STORE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              {/* Store URL */}
              <div className="sm:col-span-2">
                <Field
                  label="Store URL"
                  hint={
                    !errors.slug && slugVal.length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <Check
                          className="w-3 h-3 shrink-0"
                          style={{ color: BRAND }}
                        />
                        <span
                          className="text-[11px] font-medium"
                          style={{ color: BRAND }}
                        >
                          {slugVal}.gomarketi.com
                        </span>
                      </div>
                    ) : errors.slug ? (
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="text-[11px] text-red-500">
                          {errors.slug.message}
                        </span>
                      </div>
                    ) : null
                  }
                >
                  <div
                    className="flex items-center h-[42px] rounded-[10px] border overflow-hidden"
                    style={{ borderColor: BORDER }}
                    onFocusCapture={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        BRAND;
                      (e.currentTarget as HTMLElement).style.outline =
                        `2px solid ${BRAND}`;
                      (e.currentTarget as HTMLElement).style.outlineOffset =
                        "-2px";
                    }}
                    onBlurCapture={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        BORDER;
                      (e.currentTarget as HTMLElement).style.outline = "none";
                    }}
                  >
                    <input
                      id="slug"
                      type="text"
                      spellCheck={false}
                      autoCapitalize="none"
                      placeholder="your-store"
                      className="flex-1 h-full px-3.5 text-[13px] outline-none font-mono bg-[#F0FAF3] focus:bg-white transition-colors"
                      style={{ color: "#1C1C1C", minWidth: 0 }}
                      name={slugRegister.name}
                      ref={slugRegister.ref}
                      onChange={slugRegister.onChange}
                      onBlur={slugRegister.onBlur}
                    />
                    <div
                      className="h-full flex items-center px-4 border-l text-[12px] font-semibold shrink-0 select-none"
                      style={{
                        background: "#f8fafc",
                        borderColor: BORDER,
                        color: "#6b7280",
                      }}
                    >
                      .gomarketi.com
                    </div>
                  </div>
                </Field>
              </div>
            </div>

            {/* nav */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleStep1Next}
                className="flex items-center gap-2 px-8 h-[42px] rounded-[10px] text-white text-[13px] font-bold transition-all active:scale-[0.98]"
                style={{
                  background: BRAND,
                  boxShadow: "0 4px 14px rgba(26,122,66,0.25)",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#239452")
                }
                onMouseOut={(e) => (e.currentTarget.style.background = BRAND)}
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Preferences ───────────────────── */}
        {step === 2 && (
          <div className="space-y-8">
            {/* Currency */}
            <div className="space-y-3">
              <FieldLabel>Store currency</FieldLabel>
              <p className="text-[12px] -mt-1" style={{ color: "#6b7280" }}>
                The primary currency your store accepts payments in.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg">
                {CURRENCIES.map((c) => (
                  <CurrencyCard
                    key={c.code}
                    currency={c}
                    selected={currencyVal === c.code}
                    onSelect={() => {
                      if (c.active) setValue("currency", c.code as "NGN");
                    }}
                  />
                ))}
              </div>
              <p className="text-[11px]" style={{ color: "#6b7280" }}>
                Other currencies will be enabled in future regions.
              </p>
            </div>

            {/* Team size */}
            <div className="space-y-2">
              <FieldLabel>Team size</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {TEAM_SIZES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() =>
                      setValue("teamSize", t.value, { shouldValidate: true })
                    }
                    className="flex flex-col items-center px-5 py-2.5 rounded-[10px] border transition-all"
                    style={{
                      borderColor: teamSizeVal === t.value ? BRAND : BORDER,
                      background:
                        teamSizeVal === t.value ? BRAND_LIGHT : "#F0FAF3",
                      color: teamSizeVal === t.value ? BRAND : "#1C1C1C",
                    }}
                  >
                    <span className="font-bold text-[13px]">{t.label}</span>
                    <span
                      className="text-[10px] font-normal mt-0.5"
                      style={{
                        color: teamSizeVal === t.value ? BRAND : "#6b7280",
                      }}
                    >
                      {t.sub}
                    </span>
                  </button>
                ))}
              </div>
              {errors.teamSize && (
                <FieldError>{errors.teamSize.message}</FieldError>
              )}
            </div>

            {/* Staff range */}
            <div className="space-y-2">
              <FieldLabel>Number of staff</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {STAFF_RANGES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() =>
                      setValue("staffRange", r.value, { shouldValidate: true })
                    }
                    className="px-5 py-2.5 rounded-[10px] border text-[13px] font-semibold transition-all"
                    style={{
                      borderColor: staffRangeVal === r.value ? BRAND : BORDER,
                      background:
                        staffRangeVal === r.value ? BRAND_LIGHT : "#F0FAF3",
                      color: staffRangeVal === r.value ? BRAND : "#1C1C1C",
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              {errors.staffRange && (
                <FieldError>{errors.staffRange.message}</FieldError>
              )}
              <p className="text-[11px]" style={{ color: "#6b7280" }}>
                Including full-time, part-time, and contractors.
              </p>
            </div>

            {/* nav */}
            <div
              className="pt-4 border-t flex items-center justify-between"
              style={{ borderColor: BORDER }}
            >
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 h-[42px] px-5 rounded-[10px] border text-[13px] font-semibold transition-all"
                style={{
                  borderColor: BORDER,
                  color: "#6b7280",
                  background: "#fff",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#f8fafc")
                }
                onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-8 h-[42px] rounded-[10px] text-white text-[13px] font-bold transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: BRAND,
                  boxShadow: "0 4px 14px rgba(26,122,66,0.25)",
                }}
                onMouseOver={(e) =>
                  !isLoading && (e.currentTarget.style.background = "#239452")
                }
                onMouseOut={(e) => (e.currentTarget.style.background = BRAND)}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Set up store
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
