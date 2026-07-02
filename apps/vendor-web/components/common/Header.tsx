"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Menu,
  ChevronDown,
  Globe,
  ExternalLink,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { ROUTES } from "@/lib/config/routes";

interface HeaderProps {
  onMenuClick: () => void;
  storeName?: string;
  storeSlug?: string;
  storeDomain?: string;
  merchantName?: string;
  userEmail?: string;
  avatarInitials?: string;
  hasNotifications?: boolean;
  onSignOut?: () => void;
}

export function Header({
  onMenuClick,
  storeName = "My Store",
  storeSlug = "",
  storeDomain = "gomarketi.com",
  merchantName = "Merchant",
  userEmail,
  avatarInitials,
  hasNotifications = false,
  onSignOut,
}: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);

  const initials =
    avatarInitials ??
    merchantName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  // Build storefront URL based on environment:
  // - Local dev (STORE_DOMAIN contains "localhost" or a port): path-based routing
  //   → http://localhost:3001/storefront/{slug}  (apps/web dev server)
  // - Production: subdomain routing
  //   → https://{slug}.gomarketi.com
  const isLocalDev = storeDomain.includes("localhost") || /:\d+/.test(storeDomain);
  const storeUrl = storeSlug
    ? isLocalDev
      ? `http://${storeDomain}/storefront/${storeSlug}`
      : `https://${storeSlug}.${storeDomain}`
    : "#";
  const storeSlugDisplay = storeSlug
    ? isLocalDev
      ? `${storeDomain}/storefront/${storeSlug}`
      : `${storeSlug}.${storeDomain}`
    : "";

  return (
    <header
      className="sticky top-0 z-30 flex items-center shrink-0"
      style={{
        height: "64px",
        background: "#ffffff",
        borderBottom: "1px solid #e9eef3",
        padding: "0 20px",
        gap: "14px",
      }}
    >
      {/* ── Hamburger (mobile) ─────────────────────────────── */}
      <button
        type="button"
        onClick={onMenuClick}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-[8px] transition-colors hover:bg-gray-100"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" style={{ color: "#374151" }} />
      </button>

      {/* ── Store name — the identity anchor of the header ── */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0"
          style={{ background: "#0A2E1A" }}
        >
          <Globe className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="min-w-0 hidden sm:block">
          <p
            className="text-[13px] font-extrabold leading-none truncate max-w-[160px]"
            style={{ color: "#1C1C1C" }}
          >
            {storeName}
          </p>
          {storeSlug && (
            <p className="text-[10px] font-medium mt-0.5 truncate max-w-[160px]" style={{ color: "#94a3b8" }}>
              {storeSlugDisplay}
            </p>
          )}
        </div>
      </div>

      {/* ── Spacer ─────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Right cluster ──────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* View Store CTA
            Local dev  → http://localhost:3001/storefront/{slug}  (path-based, apps/web dev server)
            Production → https://{slug}.gomarketi.com             (subdomain, Cloudflare SSL) */}
        {storeSlug && (
          <Link
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] text-[12px] font-bold transition-all hover:opacity-90 active:scale-[0.97]"
            style={{
              background: "#0A2E1A",
              color: "#fff",
              boxShadow: "0 2px 8px rgba(10,46,26,0.25)",
            }}
          >
            <Globe className="w-3.5 h-3.5" />
            View Store
            <ExternalLink className="w-3 h-3 opacity-60" />
          </Link>
        )}

        {/* Notification bell */}
        <button
          type="button"
          className="relative w-9 h-9 flex items-center justify-center rounded-[8px] border transition-colors hover:bg-gray-50"
          style={{ borderColor: "#e9eef3" }}
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" style={{ color: "#64748b" }} />
          {hasNotifications && (
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
              style={{ background: "#ef4444" }}
            />
          )}
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-[10px] border transition-colors hover:bg-gray-50"
            style={{ borderColor: "#e9eef3" }}
          >
            {/* Avatar */}
            <div
              className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shrink-0"
              style={{ background: "#0A2E1A" }}
            >
              {initials}
            </div>
            <span
              className="hidden md:block text-[13px] font-semibold max-w-[100px] truncate"
              style={{ color: "#374151" }}
            >
              {merchantName}
            </span>
            <ChevronDown
              className="w-3.5 h-3.5 transition-transform duration-150"
              style={{
                color: "#9ca3af",
                transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
              />
              <div
                className="absolute top-full right-0 mt-2 w-56 rounded-[12px] border shadow-xl overflow-hidden z-50"
                style={{
                  background: "#fff",
                  borderColor: "#e9eef3",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.10)",
                }}
              >
                {/* Identity strip */}
                <div
                  className="px-4 py-3.5 border-b"
                  style={{ borderColor: "#f1f5f9" }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white shrink-0"
                      style={{ background: "#1A7A42" }}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-[13px] font-bold leading-tight truncate"
                        style={{ color: "#1C1C1C" }}
                      >
                        {merchantName}
                      </p>
                      <p
                        className="text-[11px] truncate mt-0.5"
                        style={{ color: "#94a3b8" }}
                      >
                        {userEmail ?? storeName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-1.5 px-1.5">
                  {[
                    {
                      Icon: User,
                      label: "Profile",
                      href: ROUTES.MERCHANT.PROFILE,
                    },
                    {
                      Icon: Settings,
                      label: "Account settings",
                      href: ROUTES.MERCHANT.SETTINGS,
                    },
                  ].map(({ Icon, label, href }) => (
                    <Link
                      href={href}
                      key={label}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[7px] text-[13px] font-medium text-left transition-colors hover:bg-gray-50"
                      style={{ color: "#374151" }}
                    >
                      <Icon
                        className="w-4 h-4 shrink-0"
                        style={{ color: "#9ca3af" }}
                      />
                      {label}
                    </Link>
                  ))}
                </div>

                <div
                  className="py-1.5 px-1.5 border-t"
                  style={{ borderColor: "#f1f5f9" }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onSignOut?.();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[7px] text-[13px] font-medium text-left transition-colors hover:bg-red-50"
                    style={{ color: "#ef4444" }}
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
