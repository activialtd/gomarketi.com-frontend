// apps/vendor-web/components/onboarding/StoreSetupForm.tsx
// Route: /dashboard/store-setup
// Rendered inside MerchantLayout — fills the main content area.

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Check, AlertCircle, ArrowRight } from "lucide-react";
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

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRENCIES = [
  {
    code: "NGN",
    symbol: "₦",
    name: "Nigerian Naira",
    flag: "🇳🇬",
    active: true,
  },
  {
    code: "KES",
    symbol: "KSh",
    name: "Kenyan Shilling",
    flag: "🇰🇪",
    active: false,
  },
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸", active: false },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺", active: false },
] as const;

const TEAM_SIZES = [
  { value: "solo", label: "Just me", sub: "Solo founder" },
  { value: "2-10", label: "2 – 10", sub: "Small team" },
  { value: "11-50", label: "11 – 50", sub: "Growing" },
  { value: "51-200", label: "51 – 200", sub: "Scaling" },
  { value: "200+", label: "200+", sub: "Enterprise" },
];

const STAFF_RANGES = [
  { value: "1-3", label: "1 – 3" },
  { value: "3-5", label: "3 – 5" },
  { value: "5-15", label: "5 – 15" },
  { value: "15-30", label: "15 – 30" },
  { value: "30-50", label: "30 – 50" },
  { value: "50-100", label: "50 – 100" },
  { value: "100+", label: "100+" },
];

const STORE_CATEGORIES = [
  { value: "fashion", label: "Fashion & Apparel" },
  { value: "beauty", label: "Beauty & Skincare" },
  { value: "food", label: "Food & Beverages" },
  { value: "electronics", label: "Electronics & Gadgets" },
  { value: "home", label: "Home & Living" },
  { value: "health", label: "Health & Wellness" },
  { value: "sports", label: "Sports & Fitness" },
  { value: "books", label: "Books & Stationery" },
  { value: "auto", label: "Auto & Accessories" },
  { value: "kids", label: "Kids & Toys" },
  { value: "jewelry", label: "Jewelry & Accessories" },
  { value: "digital", label: "Digital Products & Services" },
  { value: "agriculture", label: "Agriculture & Farm Produce" },
  { value: "art", label: "Art & Crafts" },
  { value: "other", label: "Other" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function StoreSetupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StoreSetupFormValues>({
    resolver: zodResolver(storeSetupSchema),
    defaultValues: {
      currency: "NGN",
      teamSize: "",
      staffRange: "",
      category: "",
    },
  });

  const businessNameVal = watch("businessName");
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

  async function onSubmit(_data: StoreSetupFormValues) {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    router.push(ROUTES.MERCHANT.OVERVIEW);
  }

  return (
    <div className="w-full px-5">
      {/* ── Page header ─────────────────────────────────────── */}
      <div
        className="px-6 lg:px-10 py-6 border-b"
        style={{ borderColor: "#e2e8f0", background: "#fff" }}
      >
        <h1
          className="text-[22px] font-extrabold leading-tight"
          style={{ letterSpacing: "-0.4px", color: "#1C1C1C" }}
        >
          Set up your store
        </h1>
        <p
          className="text-[13px] mt-1 leading-relaxed"
          style={{ color: "#3D6B4F" }}
        >
          This takes few seconds. You can update everything later.
        </p>
      </div>

      {/* ── Form ────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className=" py-8">
        {/* ── Section: Store Identity ─────────────────────── */}
        <SectionHeading
          step="01"
          title="Store identity"
          description="What your customers will see when they visit your storefront."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mt-5 mb-8">
          {/* Business name */}
          <Field label="Business name" error={errors.businessName?.message}>
            <Input
              id="businessName"
              placeholder="e.g. Eko Fashion House"
              autoComplete="organization"
              {...register("businessName")}
            />
          </Field>

          {/* Store category */}
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
                      borderColor: errors.category ? "#ef4444" : "#e2e8f0",
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

          {/* Store URL — spans full width */}
          <div className="sm:col-span-2">
            <Field
              label="Store URL"
              hint={
                !errors.slug && slugVal.length > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <Check
                      className="w-3 h-3 shrink-0"
                      style={{ color: "#1A7A42" }}
                    />
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: "#1A7A42" }}
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
                style={{ borderColor: "#e2e8f0" }}
                onFocusCapture={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "#1A7A42";
                  (e.currentTarget as HTMLElement).style.outline =
                    "2px solid #1A7A42";
                  (e.currentTarget as HTMLElement).style.outlineOffset = "-2px";
                }}
                onBlurCapture={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "#e2e8f0";
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
                    borderColor: "#e2e8f0",
                    color: "#6b7280",
                  }}
                >
                  .gomarketi.com
                </div>
              </div>
            </Field>
          </div>
        </div>

        <Divider />

        {/* ── Section: Currency ───────────────────────────── */}
        <SectionHeading
          step="02"
          title="Store currency"
          description="The primary currency your store accepts payments in."
        />

        <div className="mt-5 mb-8">
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
          <p className="text-[11px] mt-2.5" style={{ color: "#6b7280" }}>
            Other currencies will be enabled in future regions.
          </p>
        </div>

        <Divider />

        {/* ── Section: Team ───────────────────────────────── */}
        <SectionHeading
          step="03"
          title="Your team"
          description="Helps us tailor your dashboard features and limits."
        />

        <div className="mt-5 mb-8 space-y-6">
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
                    borderColor:
                      teamSizeVal === t.value ? "#1A7A42" : "#e2e8f0",
                    background:
                      teamSizeVal === t.value
                        ? "rgba(26,122,66,0.06)"
                        : "#F0FAF3",
                    color: teamSizeVal === t.value ? "#1A7A42" : "#1C1C1C",
                  }}
                >
                  <span className="font-bold text-[13px]">{t.label}</span>
                  <span
                    className="text-[10px] font-normal mt-0.5"
                    style={{
                      color: teamSizeVal === t.value ? "#1A7A42" : "#6b7280",
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

          {/* Staff count range */}
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
                    borderColor:
                      staffRangeVal === r.value ? "#1A7A42" : "#e2e8f0",
                    background:
                      staffRangeVal === r.value
                        ? "rgba(26,122,66,0.06)"
                        : "#F0FAF3",
                    color: staffRangeVal === r.value ? "#1A7A42" : "#1C1C1C",
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
        </div>

        {/* ── Submit ──────────────────────────────────────── */}
        <div
          className="pt-6 border-t flex flex-col sm:flex-row sm:items-center gap-3"
          style={{ borderColor: "#e2e8f0" }}
        >
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-8 h-[42px] rounded-[10px] text-white text-[13px] font-bold transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "#1A7A42",
              letterSpacing: "0.04em",
              boxShadow: "0 4px 14px rgba(26,122,66,0.25)",
            }}
            onMouseOver={(e) =>
              !isLoading && (e.currentTarget.style.background = "#239452")
            }
            onMouseOut={(e) => (e.currentTarget.style.background = "#1A7A42")}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Continue to dashboard
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <p className="text-[12px]" style={{ color: "#6b7280" }}>
            You can change all of these settings later from your dashboard.
          </p>
        </div>
      </form>
    </div>
  );
}

