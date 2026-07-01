"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Camera,
  ExternalLink,
  Building2,
  Mail,
  Phone,
  Globe,
  Calendar,
  Copy,
  Check,
  ArrowRight,
  Package,
  Users,
  Star,
  TrendingUp,
  CreditCard,
  Lock,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";
import { ROUTES } from "@/lib/config/routes";
import {
  MOCK_PROFILE,
  KYC_CONFIG,
  PLAN_CONFIG,
  Field,
  StatPill,
  EditButton,
  Section,
} from "./helper";
import { InstagramIcon, FacebookIcon, TwitterIcon } from "@/lib/icons";

export default function Settings() {
  const profile = MOCK_PROFILE;
  const [copied, setCopied] = useState(false);
  const kyc = KYC_CONFIG[profile.kycStatus];
  const plan = PLAN_CONFIG[profile.plan];
  const isVerified = profile.kycStatus === "verified";
  const initials = profile.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function copyAccount() {
    if (profile.settlementAccount) {
      navigator.clipboard.writeText(profile.settlementAccount.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <div className="w-full space-y-5">
      {/* ── KYC STATUS BAND — the hero ─────────────────────── */}
      <div
        className="rounded-[16px] overflow-hidden"
        style={{ background: kyc.banner }}
      >
        <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <kyc.icon className="w-5 h-5" style={{ color: kyc.text }} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <p
                  className="text-[15px] font-extrabold"
                  style={{ color: kyc.text }}
                >
                  {kyc.label}
                </p>
                {isVerified && profile.kycVerifiedAt && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      color: kyc.muted,
                    }}
                  >
                    Verified{" "}
                    {new Date(profile.kycVerifiedAt).toLocaleDateString(
                      "en-NG",
                      { day: "numeric", month: "long", year: "numeric" },
                    )}
                  </span>
                )}
              </div>
              <p
                className="text-[13px] mt-1 max-w-lg leading-relaxed"
                style={{ color: kyc.muted }}
              >
                {kyc.sub}
              </p>
            </div>
          </div>

          {!isVerified && profile.kycStatus !== "pending" && (
            <Link
              href={ROUTES.MERCHANT.KYC}
              className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-[13px] font-extrabold shrink-0 transition-all hover:opacity-90 active:scale-[0.97]"
              style={{ background: kyc.text, color: kyc.banner }}
            >
              <ShieldCheck className="w-4 h-4" />
              {profile.kycStatus === "rejected"
                ? "Re-submit documents"
                : "Verify identity now"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          {profile.kycStatus === "pending" && (
            <div
              className="flex items-center gap-2 text-[12px] font-semibold"
              style={{ color: kyc.muted }}
            >
              <div
                className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: kyc.text, borderTopColor: "transparent" }}
              />
              Under review
            </div>
          )}
        </div>

        {/* Unverified: list what they're missing out on */}
        {profile.kycStatus === "unverified" && (
          <div className="px-6 pb-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { icon: CreditCard, text: "Withdraw your earnings" },
              { icon: BadgeCheck, text: "Verified badge on storefront" },
              { icon: TrendingUp, text: "Higher payout limits" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[8px]"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: kyc.muted }}
                />
                <span
                  className="text-[12px] font-medium"
                  style={{ color: kyc.text }}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* ── MAIN GRID ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* ── LEFT column ─── */}
        <div className="space-y-5">
          {/* Business identity */}
          <Section
            title="Business profile"
            action={<EditButton href="/dashboard/store/information" />}
          >
            <div className="flex items-start gap-4 mb-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  className="w-16 h-16 rounded-[14px] flex items-center justify-center text-[22px] font-extrabold text-white"
                  style={{ background: "#0A2E1A" }}
                >
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

              {/* Name + badges */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p
                    className="text-[18px] font-extrabold"
                    style={{ color: "#1C1C1C", letterSpacing: "-0.3px" }}
                  >
                    {profile.businessName}
                  </p>
                  {isVerified && (
                    <div
                      className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "#F0FAF3", color: "#1A7A42" }}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </div>
                  )}
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: plan.bg, color: plan.color }}
                  >
                    {plan.label} plan
                  </span>
                </div>
                <p className="text-[12px] mt-0.5" style={{ color: "#94a3b8" }}>
                  {profile.businessCategory}
                </p>
                <a
                  href={`https://${profile.storeUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[12px] font-semibold mt-1 w-fit transition-colors"
                  style={{ color: "#1A7A42" }}
                >
                  <Globe className="w-3 h-3" />
                  {profile.storeUrl}
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.1em] mb-1.5"
                  style={{ color: "#94a3b8" }}
                >
                  About
                </p>
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ color: "#374151" }}
                >
                  {profile.businessDescription}
                </p>
              </div>

              <div className="h-px" style={{ background: "#f1f5f9" }} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Category" value={profile.businessCategory} />
                <Field
                  label="Location"
                  value={`${profile.location.city}, ${profile.location.state}`}
                />
                <Field label="Email" value={profile.email} />
                <Field label="Phone" value={profile.phone} />
              </div>
            </div>
          </Section>

          {/* Social links */}
          <Section
            title="Social links"
            action={<EditButton href="/dashboard/store/information" />}
          >
            <div className="space-y-3">
              {[
                {
                  key: "instagram",
                  Icon: InstagramIcon,
                  label: "Instagram",
                  val: profile.social.instagram,
                  color: "#e1306c",
                },
                {
                  key: "twitter",
                  Icon: TwitterIcon,
                  label: "X (Twitter)",
                  val: profile.social.twitter,
                  color: "#1da1f2",
                },
                {
                  key: "facebook",
                  Icon: FacebookIcon,
                  label: "Facebook",
                  val: profile.social.facebook,
                  color: "#1877f2",
                },
              ].map(({ key, Icon, label, val, color }) => (
                <div
                  key={key}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-[10px]"
                  style={{ background: "#fafafa", border: "1px solid #f1f5f9" }}
                >
                  <div
                    className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
                    style={{ background: `${color}14` }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[11px] font-bold uppercase tracking-wide"
                      style={{ color: "#94a3b8" }}
                    >
                      {label}
                    </p>
                    {val ? (
                      <p
                        className="text-[13px] font-semibold truncate"
                        style={{ color: "#1C1C1C" }}
                      >
                        {val}
                      </p>
                    ) : (
                      <p className="text-[13px]" style={{ color: "#d1d5db" }}>
                        Not connected
                      </p>
                    )}
                  </div>
                  {!val && (
                    <button
                      className="text-[11px] font-bold px-2.5 py-1 rounded-[6px] shrink-0"
                      style={{ background: "#F0FAF3", color: "#1A7A42" }}
                    >
                      Connect
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ── RIGHT column ─── */}
        <div className="space-y-5">
          {/* Store stats */}
          <div
            className="rounded-[16px] border p-5"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <p
              className="text-[14px] font-extrabold mb-4"
              style={{ color: "#1C1C1C" }}
            >
              Store performance
            </p>
            <div className="grid grid-cols-2 gap-3">
              <StatPill
                icon={Package}
                label="Products"
                value={profile.stats.products}
                color="#1A7A42"
              />
              <StatPill
                icon={Users}
                label="Customers"
                value={profile.stats.customers}
                color="#3b82f6"
              />
              <StatPill
                icon={TrendingUp}
                label="Orders"
                value={profile.stats.orders}
                color="#8b5cf6"
              />
              <StatPill
                icon={Star}
                label="Rating"
                value={profile.stats.rating}
                color="#f59e0b"
              />
            </div>
          </div>

          {/* Account details */}
          <div
            className="rounded-[16px] border overflow-hidden"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <div
              className="px-5 py-4 border-b"
              style={{ borderColor: "#f1f5f9" }}
            >
              <p
                className="text-[14px] font-extrabold"
                style={{ color: "#1C1C1C" }}
              >
                Account details
              </p>
            </div>
            <div className="p-5 space-y-4">
              <div
                className="flex items-center gap-3 p-3 rounded-[10px]"
                style={{ background: "#fafafa", border: "1px solid #f1f5f9" }}
              >
                <div
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center"
                  style={{ background: "#F0FAF3" }}
                >
                  <Calendar className="w-4 h-4" style={{ color: "#1A7A42" }} />
                </div>
                <div>
                  <p
                    className="text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: "#94a3b8" }}
                  >
                    Member since
                  </p>
                  <p
                    className="text-[13px] font-semibold"
                    style={{ color: "#1C1C1C" }}
                  >
                    {new Date(profile.joinedAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div
                className="flex items-center gap-3 p-3 rounded-[10px]"
                style={{ background: "#fafafa", border: "1px solid #f1f5f9" }}
              >
                <div
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center"
                  style={{ background: "#F0FAF3" }}
                >
                  <Building2 className="w-4 h-4" style={{ color: "#1A7A42" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: "#94a3b8" }}
                  >
                    Vendor ID
                  </p>
                  <p
                    className="text-[13px] font-semibold font-mono truncate"
                    style={{ color: "#1C1C1C" }}
                  >
                    {profile.id}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Settlement account */}
          <div
            className="rounded-[16px] border overflow-hidden"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: "#f1f5f9" }}
            >
              <p
                className="text-[14px] font-extrabold"
                style={{ color: "#1C1C1C" }}
              >
                Settlement account
              </p>
              <Link
                href={ROUTES.MERCHANT.WALLET}
                className="text-[12px] font-semibold"
                style={{ color: "#1A7A42" }}
              >
                Manage
              </Link>
            </div>
            <div className="p-5">
              {profile.settlementAccount ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-[9px] flex items-center justify-center"
                      style={{ background: "#F0FAF3" }}
                    >
                      <CreditCard
                        className="w-4 h-4"
                        style={{ color: "#1A7A42" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[13px] font-bold"
                        style={{ color: "#1C1C1C" }}
                      >
                        {profile.settlementAccount.bankName}
                      </p>
                      <p
                        className="text-[11px] truncate"
                        style={{ color: "#6b7280" }}
                      >
                        {profile.settlementAccount.accountName}
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-[8px]"
                    style={{
                      background: "#fafafa",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <span
                      className="text-[14px] font-mono font-bold"
                      style={{ color: "#1C1C1C" }}
                    >
                      {profile.settlementAccount.accountNumber}
                    </span>
                    <button
                      onClick={copyAccount}
                      className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-[6px] transition-all"
                      style={{
                        background: copied ? "#F0FAF3" : "#fff",
                        color: copied ? "#1A7A42" : "#374151",
                        border: "1px solid",
                        borderColor: copied ? "#1A7A42" : "#e2e8f0",
                      }}
                    >
                      {copied ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>

                  {/* Payout lock if not verified */}
                  {!isVerified && (
                    <div
                      className="flex items-start gap-2.5 px-3.5 py-3 rounded-[8px]"
                      style={{
                        background: "#fff7ed",
                        border: "1px solid rgba(245,158,11,0.2)",
                      }}
                    >
                      <Lock
                        className="w-4 h-4 shrink-0 mt-0.5"
                        style={{ color: "#f59e0b" }}
                      />
                      <div>
                        <p
                          className="text-[12px] font-bold"
                          style={{ color: "#92400e" }}
                        >
                          Payouts are locked
                        </p>
                        <p
                          className="text-[11px] mt-0.5 leading-relaxed"
                          style={{ color: "#b45309" }}
                        >
                          Complete identity verification to enable withdrawals
                          to this account.
                        </p>
                        <Link
                          href={ROUTES.MERCHANT.KYC ?? "/dashboard/kyc"}
                          className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold"
                          style={{ color: "#92400e" }}
                        >
                          Verify now <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p
                    className="text-[13px] font-semibold mb-1"
                    style={{ color: "#374151" }}
                  >
                    No account added yet
                  </p>
                  <p className="text-[12px] mb-3" style={{ color: "#94a3b8" }}>
                    Add a bank account to receive payouts.
                  </p>
                  <Link
                    href={ROUTES.MERCHANT.WALLET}
                    className="text-[12px] font-bold"
                    style={{ color: "#1A7A42" }}
                  >
                    Add account →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Personal info */}
          <Section
            title="Personal info"
            action={<EditButton href="/dashboard/profile/edit" />}
          >
            <div className="space-y-3">
              {[
                { icon: Users, label: "Full name", value: profile.fullName },
                { icon: Mail, label: "Email", value: profile.email },
                { icon: Phone, label: "Phone", value: profile.phone },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon
                    className="w-4 h-4 shrink-0"
                    style={{ color: "#94a3b8" }}
                  />
                  <div className="min-w-0">
                    <p
                      className="text-[10px] font-bold uppercase tracking-wide"
                      style={{ color: "#94a3b8" }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-[13px] font-semibold truncate"
                      style={{ color: "#1C1C1C" }}
                    >
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
