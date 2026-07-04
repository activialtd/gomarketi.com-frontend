"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Check,
  Loader2,
  ExternalLink,
  Globe,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Phone,
  Video,
  Music,
} from "lucide-react";
import { InstagramIcon, TwitterIcon, FacebookIcon } from "@/lib/icons";
import { ROUTES } from "@/lib/config/routes";
import { useMyStore, useVendorProfile, useSubscription, invalidate } from "@/lib/swr/hooks";
import {
  storefrontApi,
  type StoreUpdatePayload,
  type SocialLinks,
  type ThemeConfig,
  type PlanResp,
} from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import { ImageUpload } from "./ImageUpload";
import { ThemePreview } from "./ThemePreview";

const STORE_DOMAIN = process.env.NEXT_PUBLIC_STORE_DOMAIN ?? "gomarketi.com";

// ── Constants ─────────────────────────────────────────────────────────────────

const FONTS = ["Inter", "Poppins", "Playfair Display", "Montserrat", "Lato", "Open Sans"];

const DEFAULT_THEME: ThemeConfig = {
  primary_color: "#1A7A42",
  secondary_color: "#0A2E1A",
  accent_color: "#F0FAF3",
  background_color: "#ffffff",
  text_color: "#1C1C1C",
  font_heading: "Inter",
  font_body: "Inter",
  hero_style: "split",
  products_per_row: 3,
  button_style: "rounded",
  show_hero: true,
  show_featured: true,
  show_categories: false,
};

const TABS = ["Information", "Customization", "Social Media", "Payments", "Staff & Roles", "Subscription"] as const;
type Tab = typeof TABS[number];

// ── Plan display config ───────────────────────────────────────────────────────

const planDisplay: Record<string, { label: string; bg: string; color: string }> = {
  free:    { label: "Free",    bg: "#f1f5f9", color: "#64748b" },
  starter: { label: "Starter", bg: "#F0FAF3", color: "#1A7A42" },
  growth:  { label: "Growth",  bg: "#eff6ff", color: "#3b82f6" },
  scale:   { label: "Scale",   bg: "#faf5ff", color: "#7c3aed" },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] mb-1.5" style={{ color: "#3D6B4F" }}>
      {children}
    </label>
  );
}

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3.5 py-2.5 rounded-[10px] border text-[13px] outline-none transition-all"
      style={{
        borderColor: "#e2e8f0",
        background: "#F0FAF3",
        color: "#1C1C1C",
        ...((props.style as React.CSSProperties) ?? {}),
      }}
      onFocus={(e) => {
        e.currentTarget.style.background = "#fff";
        e.currentTarget.style.borderColor = "#1A7A42";
        e.currentTarget.style.outline = "2px solid #1A7A42";
        e.currentTarget.style.outlineOffset = "-2px";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.background = "#F0FAF3";
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.outline = "none";
        props.onBlur?.(e);
      }}
    />
  );
}

function StyledTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={3}
      {...props}
      className="w-full px-3.5 py-2.5 rounded-[10px] border text-[13px] resize-none outline-none transition-all"
      style={{
        borderColor: "#e2e8f0",
        background: "#F0FAF3",
        color: "#1C1C1C",
        lineHeight: "1.6",
        ...((props.style as React.CSSProperties) ?? {}),
      }}
      onFocus={(e) => {
        e.currentTarget.style.background = "#fff";
        e.currentTarget.style.borderColor = "#1A7A42";
        e.currentTarget.style.outline = "2px solid #1A7A42";
        e.currentTarget.style.outlineOffset = "-2px";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.background = "#F0FAF3";
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.outline = "none";
        props.onBlur?.(e);
      }}
    />
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      role="switch"
      aria-checked={on}
      className="shrink-0 relative inline-flex h-5 w-9 rounded-full transition-colors duration-200"
      style={{ background: on ? "#1A7A42" : "#cbd5e1" }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5"
        style={{ transform: on ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  );
}

function ColorSwatch({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-[8px] border" style={{ background: value, borderColor: "#e2e8f0" }} />
        <div className="flex-1 relative">
          <StyledInput
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#1A7A42"
            maxLength={7}
          />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded cursor-pointer border-0 p-0 opacity-0"
            style={{ width: 24, height: 24 }}
            title="Pick color"
          />
          <div
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded border pointer-events-none"
            style={{ background: value, borderColor: "#e2e8f0" }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Banner / toast ─────────────────────────────────────────────────────────────

function SaveBanner({ visible, error }: { visible: boolean; error: string | null }) {
  if (!visible && !error) return null;
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-[12px] shadow-lg text-[13px] font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200"
      style={{
        background: error ? "#7f1d1d" : "#0A2E1A",
        color: error ? "#fecaca" : "#d1fae5",
      }}
    >
      {error ? (
        <span>{error}</span>
      ) : (
        <>
          <Check className="w-4 h-4" style={{ color: "#86efac" }} />
          Changes saved!
        </>
      )}
    </div>
  );
}

// ── Tab: Store Information ─────────────────────────────────────────────────────

interface InfoState {
  name: string;
  tagline: string;
  description: string;
  site_description: string;
}

function InformationTab({
  info,
  setInfo,
}: {
  info: InfoState;
  setInfo: (patch: Partial<InfoState>) => void;
}) {
  const charLimitTagline = 80;
  const charLimitSiteDesc = 160;

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <p className="text-[15px] font-extrabold" style={{ color: "#1C1C1C" }}>Store Information</p>
        <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
          Displayed on your storefront and in customer communications.
        </p>
      </div>

      <div className="rounded-[14px] border p-5 space-y-4" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
        {/* Store name */}
        <div>
          <FieldLabel>Store name</FieldLabel>
          <StyledInput
            value={info.name}
            onChange={(e) => setInfo({ name: e.target.value })}
            placeholder="e.g. Eko Fashion House"
            maxLength={100}
          />
        </div>

        {/* Tagline */}
        <div>
          <FieldLabel>Tagline</FieldLabel>
          <StyledInput
            value={info.tagline}
            onChange={(e) => setInfo({ tagline: e.target.value })}
            placeholder="A short catchy phrase for your store"
            maxLength={charLimitTagline}
          />
          <p className="text-[10px] mt-1" style={{ color: info.tagline.length > charLimitTagline * 0.9 ? "#f59e0b" : "#94a3b8" }}>
            {info.tagline.length}/{charLimitTagline} characters
          </p>
        </div>

        {/* Description */}
        <div>
          <FieldLabel>Store description</FieldLabel>
          <StyledTextarea
            value={info.description}
            onChange={(e) => setInfo({ description: e.target.value })}
            placeholder="Tell customers about your store — what you sell, your story, what makes you unique."
            rows={4}
          />
        </div>

        {/* SEO meta description */}
        <div>
          <FieldLabel>SEO meta description</FieldLabel>
          <StyledTextarea
            value={info.site_description}
            onChange={(e) => setInfo({ site_description: e.target.value })}
            placeholder="Shown in Google search results (max 160 chars)"
            rows={3}
          />
          <p
            className="text-[10px] mt-1"
            style={{ color: info.site_description.length > charLimitSiteDesc ? "#ef4444" : "#94a3b8" }}
          >
            {info.site_description.length}/{charLimitSiteDesc} characters
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Customization ────────────────────────────────────────────────────────

interface CustomState {
  logo_url: string;
  hero_image_url: string;
  theme: ThemeConfig;
}

function CustomizationTab({
  custom,
  setCustom,
  storeName,
  accessToken,
}: {
  custom: CustomState;
  setCustom: (patch: Partial<CustomState>) => void;
  storeName: string;
  accessToken: string;
}) {
  function setTheme(patch: Partial<ThemeConfig>) {
    setCustom({ theme: { ...custom.theme, ...patch } });
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
      {/* Left: controls */}
      <div className="space-y-5">
        <div>
          <p className="text-[15px] font-extrabold" style={{ color: "#1C1C1C" }}>Store Customization</p>
          <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
            Customize your storefront appearance. Changes apply after saving.
          </p>
        </div>

        {/* Branding images */}
        <div className="rounded-[14px] border p-5 space-y-6" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
          <p className="text-[13px] font-extrabold" style={{ color: "#1C1C1C" }}>Branding Images</p>

          <ImageUpload
            label="Store Logo"
            description="Square logo — PNG or SVG with transparent background recommended. Min 200×200px."
            currentUrl={custom.logo_url || undefined}
            aspectRatio="1:1"
            onUploaded={(url) => setCustom({ logo_url: url })}
            accessToken={accessToken}
            uploadType="logo"
          />

          <div className="h-px" style={{ background: "#f1f5f9" }} />

          <ImageUpload
            label="Hero Image"
            description="Banner shown at the top of your storefront. 16:9 ratio recommended (e.g. 1280×720px)."
            currentUrl={custom.hero_image_url || undefined}
            aspectRatio="16:9"
            onUploaded={(url) => setCustom({ hero_image_url: url })}
            accessToken={accessToken}
            uploadType="hero"
          />
        </div>

        {/* Theme colors */}
        <div className="rounded-[14px] border p-5 space-y-4" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
          <p className="text-[13px] font-extrabold" style={{ color: "#1C1C1C" }}>Brand Colors</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ColorSwatch label="Primary color" value={custom.theme.primary_color} onChange={(v) => setTheme({ primary_color: v })} />
            <ColorSwatch label="Secondary color" value={custom.theme.secondary_color} onChange={(v) => setTheme({ secondary_color: v })} />
            <ColorSwatch label="Accent / light bg" value={custom.theme.accent_color} onChange={(v) => setTheme({ accent_color: v })} />
            <ColorSwatch label="Page background" value={custom.theme.background_color} onChange={(v) => setTheme({ background_color: v })} />
            <ColorSwatch label="Text color" value={custom.theme.text_color} onChange={(v) => setTheme({ text_color: v })} />
          </div>
        </div>

        {/* Typography */}
        <div className="rounded-[14px] border p-5 space-y-4" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
          <p className="text-[13px] font-extrabold" style={{ color: "#1C1C1C" }}>Typography</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Heading font</FieldLabel>
              <select
                className="w-full h-[42px] px-3.5 rounded-[10px] border text-[13px] outline-none"
                style={{ borderColor: "#e2e8f0", background: "#F0FAF3", color: "#1C1C1C" }}
                value={custom.theme.font_heading}
                onChange={(e) => setTheme({ font_heading: e.target.value })}
              >
                {FONTS.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Body font</FieldLabel>
              <select
                className="w-full h-[42px] px-3.5 rounded-[10px] border text-[13px] outline-none"
                style={{ borderColor: "#e2e8f0", background: "#F0FAF3", color: "#1C1C1C" }}
                value={custom.theme.font_body}
                onChange={(e) => setTheme({ font_body: e.target.value })}
              >
                {FONTS.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="rounded-[14px] border p-5 space-y-5" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
          <p className="text-[13px] font-extrabold" style={{ color: "#1C1C1C" }}>Layout & Style</p>

          {/* Products per row */}
          <div>
            <FieldLabel>Products per row</FieldLabel>
            <div className="flex gap-2">
              {([2, 3, 4] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setTheme({ products_per_row: n })}
                  className="flex-1 py-2 rounded-[8px] border text-[13px] font-bold transition-all"
                  style={{
                    borderColor: custom.theme.products_per_row === n ? "#1A7A42" : "#e2e8f0",
                    background: custom.theme.products_per_row === n ? "#F0FAF3" : "#f8fafc",
                    color: custom.theme.products_per_row === n ? "#1A7A42" : "#6b7280",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Hero style */}
          <div>
            <FieldLabel>Hero style</FieldLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["full", "split", "minimal", "none"] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setTheme({ hero_style: style })}
                  className="py-2 rounded-[8px] border text-[11px] font-bold capitalize transition-all"
                  style={{
                    borderColor: custom.theme.hero_style === style ? "#1A7A42" : "#e2e8f0",
                    background: custom.theme.hero_style === style ? "#F0FAF3" : "#f8fafc",
                    color: custom.theme.hero_style === style ? "#1A7A42" : "#6b7280",
                  }}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Button style */}
          <div>
            <FieldLabel>Button style</FieldLabel>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: "rounded", label: "Rounded" },
                { id: "sharp", label: "Sharp" },
                { id: "pill", label: "Pill" },
              ] as const).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTheme({ button_style: id })}
                  className="py-2 border text-[11px] font-bold transition-all"
                  style={{
                    borderRadius: id === "rounded" ? 8 : id === "sharp" ? 2 : 999,
                    borderColor: custom.theme.button_style === id ? "#1A7A42" : "#e2e8f0",
                    background: custom.theme.button_style === id ? "#F0FAF3" : "#f8fafc",
                    color: custom.theme.button_style === id ? "#1A7A42" : "#6b7280",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-1">
            {[
              { key: "show_hero" as const, label: "Show hero section", sub: "Full-width banner at the top of your store" },
              { key: "show_featured" as const, label: "Show featured products", sub: "Highlight selected products on the homepage" },
              { key: "show_categories" as const, label: "Show categories grid", sub: "Display a grid of your product categories" },
            ].map(({ key, label, sub }) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: "#374151" }}>{label}</p>
                  <p className="text-[11px]" style={{ color: "#94a3b8" }}>{sub}</p>
                </div>
                <Toggle on={custom.theme[key] as boolean} onChange={() => setTheme({ [key]: !custom.theme[key] })} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: live preview */}
      <div className="xl:sticky xl:top-6 self-start space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: "#94a3b8" }}>Live preview</p>
        <ThemePreview
          storeName={storeName}
          logoUrl={custom.logo_url || undefined}
          heroImageUrl={custom.hero_image_url || undefined}
          theme={custom.theme}
        />
        <p className="text-[10px] text-center" style={{ color: "#94a3b8" }}>
          Preview updates as you change settings
        </p>
      </div>
    </div>
  );
}

// ── Tab: Social Media ─────────────────────────────────────────────────────────

const SOCIAL_FIELDS: {
  key: keyof SocialLinks;
  label: string;
  placeholder: string;
  icon: React.ElementType;
  iconColor: string;
}[] = [
  { key: "instagram", label: "Instagram", placeholder: "@yourstorename", icon: InstagramIcon, iconColor: "#e1306c" },
  { key: "twitter",   label: "Twitter / X", placeholder: "@yourstorename", icon: TwitterIcon, iconColor: "#1da1f2" },
  { key: "facebook",  label: "Facebook", placeholder: "facebook.com/yourpage", icon: FacebookIcon, iconColor: "#1877f2" },
  { key: "tiktok",    label: "TikTok", placeholder: "@yourstorename", icon: Music, iconColor: "#010101" },
  { key: "whatsapp",  label: "WhatsApp", placeholder: "+2348012345678", icon: Phone, iconColor: "#25d366" },
  { key: "youtube",   label: "YouTube", placeholder: "youtube.com/c/yourchannel", icon: Video, iconColor: "#ff0000" },
];

function SocialMediaTab({
  social,
  setSocial,
}: {
  social: SocialLinks;
  setSocial: (patch: Partial<SocialLinks>) => void;
}) {
  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <p className="text-[15px] font-extrabold" style={{ color: "#1C1C1C" }}>Social Media Links</p>
        <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
          These links appear in your storefront footer so customers can find you everywhere.
        </p>
      </div>

      <div className="rounded-[14px] border p-5 space-y-4" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
        {SOCIAL_FIELDS.map(({ key, label, placeholder, icon: Icon, iconColor }) => (
          <div key={key}>
            <FieldLabel>{label}</FieldLabel>
            <div className="relative flex items-center">
              <div
                className="absolute left-3 w-5 h-5 flex items-center justify-center shrink-0"
                style={{ color: iconColor }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <StyledInput
                value={social[key] ?? ""}
                onChange={(e) => setSocial({ [key]: e.target.value || undefined })}
                placeholder={placeholder}
                style={{ paddingLeft: "2.25rem" }}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        className="rounded-[12px] p-4 text-[12px]"
        style={{ background: "#F0FAF3", border: "1px solid rgba(26,122,66,0.15)", color: "#3D6B4F" }}
      >
        <strong>Tip:</strong> You can enter handles (e.g. @mystore) or full URLs. GoMarketi will display them correctly.
      </div>
    </div>
  );
}

// ── Tab: Payments ─────────────────────────────────────────────────────────────

function PaymentGatewaysTab() {
  // Lazy import to keep Settings bundle slim
  const PaymentGateways = require("./PaymentGateways").default as React.ComponentType;
  return <div className="max-w-2xl pt-2"><PaymentGateways /></div>;
}

// ── Tab: Staff & Roles ────────────────────────────────────────────────────────

function StaffRolesTab() {
  const StaffRoles = require("./StaffRoles").default as React.ComponentType;
  return <StaffRoles />;
}

// ── Tab: Subscription ─────────────────────────────────────────────────────────

function SubscriptionTab({ plan }: { plan: PlanResp | null }) {
  const planCfg = planDisplay[plan?.slug ?? "free"] ?? planDisplay.free;

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <p className="text-[15px] font-extrabold" style={{ color: "#1C1C1C" }}>Your Subscription</p>
        <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
          Manage your GoMarketi plan and billing.
        </p>
      </div>

      <div className="rounded-[14px] border p-5 space-y-4" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
        {/* Current plan */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: planCfg.bg }}>
            <TrendingUp className="w-5 h-5" style={{ color: planCfg.color }} />
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
          <div className="ml-auto">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: planCfg.bg, color: planCfg.color }}>
              {planCfg.label}
            </span>
          </div>
        </div>

        {/* Features */}
        {plan && plan.features.length > 0 && (
          <div className="pt-2 border-t space-y-2" style={{ borderColor: "#f1f5f9" }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: "#94a3b8" }}>Included in your plan</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {plan.features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-[12px]" style={{ color: "#374151" }}>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: "#F0FAF3" }}>
                    <Check className="w-2.5 h-2.5" style={{ color: "#1A7A42" }} />
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Limits */}
        {plan && (
          <div className="pt-2 border-t grid grid-cols-3 gap-3" style={{ borderColor: "#f1f5f9" }}>
            {[
              { label: "Products", value: plan.product_limit === -1 ? "Unlimited" : plan.product_limit },
              { label: "Team members", value: plan.team_limit === -1 ? "Unlimited" : plan.team_limit },
              { label: "Stores", value: plan.store_limit === -1 ? "Unlimited" : plan.store_limit },
            ].map(({ label, value }) => (
              <div key={label} className="text-center py-3 rounded-[10px]" style={{ background: "#f8fafc" }}>
                <p className="text-[16px] font-extrabold" style={{ color: "#1C1C1C" }}>{value}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide mt-0.5" style={{ color: "#94a3b8" }}>{label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upgrade CTA */}
      {(!plan || plan.price_kobo === 0) && (
        <div
          className="rounded-[14px] p-5 space-y-3"
          style={{ background: "#0A2E1A" }}
        >
          <p className="text-[15px] font-extrabold text-white">Unlock more with a paid plan</p>
          <p className="text-[12px]" style={{ color: "rgba(240,250,243,0.7)" }}>
            Upgrade to Starter or Growth to get higher product limits, priority support, and a GoMarketi Verified badge.
          </p>
          <Link
            href={ROUTES.ONBOARDING.PLANS}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[8px] text-[13px] font-bold transition-colors"
            style={{ background: "#1A7A42", color: "#fff" }}
          >
            View plans <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {plan && plan.price_kobo > 0 && (
        <div className="rounded-[14px] border p-4 flex items-center justify-between" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
          <div>
            <p className="text-[13px] font-bold" style={{ color: "#1C1C1C" }}>Need a different plan?</p>
            <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>Upgrade, downgrade, or cancel anytime.</p>
          </div>
          <Link
            href={ROUTES.ONBOARDING.PLANS}
            className="flex items-center gap-1.5 text-[12px] font-bold"
            style={{ color: "#1A7A42" }}
          >
            Manage plan <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

// ── KYC banner ────────────────────────────────────────────────────────────────

const KYC_CFG = {
  verified:   { label: "Identity verified", banner: "#0A2E1A", text: "#F0FAF3", muted: "rgba(240,250,243,0.55)", icon: ShieldCheck },
  pending:    { label: "Verification in review", banner: "#713f12", text: "#fef08a", muted: "rgba(254,240,138,0.7)", icon: ShieldAlert },
  unverified: { label: "Identity not verified", banner: "#713f12", text: "#fef08a", muted: "rgba(254,240,138,0.7)", icon: ShieldAlert },
  rejected:   { label: "Verification unsuccessful", banner: "#7f1d1d", text: "#fecaca", muted: "rgba(254,202,202,0.7)", icon: ShieldAlert },
};

// ── Main component ────────────────────────────────────────────────────────────

export default function Settings() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [activeTab, setActiveTab] = useState<Tab>("Information");
  const [isSaving, setIsSaving] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // SWR data
  const { data: store, isLoading: loadingStore } = useMyStore();
  const { data: vendorProfile, isLoading: loadingVendor } = useVendorProfile();
  const { data: subscription } = useSubscription();

  // Local state for the forms — seeded from SWR data
  const [info, setInfo] = useState<InfoState>({
    name: "",
    tagline: "",
    description: "",
    site_description: "",
  });
  const [custom, setCustom] = useState<CustomState>({
    logo_url: "",
    hero_image_url: "",
    theme: { ...DEFAULT_THEME },
  });
  const [social, setSocial] = useState<SocialLinks>({});

  // Seed state from store data once loaded
  const [seeded, setSeeded] = useState(false);
  useEffect(() => {
    if (!store || seeded) return;

    setInfo({
      name: store.name ?? "",
      tagline: store.tagline ?? "",
      description: store.description ?? "",
      site_description: store.site_description ?? "",
    });

    // Parse theme from JSON string if present
    let parsedTheme: Partial<ThemeConfig> = {};
    if (store.theme_config) {
      try {
        const raw = JSON.parse(store.theme_config) as Record<string, unknown>;
        // Support both the old nested format and the new flat ThemeConfig
        if ("primary_color" in raw) {
          parsedTheme = raw as Partial<ThemeConfig>;
        }
      } catch { /* use defaults */ }
    }

    setCustom({
      logo_url: store.logo_url ?? "",
      hero_image_url: store.hero_image_url ?? "",
      theme: { ...DEFAULT_THEME, ...parsedTheme },
    });

    setSocial(store.social_links ?? {});
    setSeeded(true);
  }, [store, seeded]);

  const loading = loadingStore || loadingVendor;

  const kycRaw = vendorProfile?.kyc_status ?? "none";
  const kycStatus = (kycRaw === "none" ? "unverified" : kycRaw) as keyof typeof KYC_CFG;
  const kyc = KYC_CFG[kycStatus] ?? KYC_CFG.unverified;
  const plan: PlanResp | null = subscription?.plan ?? null;
  const storeUrl = store?.slug ? `${store.slug}.${STORE_DOMAIN}` : null;

  async function handleSave() {
    if (!accessToken || !store) return;
    setIsSaving(true);
    setSaveError(null);

    // Build the payload with only the fields from active sections
    const payload: StoreUpdatePayload = {
      // Information fields always included
      name: info.name || undefined,
      tagline: info.tagline || undefined,
      description: info.description || undefined,
      site_description: info.site_description || undefined,
      // Customization fields
      logo_url: custom.logo_url || undefined,
      hero_image_url: custom.hero_image_url || undefined,
      theme_config: custom.theme,
      // Social
      social_links: social,
    };

    try {
      await storefrontApi.updateStore(store.id, payload, accessToken);
      // Invalidate SWR cache
      invalidate.store();
      invalidate.vendorProfile();
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save changes. Please try again.";
      setSaveError(msg);
      setTimeout(() => setSaveError(null), 4000);
    } finally {
      setIsSaving(false);
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
    <div className="w-full">
      {/* ── KYC status band ─────────────────────────────────────── */}
      {kycStatus !== "verified" && (
        <div className="mb-5 rounded-[14px] overflow-hidden" style={{ background: kyc.banner }}>
          <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <kyc.icon className="w-5 h-5 shrink-0" style={{ color: kyc.text }} />
              <div>
                <p className="text-[13px] font-bold" style={{ color: kyc.text }}>{kyc.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: kyc.muted }}>
                  {kycStatus === "pending"
                    ? "Your documents are under review. This usually takes 1–2 business days."
                    : kycStatus === "rejected"
                      ? "Your documents could not be verified. Please re-submit with clearer images."
                      : "Verify your identity to unlock withdrawals and build customer trust."}
                </p>
              </div>
            </div>
            {kycStatus !== "pending" && (
              <Link
                href={ROUTES.MERCHANT.KYC}
                className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-[12px] font-bold shrink-0 transition-all hover:opacity-90"
                style={{ background: kyc.text, color: kyc.banner }}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {kycStatus === "rejected" ? "Re-submit documents" : "Verify now"}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Page header ─────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-10 border-b bg-white mb-5"
        style={{ borderColor: "#e2e8f0" }}
      >
        <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-[18px] font-extrabold" style={{ color: "#1C1C1C", letterSpacing: "-0.3px" }}>
                Settings
              </h1>
              {storeUrl && (
                <a
                  href={`https://${storeUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] font-semibold"
                  style={{ color: "#1A7A42" }}
                >
                  <Globe className="w-3 h-3" />{storeUrl}<ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
                </a>
              )}
            </div>
          </div>

          {activeTab !== "Subscription" && (
            <div className="flex items-center gap-2">
              {saveError && (
                <span className="text-[11px] font-semibold max-w-[220px] truncate" style={{ color: "#ef4444" }}>
                  {saveError}
                </span>
              )}
              {showBanner && (
                <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: "#1A7A42" }}>
                  <Check className="w-3.5 h-3.5" /> Saved!
                </span>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 h-9 px-4 rounded-[8px] text-white text-[12px] font-bold transition-all disabled:opacity-60"
                style={{ background: "#0A2E1A", boxShadow: "0 2px 8px rgba(26,122,66,0.25)" }}
                onMouseOver={(e) => !isSaving && (e.currentTarget.style.background = "#239452")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#0A2E1A")}
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "Save changes"
                )}
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex px-6 gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2.5 text-[12px] font-semibold whitespace-nowrap transition-colors border-b-2"
              style={{
                color: activeTab === tab ? "#1A7A42" : "#94a3b8",
                borderColor: activeTab === tab ? "#1A7A42" : "transparent",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ─────────────────────────────────────────── */}
      <div className="px-6 pb-12">
        {activeTab === "Information" && (
          <InformationTab
            info={info}
            setInfo={(patch) => setInfo((prev) => ({ ...prev, ...patch }))}
          />
        )}
        {activeTab === "Customization" && (
          <CustomizationTab
            custom={custom}
            setCustom={(patch) => setCustom((prev) => ({ ...prev, ...patch }))}
            storeName={info.name || store?.name || "Your Store"}
            accessToken={accessToken ?? ""}
          />
        )}
        {activeTab === "Social Media" && (
          <SocialMediaTab
            social={social}
            setSocial={(patch) => setSocial((prev) => ({ ...prev, ...patch }))}
          />
        )}
        {activeTab === "Payments" && (
          <PaymentGatewaysTab />
        )}
        {activeTab === "Staff & Roles" && (
          <StaffRolesTab />
        )}
        {activeTab === "Subscription" && (
          <SubscriptionTab plan={plan} />
        )}
      </div>

      {/* Floating save banner (toast) */}
      <SaveBanner visible={showBanner} error={saveError} />
    </div>
  );
}
