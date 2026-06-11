import { motion } from "framer-motion";
import { Check } from "lucide-react";

export const BRAND = "#1A7A42";
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

export const TEAM_SIZES = [
  { value: "solo", label: "Just me", sub: "Solo founder" },
  { value: "2-10", label: "2 – 10", sub: "Small team" },
  { value: "11-50", label: "11 – 50", sub: "Growing" },
  { value: "51-200", label: "51 – 200", sub: "Scaling" },
  { value: "200+", label: "200+", sub: "Enterprise" },
];

export const STAFF_RANGES = [
  { value: "1-3", label: "1 – 3" },
  { value: "3-5", label: "3 – 5" },
  { value: "5-15", label: "5 – 15" },
  { value: "15-30", label: "15 – 30" },
  { value: "30-50", label: "30 – 50" },
  { value: "50-100", label: "50 – 100" },
  { value: "100+", label: "100+" },
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

export const stepVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? 32 : -32,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 280, damping: 26 },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -32 : 32,
    transition: { duration: 0.18, ease: "easeIn" },
  }),
};

// stagger children
export const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const STEP_LABELS = ["Your store", "Preferences", "Verify"];

export function ProgressBar({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-0 mb-7">
      {STEP_LABELS.map((label, i) => {
        const idx = (i + 1) as 1 | 2 | 3;
        const done = idx < current;
        const active = idx === current;
        const last = i === STEP_LABELS.length - 1;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-1.5 shrink-0">
              <motion.div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                animate={{
                  background: done || active ? BRAND : BORDER,
                  color: done || active ? "#fff" : "#94a3b8",
                  scale: active ? 1.12 : 1,
                }}
                transition={{ duration: 0.25 }}
              >
                {done ? <Check className="w-3 h-3" /> : idx}
              </motion.div>
              <span
                className="text-[12px] font-semibold hidden sm:block transition-colors duration-200"
                style={{ color: active ? BRAND : done ? "#6b7280" : "#94a3b8" }}
              >
                {label}
              </span>
            </div>
            {!last && (
              <motion.div
                className="flex-1 h-px mx-2"
                animate={{ background: done ? BRAND : BORDER }}
                transition={{ duration: 0.35 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
