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
  X,
} from "lucide-react";
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gomarket/ui";
import { storefrontApi, authApi, ApiError } from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";
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
  BORDER,
  BRAND,
  BRAND_LIGHT,
} from "./helpers";
import AddressSearch from "@/components/merchant/onboarding/AddressSearch";

// ─── Lightweight progress bar (no framer-motion) ──────────────────────────────

const STEP_LABELS = ["Your store", "Preferences", "Verify"];

function ProgressBar({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center mb-7">
      {STEP_LABELS.map((label, i) => {
        const idx = (i + 1) as 1 | 2 | 3;
        const done = idx < current;
        const active = idx === current;
        const last = i === STEP_LABELS.length - 1;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                style={{
                  background: done || active ? BRAND : BORDER,
                  color: done || active ? "#fff" : "#94a3b8",
                  transform: active ? "scale(1.1)" : "scale(1)",
                  transition: "background 0.2s, transform 0.2s",
                }}
              >
                {done ? <Check className="w-3 h-3" /> : idx}
              </div>
              <span
                className="text-[12px] font-semibold hidden sm:block"
                style={{
                  color: active ? BRAND : done ? "#6b7280" : "#94a3b8",
                  transition: "color 0.2s",
                }}
              >
                {label}
              </span>
            </div>
            {!last && (
              <div
                className="flex-1 h-px mx-2"
                style={{
                  background: done ? BRAND : BORDER,
                  transition: "background 0.3s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

type Step = 0 | 1 | 2 | 3;

export function StoreSetupForm() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAuth = useAuthStore((s) => s.setAuth);
  const signupPhone = useAuthStore((s) => s.signupPhone);

  const [step, setStep] = useState<Step>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    trigger,
    formState: { errors },
  } = useForm<StoreSetupFormValues>({
    resolver: zodResolver(storeSetupSchema),
    defaultValues: {
      currency: "NGN",
      category: "",
      businessPhone: signupPhone ?? "",
    },
  });

  const businessNameVal = watch("businessName") ?? "";
  const slugVal = watch("slug") ?? "";
  const currencyVal = watch("currency");
  const teamSizeVal = watch("teamSize");

  const slugRegister = register("slug", {
    onChange: () => setSlugEdited(true),
  });

  useEffect(() => {
    if (!slugEdited && businessNameVal) {
      setValue("slug", toSlug(businessNameVal), { shouldValidate: true });
    }
  }, [businessNameVal, slugEdited, setValue]);

  // Debounced slug availability check
  useEffect(() => {
    if (!slugVal || slugVal.length < 2) {
      setSlugStatus("idle");
      setSuggestions([]);
      return;
    }
    setSlugStatus("checking");
    const timer = setTimeout(async () => {
      if (!accessToken) return;
      try {
        const { available } = await storefrontApi.checkSlug(slugVal, accessToken);
        if (available) {
          setSlugStatus("available");
          setSuggestions([]);
        } else {
          setSlugStatus("taken");
          const candidates = [
            `${slugVal}-store`,
            `${slugVal}-ng`,
            `the-${slugVal}`,
            `${slugVal}hq`,
            `${slugVal}-official`,
            `${slugVal}-shop`,
          ];
          const results = await Promise.all(
            candidates.map((s) =>
              storefrontApi.checkSlug(s, accessToken)
                .then((r) => (r.available ? s : null))
                .catch(() => null)
            )
          );
          setSuggestions(results.filter(Boolean).slice(0, 4) as string[]);
        }
      } catch {
        setSlugStatus("idle");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [slugVal, accessToken]);

  function applySuggestion(s: string) {
    setValue("slug", s, { shouldValidate: true });
    setSlugEdited(true);
    setSlugStatus("available");
    setSuggestions([]);
  }

  const storeName = businessNameVal.trim() || null;
  const firstName = storeName ? storeName.split(" ")[0] : null;

  function goTo(next: Step) {
    setStep(next);
  }

  async function handleStep1Next() {
    if (slugStatus === "checking" || slugStatus === "taken") return;
    const valid = await trigger(["businessName", "category", "slug"]);
    if (valid) goTo(2);
  }

  async function onSubmit(data: StoreSetupFormValues) {
    if (!accessToken) return;
    setIsLoading(true);
    setSubmitError(null);
    try {
      const store = await storefrontApi.createStore(
        {
          name: data.businessName,
          slug: data.slug,
          category: data.category,
          currency: data.currency,
          team_size: data.teamSize || undefined,
          support_phone: data.businessPhone || undefined,
        },
        accessToken,
      );
      // Save address if provided
      if (data.address && store?.id) {
        await storefrontApi.updateStore(store.id, {
          address: data.address,
          city: data.city,
          state: data.state,
        }, accessToken).catch(() => {/* non-fatal */});
      }
      try {
        const fresh = await authApi.refreshTokens();
        setAuth(fresh.user, fresh.access_token);
      } catch { /* not fatal */ }
      goTo(3);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          goTo(3);
        } else if (err.status === 422 && err.fields) {
          err.fields.forEach((f) => {
            if (f.field === "slug") setError("slug", { message: f.message });
          });
        } else {
          setSubmitError(err.message || "Failed to create store. Please try again.");
        }
      } else {
        setSubmitError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  // ─── Step 0: Intro ──────────────────────────────────────────

  if (step === 0) {
    return (
      <div className="w-full min-h-[calc(100vh-56px)] flex items-center justify-center px-5 animate-in fade-in duration-300">
        <div className="max-w-sm w-full text-center py-14">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-7"
            style={{ background: BRAND_LIGHT, border: "1.5px solid rgba(26,122,66,0.15)" }}
          >
            <Store className="w-8 h-8" style={{ color: BRAND }} />
          </div>

          <div className="space-y-3 mb-7">
            <h1
              className="text-[26px] font-extrabold leading-tight"
              style={{ color: "#1C1C1C", letterSpacing: "-0.5px" }}
            >
              Set up your store
            </h1>
            <p className="text-[14px] leading-relaxed" style={{ color: "#6b7280" }}>
              Just a few details and your store is live.
              <br />
              Takes under 2 minutes — you can update everything later.
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-7">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-full"
                style={{ width: i === 0 ? 20 : 6, height: 6, background: i === 0 ? BRAND : BORDER }}
              />
            ))}
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => goTo(1)}
              className="w-full flex items-center justify-center gap-2 h-[46px] rounded-[12px] text-white text-[14px] font-bold transition-colors active:scale-[0.98]"
              style={{ background: BRAND, boxShadow: "0 4px 18px rgba(26,122,66,0.28)" }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#239452")}
              onMouseOut={(e) => (e.currentTarget.style.background = BRAND)}
            >
              Let's go <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px]" style={{ color: "#b0b8c1" }}>
              No credit card required · Free to start
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step 3: KYC ────────────────────────────────────────────

  if (step === 3) {
    return (
      <div className="w-full min-h-[calc(100vh-56px)] flex items-center justify-center px-5 animate-in fade-in zoom-in-95 duration-300">
        <div className="max-w-sm w-full text-center py-14">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "#f0fdf4", border: "2px solid #86efac" }}
          >
            <ShieldCheck className="w-8 h-8" style={{ color: BRAND }} />
          </div>

          <div className="space-y-2 mb-6">
            <h2
              className="text-[24px] font-extrabold"
              style={{ color: "#1C1C1C", letterSpacing: "-0.4px" }}
            >
              {storeName ? `${storeName} is live! 🎉` : "Your store is live! 🎉"}
            </h2>
            <p className="text-[13px] leading-relaxed" style={{ color: "#6b7280" }}>
              Verify your identity to unlock higher transaction limits and build
              trust with customers. Only takes 2 minutes.
            </p>
          </div>

          <div
            className="rounded-[14px] p-4 text-left space-y-2.5 mb-6"
            style={{ background: BRAND_LIGHT, border: "1px solid rgba(26,122,66,0.14)" }}
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
                <span className="text-[13px] font-medium" style={{ color: "#1C1C1C" }}>
                  {b}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => { setKycLoading(true); router.push(ROUTES.ONBOARDING.KYC); }}
              disabled={kycLoading}
              className="w-full flex items-center justify-center gap-2 h-[46px] rounded-[12px] text-white text-[13px] font-bold transition-colors active:scale-[0.98] disabled:opacity-60"
              style={{ background: BRAND, boxShadow: "0 4px 14px rgba(26,122,66,0.25)" }}
              onMouseOver={(e) => !kycLoading && (e.currentTarget.style.background = "#239452")}
              onMouseOut={(e) => (e.currentTarget.style.background = BRAND)}
            >
              {kycLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify now <ArrowRight className="w-4 h-4" /></>}
            </button>
            <button
              type="button"
              onClick={() => {
                // Clear tour flag so new users see the dashboard tour on first visit
                if (typeof window !== "undefined") localStorage.removeItem("gm_dash_tour_v2");
                router.push(ROUTES.MERCHANT.OVERVIEW);
              }}
              className="w-full flex items-center justify-center h-[44px] rounded-[12px] text-[13px] font-semibold transition-colors"
              style={{ color: "#6b7280", background: "#f8fafc", border: `1px solid ${BORDER}` }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#f1f5f9")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#f8fafc")}
            >
              Skip — I'll do it later
            </button>
          </div>
          <p className="text-[11px] mt-4" style={{ color: "#94a3b8" }}>
            You can always complete verification from your dashboard settings.
          </p>
        </div>
      </div>
    );
  }

  // ─── Steps 1 & 2: Form ──────────────────────────────────────

  return (
    <div className="w-full max-w-2xl mx-auto px-5">
      <div
        className="px-6 py-5 border-b bg-white sticky top-0 z-10"
        style={{ borderColor: BORDER }}
      >
        <ProgressBar current={step as 1 | 2 | 3} />
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
        <p className="text-[13px] mt-0.5 leading-relaxed" style={{ color: "#3D6B4F" }}>
          {step === 1
            ? "This is what your customers will see on your storefront."
            : "Your team size and store currency — then you're all set."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="py-8">

        {/* ── Step 1 ───────────────────────────────────────── */}
        {step === 1 && (
          <div key="step1" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Business name" error={errors.businessName?.message}>
                <Input
                  id="businessName"
                  placeholder="e.g. Eko Fashion House"
                  autoComplete="organization"
                  autoFocus
                  {...register("businessName")}
                />
              </Field>

              <Field
                label="WhatsApp business number"
                hint={
                  <p className="text-[11px]" style={{ color: "#6b7280" }}>
                    Customers contact you here via WhatsApp. Editable anytime.
                  </p>
                }
              >
                <Input
                  id="businessPhone"
                  type="tel"
                  placeholder="e.g. +2348012345678"
                  autoComplete="tel"
                  {...register("businessPhone")}
                />
              </Field>

              <Field label="Store category" error={errors.category?.message}>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
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

              <div className="sm:col-span-2">
                <Field label="Store URL">
                  <div
                    className="flex items-center h-[42px] rounded-[10px] border overflow-hidden"
                    style={{
                      borderColor: slugStatus === "taken" ? "#ef4444" : slugStatus === "available" ? BRAND : BORDER,
                      transition: "border-color 0.15s",
                    }}
                    onFocusCapture={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = BRAND;
                      (e.currentTarget as HTMLElement).style.outline = `2px solid ${BRAND}`;
                      (e.currentTarget as HTMLElement).style.outlineOffset = "-2px";
                    }}
                    onBlurCapture={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        slugStatus === "taken" ? "#ef4444" : slugStatus === "available" ? BRAND : BORDER;
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
                    {/* Status icon inside the field */}
                    {slugStatus === "checking" && (
                      <div className="px-3 flex items-center">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "#94a3b8" }} />
                      </div>
                    )}
                    {slugStatus === "available" && (
                      <div className="px-3 flex items-center">
                        <Check className="w-3.5 h-3.5" style={{ color: BRAND }} />
                      </div>
                    )}
                    {slugStatus === "taken" && (
                      <div className="px-3 flex items-center">
                        <X className="w-3.5 h-3.5 text-red-500" />
                      </div>
                    )}
                    <div
                      className="h-full flex items-center px-4 border-l text-[12px] font-semibold shrink-0 select-none"
                      style={{ background: "#f8fafc", borderColor: BORDER, color: "#6b7280" }}
                    >
                      .gomarketi.com
                    </div>
                  </div>

                  {/* Status message */}
                  {slugStatus === "available" && slugVal && (
                    <p className="mt-1.5 text-[11px] font-medium flex items-center gap-1" style={{ color: BRAND }}>
                      <Check className="w-3 h-3" /> {slugVal}.gomarketi.com is available
                    </p>
                  )}
                  {slugStatus === "taken" && (
                    <div className="mt-1.5 space-y-2">
                      <p className="text-[11px] font-medium flex items-center gap-1 text-red-500">
                        <X className="w-3 h-3" /> That name is taken.
                        {suggestions.length > 0 ? " Try one of these:" : " Try a different name."}
                      </p>
                      {suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {suggestions.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => applySuggestion(s)}
                              className="px-2.5 py-1 rounded-[6px] text-[11px] font-semibold border transition-colors"
                              style={{
                                borderColor: BRAND,
                                color: BRAND,
                                background: BRAND_LIGHT,
                              }}
                              onMouseOver={(e) => { e.currentTarget.style.background = BRAND; e.currentTarget.style.color = "#fff"; }}
                              onMouseOut={(e) => { e.currentTarget.style.background = BRAND_LIGHT; e.currentTarget.style.color = BRAND; }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {errors.slug && slugStatus === "idle" && (
                    <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.slug.message}
                    </p>
                  )}
                </Field>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleStep1Next}
                disabled={slugStatus === "checking" || slugStatus === "taken"}
                className="flex items-center gap-2 px-8 h-[42px] rounded-[10px] text-white text-[13px] font-bold transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: BRAND, boxShadow: "0 4px 14px rgba(26,122,66,0.25)" }}
                onMouseOver={(e) => { if (slugStatus !== "checking" && slugStatus !== "taken") e.currentTarget.style.background = "#239452"; }}
                onMouseOut={(e) => (e.currentTarget.style.background = BRAND)}
              >
                {slugStatus === "checking" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Checking…</>
                ) : (
                  <>Next <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2 ───────────────────────────────────────── */}
        {step === 2 && (
          <div key="step2" className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="space-y-6">
              {/* Business address */}
              <div className="space-y-2">
                <FieldLabel>Business address</FieldLabel>
                <AddressSearch
                  defaultValue={watch("address") ?? ""}
                  onSelect={(r) => {
                    setValue("address", r.fullAddress, { shouldValidate: true });
                    setValue("city", r.city, { shouldValidate: true });
                    setValue("state", r.state, { shouldValidate: true });
                    if (r.lat) setValue("latitude", r.lat);
                    if (r.lng) setValue("longitude", r.lng);
                  }}
                />
                {watch("address") ? (
                  <p className="text-[12px] flex items-center gap-1.5" style={{color:"#1A7A42"}}>
                    <span>📍</span> {watch("city")}, {watch("state")}
                  </p>
                ) : errors.address ? (
                  <p className="text-[11px]" style={{color:"#dc2626"}}>{errors.address.message}</p>
                ) : (
                  <p className="text-[11px]" style={{color:"#94a3b8"}}>Search and select your business address above</p>
                )}
              </div>

              {/* Team size */}
              <div className="space-y-2">
                <FieldLabel>Team size</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {TEAM_SIZES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setValue("teamSize", t.value, { shouldValidate: true })}
                      className="flex flex-col items-center px-5 py-2.5 rounded-[10px] border transition-colors"
                      style={{
                        borderColor: teamSizeVal === t.value ? BRAND : BORDER,
                        background: teamSizeVal === t.value ? BRAND_LIGHT : "#F0FAF3",
                        color: teamSizeVal === t.value ? BRAND : "#1C1C1C",
                      }}
                    >
                      <span className="font-bold text-[13px]">{t.label}</span>
                      <span
                        className="text-[10px] font-normal mt-0.5"
                        style={{ color: teamSizeVal === t.value ? BRAND : "#6b7280" }}
                      >
                        {t.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency */}
              <div>
                <FieldLabel>Store currency</FieldLabel>
                <p className="text-[12px] mt-1 mb-3" style={{ color: "#6b7280" }}>
                  The primary currency your store accepts payments in.
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-[200px]">
                  {CURRENCIES.map((c) => (
                    <CurrencyCard
                      key={c.code}
                      currency={c}
                      selected={currencyVal === c.code}
                      onSelect={() => {
                        if (c.active) setValue("currency", c.code as "NGN" | "USD");
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Nav */}
            <div
              className="pt-4 border-t flex items-center justify-between"
              style={{ borderColor: BORDER }}
            >
              <button
                type="button"
                onClick={() => goTo(1)}
                className="flex items-center gap-1.5 h-[42px] px-5 rounded-[10px] border text-[13px] font-semibold transition-colors"
                style={{ borderColor: BORDER, color: "#6b7280", background: "#fff" }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              {submitError && (
                <p className="text-red-500 text-[13px] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-8 h-[42px] rounded-[10px] text-white text-[13px] font-bold transition-colors active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: BRAND, boxShadow: "0 4px 14px rgba(26,122,66,0.25)" }}
                onMouseOver={(e) => !isLoading && (e.currentTarget.style.background = "#239452")}
                onMouseOut={(e) => (e.currentTarget.style.background = BRAND)}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Set up store <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