// ─── CurrencyCard ─────────────────────────────────────────────────────────────

function CurrencyCard({
  currency,
  selected,
  onSelect,
}: {
  currency: (typeof CURRENCIES)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!currency.active}
      title={
        !currency.active ? `${currency.name} — coming soon` : currency.name
      }
      className="relative flex flex-col items-center gap-1 py-4 rounded-[10px] border font-medium transition-all"
      style={{
        borderColor: selected ? "#1A7A42" : "#e2e8f0",
        background: selected
          ? "rgba(26,122,66,0.06)"
          : !currency.active
            ? "transparent"
            : "#F0FAF3",
        opacity: currency.active ? 1 : 0.42,
        cursor: currency.active ? "pointer" : "not-allowed",
      }}
    >
      <span className="text-2xl">{currency.flag}</span>
      <span
        className="font-bold text-[14px] mt-0.5"
        style={{ color: selected ? "#1A7A42" : "#1C1C1C" }}
      >
        {currency.symbol}
      </span>
      <span className="text-[10px] font-semibold" style={{ color: "#6b7280" }}>
        {currency.code}
      </span>
      {!currency.active && (
        <span
          className="absolute -top-2 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: "#f1f5f9", color: "#94a3b8" }}
        >
          Soon
        </span>
      )}
      {selected && (
        <div
          className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ background: "#1A7A42" }}
        >
          <Check className="w-2.5 h-2.5 text-white" />
        </div>
      )}
    </button>
  );
}

// ─── Layout atoms ─────────────────────────────────────────────────────────────

function SectionHeading({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 mt-0.5"
        style={{ background: "rgba(26,122,66,0.1)", color: "#1A7A42" }}
      >
        {step}
      </div>
      <div>
        <p
          className="text-[14px] font-extrabold leading-tight"
          style={{ color: "#1C1C1C" }}
        >
          {title}
        </p>
        <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
          {description}
        </p>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="my-8 border-t" style={{ borderColor: "#f1f5f9" }} />;
}

// ─── Field atoms ──────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  hint,
  children,
}: {
  label?: string;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {label && <FieldLabel>{label}</FieldLabel>}
      {children}
      {hint && <div className="mt-1">{hint}</div>}
      {error && !hint && <FieldError>{error}</FieldError>}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="text-[10px] font-extrabold uppercase block"
      style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}
    >
      {children}
    </label>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-red-500">{children}</p>;
}
