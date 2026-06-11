"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
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
  BORDER,
  BRAND,
  BRAND_LIGHT,
  itemVariants,
  listVariants,
  ProgressBar,
  stepVariants,
} from "./helpers";

type Step = 0 | 1 | 2 | 3;
type ExtendedFormValues = StoreSetupFormValues & { phone?: string };

export function StoreSetupForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [direction, setDirection] = useState(1);
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

  useEffect(() => {
    if (!slugEdited && businessNameVal) {
      setValue("slug", toSlug(businessNameVal), { shouldValidate: true });
    }
  }, [businessNameVal, slugEdited, setValue]);

  const storeName = businessNameVal.trim() || null;
  const firstName = storeName ? storeName.split(" ")[0] : null;

  function goTo(next: Step, dir: number) {
    setDirection(dir);
    setStep(next);
  }

  async function handleStep1Next() {
    const valid = await trigger(["businessName", "category", "slug"]);
    if (valid) goTo(2, 1);
  }

  async function onSubmit(_data: ExtendedFormValues) {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    goTo(3, 1);
  }

  function handleVerifyKyc() {
    setKycLoading(true);
    router.push(ROUTES.MERCHANT.OVERVIEW);
  }

  function handleSkipKyc() {
    router.push(ROUTES.MERCHANT.OVERVIEW);
  }

  // ─── STEP 0: Welcome ────────────────────────────────────────
  if (step === 0) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="welcome"
          className="w-full min-h-[70vh] flex items-center justify-center px-5"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
        >
          <motion.div
            className="max-w-sm w-full text-center py-14"
            variants={listVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={itemVariants as any}>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-7"
                style={{
                  background: BRAND_LIGHT,
                  border: `1.5px solid rgba(26,122,66,0.15)`,
                }}
              >
                <Store className="w-8 h-8" style={{ color: BRAND }} />
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants as any}
              className="space-y-3 mb-7"
            >
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
            </motion.div>

            <motion.div
              variants={itemVariants as any}
              className="flex justify-center gap-2 mb-7"
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-full"
                  style={{
                    width: i === 0 ? 20 : 6,
                    height: 6,
                    background: i === 0 ? BRAND : BORDER,
                  }}
                />
              ))}
            </motion.div>

            <motion.div variants={itemVariants as any} className="space-y-3">
              <button
                type="button"
                onClick={() => goTo(1, 1)}
                className="w-full flex items-center justify-center gap-2 h-[46px] rounded-[12px] text-white text-[14px] font-bold transition-all active:scale-[0.98]"
                style={{
                  background: BRAND,
                  boxShadow: "0 4px 18px rgba(26,122,66,0.28)",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#239452")
                }
                onMouseOut={(e) => (e.currentTarget.style.background = BRAND)}
              >
                Let's go
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px]" style={{ color: "#b0b8c1" }}>
                No credit card required · Free to start
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ─── STEP 3: KYC ────────────────────────────────────────────
  if (step === 3) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="kyc"
          className="w-full min-h-[70vh] flex items-center justify-center px-5"
          initial={{ opacity: 0, scale: 0.97, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
        >
          <motion.div
            className="max-w-sm w-full text-center py-14"
            variants={listVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={itemVariants as any}>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: "#f0fdf4", border: "2px solid #86efac" }}
              >
                <ShieldCheck className="w-8 h-8" style={{ color: BRAND }} />
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants as any}
              className="space-y-2 mb-6"
            >
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
                One last thing — verify your identity to unlock higher
                transaction limits and build trust with customers. It only takes
                2 minutes.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants as any}
              className="rounded-[14px] p-4 text-left space-y-2.5 mb-6"
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
            </motion.div>

            <motion.div variants={itemVariants as any} className="space-y-2.5">
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
                    Verify now <ArrowRight className="w-4 h-4" />
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
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "#f8fafc")
                }
              >
                Skip — I'll do it later
              </button>
            </motion.div>

            <motion.p
              variants={itemVariants as any}
              className="text-[11px] mt-4"
              style={{ color: "#94a3b8" }}
            >
              You can always complete verification from your dashboard settings.
            </motion.p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
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
        <AnimatePresence mode="wait">
          <motion.div
            key={`header-${step}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
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
          </motion.div>
        </AnimatePresence>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="py-8">
        <AnimatePresence mode="wait" custom={direction}>
          {/* ── STEP 1 ────────────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={stepVariants as any}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5"
                variants={listVariants}
                initial="hidden"
                animate="show"
              >
                <motion.div variants={itemVariants as any}>
                  <Field
                    label="Business name"
                    error={errors.businessName?.message}
                  >
                    <Input
                      id="businessName"
                      placeholder="e.g. Eko Fashion House"
                      autoComplete="organization"
                      autoFocus
                      {...register("businessName")}
                    />
                  </Field>
                </motion.div>

                <motion.div variants={itemVariants as any}>
                  <Field label="Business phone">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g. 08012345678"
                      autoComplete="tel"
                      {...register("phone")}
                    />
                  </Field>
                </motion.div>

                <motion.div variants={itemVariants as any}>
                  <Field
                    label="Store category"
                    error={errors.category?.message}
                  >
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
                </motion.div>

                <motion.div
                  variants={itemVariants as any}
                  className="sm:col-span-2"
                >
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
                </motion.div>
              </motion.div>

              <motion.div
                className="pt-2 flex justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
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
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* ── STEP 2 ────────────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={stepVariants as any}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-8"
            >
              <motion.div
                className="space-y-3"
                variants={listVariants}
                initial="hidden"
                animate="show"
              >
                <motion.div variants={itemVariants as any}>
                  <FieldLabel>Store currency</FieldLabel>
                  <p
                    className="text-[12px] mt-1 mb-3"
                    style={{ color: "#6b7280" }}
                  >
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
                  <p className="text-[11px] mt-2" style={{ color: "#6b7280" }}>
                    Other currencies will be enabled in future regions.
                  </p>
                </motion.div>

                <motion.div
                  variants={itemVariants as any}
                  className="space-y-2 pt-4"
                >
                  <FieldLabel>Team size</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {TEAM_SIZES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() =>
                          setValue("teamSize", t.value, {
                            shouldValidate: true,
                          })
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
                </motion.div>

                <motion.div
                  variants={itemVariants as any}
                  className="space-y-2 pt-4"
                >
                  <FieldLabel>Number of staff</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {STAFF_RANGES.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() =>
                          setValue("staffRange", r.value, {
                            shouldValidate: true,
                          })
                        }
                        className="px-5 py-2.5 rounded-[10px] border text-[13px] font-semibold transition-all"
                        style={{
                          borderColor:
                            staffRangeVal === r.value ? BRAND : BORDER,
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
                </motion.div>
              </motion.div>

              {/* nav */}
              <motion.div
                className="pt-4 border-t flex items-center justify-between"
                style={{ borderColor: BORDER }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  type="button"
                  onClick={() => goTo(1, -1)}
                  className="flex items-center gap-1.5 h-[42px] px-5 rounded-[10px] border text-[13px] font-semibold transition-all"
                  style={{
                    borderColor: BORDER,
                    color: "#6b7280",
                    background: "#fff",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "#f8fafc")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "#fff")
                  }
                >
                  <ArrowLeft className="w-4 h-4" /> Back
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
                      Set up store <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
