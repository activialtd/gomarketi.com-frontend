"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Camera,
  ExternalLink,
  Building2,
  Mail,
  Phone,
  Globe,
  Copy,
  Check,
  ArrowRight,
  CreditCard,
  BadgeCheck,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { ROUTES } from "@/lib/config/routes";
import { KYC_CONFIG, PLAN_CONFIG, Field, EditButton, Section } from "./helper";
import { identityApi, storefrontApi, analyticsApi, type PlanResp } from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import { InstagramIcon, FacebookIcon, TwitterIcon } from "@/lib/icons";

const STORE_DOMAIN = process.env.NEXT_PUBLIC_STORE_DOMAIN ?? "gomarketi.com";

type KycStatus = "verified" | "pending" | "unverified" | "rejected";

// ── Plan display config ────────────────────────────────────────────────────────
const planDisplay: Record<string, { label: string; bg: string; color: string }> = {
  free:    { label: "Free",    bg: "#f1f5f9", color: "#64748b" },
  starter: { label: "Starter", bg: "#F0FAF3", color: "#1A7A42" },
  growth:  { label: "Growth",  bg: "#eff6ff", color: "#3b82f6" },
  scale:   { label: "Scale",   bg: "#faf5ff", color: "#7c3aed" },
};

export default function Settings() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Real data
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [tagline, setTagline] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [city, setCity] = useState("");
  const [storeState, setStoreState] = useState("");
  const [phone, setPhone] = useState("");
  const [joinedAt, setJoinedAt] = useState("");
  const [kycStatus, setKycStatus] = useState<KycStatus>("unverified");
  const [plan, setPlan] = useState<PlanResp | null>(null);
  const [social, setSocial] = useState<{ instagram?: string; twitter?: string; facebook?: string }>({});
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [primaryBank, setPrimaryBank] = useState<{ bank_name: string; account_number_masked: string; account_name: string } | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;

    (async () => {
      const [meRes, storeRes, vendorRes, subRes, analyticsRes, banksRes] = await Promise.allSettled([
        identityApi.getMe(accessToken),
        storefrontApi.getMyStore(accessToken),
        identityApi.getVendorProfile(accessToken),
        identityApi.getSubscription(accessToken),
        analyticsApi.getOverview(accessToken),
        identityApi.listVendorBanks(accessToken),
      ]);

      if (cancelled) return;

      if (meRes.status === "fulfilled") {
        setFullName(meRes.value.full_name ?? "");
        setEmail(meRes.value.email ?? "");
      }
      if (storeRes.status === "fulfilled") {
        const s = storeRes.value;
        setBusinessName(s.name);
        setBusinessCategory(s.category);
        setTagline(s.tagline ?? "");
        setStoreSlug(s.slug);
        setCity(s.city ?? "");
        setStoreState(s.state ?? "");
        setPhone(s.support_phone ?? "");
        setJoinedAt(s.created_at);
        // Parse social from theme_config
        try {
          const cfg = JSON.parse(s.theme_config ?? "{}");
          setSocial(cfg?.sections?.footer?.social ?? {});
        } catch { /* non-fatal */ }
      }
      if (vendorRes.status === "fulfilled") {
        const k = vendorRes.value.kyc_status;
        setKycStatus(k === "none" ? "unverified" : k as KycStatus);
      }
      if (subRes.status === "fulfilled") {
        setPlan(subRes.value.plan);
      }
      if (analyticsRes.status === "fulfilled") {
        setTotalOrders(analyticsRes.value.total_orders);
        setTotalCustomers(analyticsRes.value.total_customers);
      }
      if (banksRes.status === "fulfilled") {
        const banks = banksRes.value;
        const primary = banks.find((b) => b.is_primary) ?? banks[0] ?? null;
        setPrimaryBank(primary);
      }

      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [accessToken]);

  const kyc = KYC_CONFIG[kycStatus];
  const planCfg = planDisplay[plan?.slug ?? "free"] ?? planDisplay.free;
  const isVerified = kycStatus === "verified";
  const initials = (businessName || fullName || "G")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const storeUrl = storeSlug ? `${storeSlug}.${STORE_DOMAIN}` : null;

  function copyAccount() {
    if (primaryBank?.account_number_masked) {
      navigator.clipboard.writeText(primaryBank.account_number_masked);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-32 gap-2" style={{ color: "#94a3b8" }}>
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-[13px]">Loading your profile…</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      {/* ── KYC STATUS BAND ───────────────────────────────────── */}
      <div className="rounded-[16px] overflow-hidden" style={{ background: kyc.banner }}>
        <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(255,255,255,0.1)" }}>
              <kyc.icon className="w-5 h-5" style={{ color: kyc.text }} />
            </div>
            <div>
              <p className="text-[15px] font-extrabold" style={{ color: kyc.text }}>{kyc.label}</p>
              <p className="text-[13px] mt-1 max-w-lg leading-relaxed" style={{ color: kyc.muted }}>{kyc.sub}</p>
            </div>
          </div>

          {!isVerified && kycStatus !== "pending" && (
            <Link
              href={ROUTES.MERCHANT.KYC}
              className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-[13px] font-extrabold shrink-0 transition-all hover:opacity-90 active:scale-[0.97]"
              style={{ background: kyc.text, color: kyc.banner }}
            >
              <ShieldCheck className="w-4 h-4" />
              {kycStatus === "rejected" ? "Re-submit documents" : "Verify identity now"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          {kycStatus === "pending" && (
            <div className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: kyc.muted }}>
              <div className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: kyc.text, borderTopColor: "transparent" }} />
              Under review
            </div>
          )}
        </div>

        {kycStatus === "unverified" && (
          <div className="px-6 pb-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { icon: CreditCard, text: "Withdraw your earnings" },
              { icon: BadgeCheck, text: "Verified badge on storefront" },
              { icon: TrendingUp, text: "Higher payout limits" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[8px]" style={{ background: "rgba(255,255,255,0.06)" }}>
                <Icon className="w-4 h-4 shrink-0" style={{ color: kyc.muted }} />
                <span className="text-[12px] font-medium" style={{ color: kyc.text }}>{text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MAIN GRID ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* ── LEFT ── */}
        <div className="space-y-5">
          {/* Business profile */}
          <Section title="Business profile" action={<EditButton href={ROUTES.MERCHANT.STORE_INFO} />}>
            <div className="flex items-start gap-4 mb-6">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-[14px] flex items-center justify-center text-[22px] font-extrabold text-white" style={{ background: "#0A2E1A" }}>
                  {initials}
                </div>
                <button
                  className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"
                  style={{ background: "#1A7A42" }}
                  title="Change photo"
                >
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[18px] font-extrabold" style={{ color: "#1C1C1C", letterSpacing: "-0.3px" }}>
                    {businessName || fullName || "—"}
                  </p>
                  {isVerified && (
                    <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#F0FAF3", color: "#1A7A42" }}>
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </div>
                  )}
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: planCfg.bg, color: planCfg.color }}>
                    {planCfg.label} plan
                  </span>
                </div>
                <p className="text-[12px] mt-0.5" style={{ color: "#94a3b8" }}>{businessCategory || "—"}</p>
                {storeUrl && (
                  <a href={`https://${storeUrl}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[12px] font-semibold mt-1 w-fit transition-colors"
                    style={{ color: "#1A7A42" }}>
                    <Globe className="w-3 h-3" />{storeUrl}<ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}
              </div>
            </div>

            {tagline && (
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] mb-1.5" style={{ color: "#94a3b8" }}>Tagline</p>
                <p className="text-[13px] leading-relaxed" style={{ color: "#374151" }}>{tagline}</p>
              </div>
            )}

            <div className="h-px mb-4" style={{ background: "#f1f5f9" }} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Category" value={businessCategory || "—"} />
              <Field label="Location" value={city && storeState ? `${city}, ${storeState}` : "—"} />
              <Field label="Member since" value={joinedAt ? new Date(joinedAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "—"} />
              <Field label="Store URL" value={storeUrl ?? "—"} />
            </div>
          </Section>

          {/* Contact details */}
          <Section title="Contact details" action={<EditButton href={ROUTES.MERCHANT.STORE_INFO} />}>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: "#F0FAF3" }}>
                  <Mail className="w-3.5 h-3.5" style={{ color: "#1A7A42" }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#94a3b8" }}>Email</p>
                  <p className="text-[13px] font-semibold truncate" style={{ color: "#1C1C1C" }}>{email || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: "#F0FAF3" }}>
                  <Phone className="w-3.5 h-3.5" style={{ color: "#1A7A42" }} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#94a3b8" }}>WhatsApp / Phone</p>
                  <p className="text-[13px] font-semibold" style={{ color: phone ? "#1C1C1C" : "#94a3b8" }}>
                    {phone || "Not set — add in Store Information"}
                  </p>
                </div>
              </div>
            </div>
          </Section>

          {/* Social links */}
          <Section title="Social media" action={<EditButton href={ROUTES.MERCHANT.CUSTOMISE} />}>
            {social.instagram || social.twitter || social.facebook ? (
              <div className="space-y-3">
                {social.instagram && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: "#F0FAF3" }}>
                      <InstagramIcon />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#94a3b8" }}>Instagram</p>
                      <p className="text-[13px] font-semibold" style={{ color: "#1C1C1C" }}>{social.instagram}</p>
                    </div>
                  </div>
                )}
                {social.twitter && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: "#F0FAF3" }}>
                      <TwitterIcon />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#94a3b8" }}>X (Twitter)</p>
                      <p className="text-[13px] font-semibold" style={{ color: "#1C1C1C" }}>{social.twitter}</p>
                    </div>
                  </div>
                )}
                {social.facebook && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: "#F0FAF3" }}>
                      <FacebookIcon />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#94a3b8" }}>Facebook</p>
                      <p className="text-[13px] font-semibold" style={{ color: "#1C1C1C" }}>{social.facebook}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[13px]" style={{ color: "#94a3b8" }}>
                No social links yet.{" "}
                <Link href={ROUTES.MERCHANT.CUSTOMISE} className="font-semibold" style={{ color: "#1A7A42" }}>
                  Add them in Store Customization →
                </Link>
              </p>
            )}
          </Section>
        </div>

        {/* ── RIGHT ── */}
        <div className="space-y-5">
          {/* Quick stats */}
          <Section title="Store performance">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Building2, label: "Total orders", value: totalOrders },
                { icon: BadgeCheck, label: "Customers", value: totalCustomers },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-[12px] p-3.5" style={{ background: "#F0FAF3" }}>
                  <Icon className="w-4 h-4 mb-2" style={{ color: "#1A7A42" }} />
                  <p className="text-[20px] font-extrabold" style={{ color: "#1C1C1C", letterSpacing: "-0.4px" }}>{value}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide mt-0.5" style={{ color: "#3D6B4F" }}>{label}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Subscription plan */}
          <Section title="Your plan" action={<EditButton href={ROUTES.ONBOARDING.PLANS} />}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: planCfg.bg }}>
                <TrendingUp className="w-4 h-4" style={{ color: planCfg.color }} />
              </div>
              <div>
                <p className="text-[15px] font-extrabold" style={{ color: "#1C1C1C" }}>
                  {plan?.display_name ?? "Free"} plan
                </p>
                <p className="text-[12px]" style={{ color: "#94a3b8" }}>
                  {plan && plan.price_kobo > 0
                    ? `₦${(plan.price_kobo / 100).toLocaleString("en-NG")}/month`
                    : "Free forever"}
                </p>
              </div>
            </div>
            {plan && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {plan.features.slice(0, 3).map((f) => (
                  <span key={f} className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: planCfg.bg, color: planCfg.color }}>{f}</span>
                ))}
              </div>
            )}
          </Section>

          {/* Settlement account */}
          <Section title="Settlement account" action={<EditButton href={ROUTES.MERCHANT.WALLET} />}>
            {primaryBank ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-[10px]" style={{ background: "#F0FAF3" }}>
                  <div className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: "#0A2E1A" }}>
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold truncate" style={{ color: "#1C1C1C" }}>{primaryBank.bank_name}</p>
                    <p className="text-[11px] font-mono" style={{ color: "#6b7280" }}>{primaryBank.account_number_masked}</p>
                    <p className="text-[11px] truncate" style={{ color: "#94a3b8" }}>{primaryBank.account_name}</p>
                  </div>
                  <button type="button" onClick={copyAccount} className="p-1.5 rounded-[6px] hover:bg-white transition-colors" title="Copy account number">
                    {copied ? <Check className="w-3.5 h-3.5" style={{ color: "#1A7A42" }} /> : <Copy className="w-3.5 h-3.5" style={{ color: "#94a3b8" }} />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4 gap-2">
                <CreditCard className="w-8 h-8" style={{ color: "#d1fae5" }} />
                <p className="text-[12px] text-center" style={{ color: "#94a3b8" }}>
                  No bank account added yet.
                </p>
                <Link href={ROUTES.MERCHANT.WALLET} className="text-[12px] font-bold" style={{ color: "#1A7A42" }}>
                  Add account in Wallet →
                </Link>
              </div>
            )}
          </Section>

          {/* Quick links */}
          <Section title="Quick links">
            <div className="space-y-1.5">
              {[
                { label: "Store information", href: ROUTES.MERCHANT.STORE_INFO },
                { label: "Customise storefront", href: ROUTES.MERCHANT.CUSTOMISE },
                { label: "KYC verification", href: ROUTES.MERCHANT.KYC },
                { label: "GoMarket Wallet", href: ROUTES.MERCHANT.WALLET },
              ].map(({ label, href }) => (
                <Link key={href} href={href}
                  className="flex items-center justify-between px-3 py-2.5 rounded-[8px] text-[13px] font-medium transition-colors hover:bg-[#F0FAF3]"
                  style={{ color: "#374151" }}>
                  {label}
                  <ArrowRight className="w-3.5 h-3.5" style={{ color: "#94a3b8" }} />
                </Link>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
