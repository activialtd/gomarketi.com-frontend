import { Check } from "lucide-react";

export const BRAND = "#0A2E1A";
export const BRAND_LIGHT = "rgba(26,122,66,0.07)";
export const BORDER = "#e2e8f0";

export const CURRENCIES = [
  {
    code: "NGN",
    symbol: "₦",
    name: "Nigerian Naira",
    flag: "🇳🇬",
    active: true,
  },
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸", active: true },
] as const;

export const TEAM_SIZES = [
  { value: "solo", label: "Just me", sub: "Solo founder" },
  { value: "2-10", label: "2 – 10", sub: "Small team" },
  { value: "11-50", label: "11 – 50", sub: "Growing" },
  { value: "51-200", label: "51 – 200", sub: "Scaling" },
  { value: "200+", label: "200+", sub: "Enterprise" },
];

export const STORE_CATEGORIES = [
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

export function CurrencyCard({
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

export function SectionHeading({
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

export function Divider() {
  return <div className="my-8 border-t" style={{ borderColor: "#f1f5f9" }} />;
}

// ─── Field atoms ──────────────────────────────────────────────────────────────

export function Field({
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

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="text-[10px] font-extrabold uppercase block"
      style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}
    >
      {children}
    </label>
  );
}

export function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-red-500">{children}</p>;
}
