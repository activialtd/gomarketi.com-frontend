import { ShieldCheck, ShieldAlert, Link, Edit3 } from "lucide-react";

export type KycStatus = "verified" | "pending" | "unverified" | "rejected";

export type VendorProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  businessName: string;
  businessCategory: string;
  businessDescription: string;
  location: { city: string; state: string };
  storeUrl: string;
  joinedAt: string;
  plan: "free" | "starter" | "growth" | "pro";
  kycStatus: KycStatus;
  kycSubmittedAt?: string;
  kycVerifiedAt?: string;
  social: { instagram?: string; twitter?: string; facebook?: string };
  stats: {
    products: number;
    orders: number;
    customers: number;
    rating: number;
  };
  settlementAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
};

export const MOCK_PROFILE: VendorProfile = {
  id: "vnd-001",
  fullName: "Akachi Ezekiel",
  email: "hello@ekofashion.ng",
  phone: "+234 803 123 4567",
  businessName: "Eko Fashion House",
  businessCategory: "Fashion & Apparel",
  businessDescription:
    "Premium Nigerian fashion for weddings, events, and everyday life. We specialise in Ankara, Aso-Oke, and contemporary African designs.",
  location: { city: "Surulere", state: "Lagos" },
  storeUrl: "eko-fashion.gomarketi.com",
  joinedAt: "2026-01-15T00:00:00Z",
  plan: "starter",
  kycStatus: "unverified", // ← toggle to "verified" to see the other state
  social: { instagram: "@ekofashionhouse", twitter: "@ekofashion" },
  stats: { products: 8, orders: 34, customers: 21, rating: 4.8 },
  settlementAccount: {
    bankName: "Paystack-Titan",
    accountNumber: "9740176746",
    accountName: "EKO FASHION HOUSE / AKACHI EZEKIEL",
  },
};

export const PLAN_CONFIG = {
  free: { label: "Free", bg: "#f1f5f9", color: "#64748b" },
  starter: { label: "Starter", bg: "#F0FAF3", color: "#1A7A42" },
  growth: { label: "Growth", bg: "#eff6ff", color: "#3b82f6" },
  pro: { label: "Pro", bg: "#faf5ff", color: "#7c3aed" },
};

export const KYC_CONFIG: Record<
  KycStatus,
  {
    label: string;
    sub: string;
    banner: string;
    text: string;
    muted: string;
    icon: React.ElementType;
  }
> = {
  verified: {
    label: "Identity verified",
    sub: "Your business is verified and eligible for all GoMarket features including payouts.",
    banner: "#0A2E1A",
    text: "#F0FAF3",
    muted: "rgba(240,250,243,0.55)",
    icon: ShieldCheck,
  },
  pending: {
    label: "Verification in review",
    sub: "Your documents are under review. This usually takes 1–2 business days.",
    banner: "#713f12",
    text: "#fef08a",
    muted: "rgba(254,240,138,0.7)",
    icon: ShieldAlert,
  },
  unverified: {
    label: "Identity not verified",
    sub: "Verify your identity to unlock withdrawals and build customer trust.",
    banner: "#713f12",
    text: "#fef08a",
    muted: "rgba(254,240,138,0.7)",
    icon: ShieldAlert,
  },
  rejected: {
    label: "Verification unsuccessful",
    sub: "Your documents could not be verified. Please re-submit with clearer images.",
    banner: "#7f1d1d",
    text: "#fecaca",
    muted: "rgba(254,202,202,0.7)",
    icon: ShieldAlert,
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[16px] border overflow-hidden"
      style={{ background: "#fff", borderColor: "#e2e8f0" }}
    >
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "#f1f5f9" }}
      >
        <p className="text-[14px] font-extrabold" style={{ color: "#1C1C1C" }}>
          {title}
        </p>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p
        className="text-[10px] font-bold uppercase tracking-[0.1em] mb-1"
        style={{ color: "#94a3b8" }}
      >
        {label}
      </p>
      <p
        className={`text-[14px] font-semibold ${mono ? "font-mono" : ""}`}
        style={{ color: "#1C1C1C" }}
      >
        {value}
      </p>
    </div>
  );
}

export function EditButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 text-[12px] font-semibold transition-colors"
      style={{ color: "#1A7A42" }}
    >
      <Edit3 className="w-3.5 h-3.5" /> Edit
    </Link>
  );
}

export function StatPill({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div
      className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-[12px]"
      style={{ background: "#fafafa", border: "1px solid #e9eef3" }}
    >
      <div
        className="w-8 h-8 rounded-[8px] flex items-center justify-center"
        style={{ background: `${color}14` }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <p
        className="text-[18px] font-extrabold leading-none"
        style={{ color: "#1C1C1C" }}
      >
        {value}
      </p>
      <p
        className="text-[10px] font-semibold uppercase tracking-wide"
        style={{ color: "#94a3b8" }}
      >
        {label}
      </p>
    </div>
  );
}
