"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Menu,
  ChevronDown,
  Globe,
  MapPin,
  ExternalLink,
  Settings,
  LogOut,
  User,
  Zap,
} from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
  storeName?: string;
  storeSlug?: string;
  merchantName?: string;
  userEmail?: string;
  avatarInitials?: string;
  hasNotifications?: boolean;
  trialDaysLeft?: number;
}

export function Header({
  onMenuClick,
  storeName = "My Store",
  storeSlug = "my-store",
  merchantName = "Merchant",
  userEmail,
  avatarInitials,
  hasNotifications = false,
  trialDaysLeft,
}: HeaderProps) {
  const [locationOpen, setLocationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const initials =
    avatarInitials ??
    merchantName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <header
      className="sticky top-0 z-30 flex items-center px-4 lg:px-6 shrink-0"
      style={{
        height: "60px",
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        gap: "12px",
      }}
    >
      {/* ── Hamburger (mobile) ─────────────────────────────── */}
      <button
        type="button"
        onClick={onMenuClick}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-[8px] transition-colors hover:bg-[#F0FAF3]"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" style={{ color: "#374151" }} />
      </button>

      {/* ── Location selector ──────────────────────────────── */}
      <div className="relative hidden sm:block">
        <button
          type="button"
          onClick={() => {
            setLocationOpen((v) => !v);
            setProfileOpen(false);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border text-[13px] font-semibold transition-all hover:bg-[#F0FAF3]"
          style={{ borderColor: "#e2e8f0", color: "#374151" }}
        >
          <MapPin className="w-3.5 h-3.5" style={{ color: "#1A7A42" }} />
          Location: <span style={{ color: "#1A7A42" }}>Headquarters</span>
          <ChevronDown
            className="w-3.5 h-3.5 transition-transform duration-150"
            style={{
              color: "#9ca3af",
              transform: locationOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </button>

        {locationOpen && (
          <div
            className="absolute top-full left-0 mt-1.5 w-52 rounded-[12px] border shadow-lg py-1.5 z-50"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            {["Headquarters", "Lagos Branch", "Abuja Branch"].map((loc, i) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocationOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-left transition-colors hover:bg-[#F0FAF3]"
                style={{ color: i === 0 ? "#1A7A42" : "#374151" }}
              >
                <MapPin
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: i === 0 ? "#1A7A42" : "#9ca3af" }}
                />
                {loc}
                {i === 0 && (
                  <div
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: "#1A7A42" }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Spacer ─────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Right cluster ──────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Trial banner — hidden on small screens */}
        {trialDaysLeft !== undefined && (
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-[8px] border text-[12px] font-medium"
            style={{
              borderColor: "rgba(245,158,11,0.3)",
              background: "rgba(254,243,199,0.6)",
              color: "#92400e",
            }}
          >
            <Zap className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
            <span>
              Free trial · <strong>{trialDaysLeft} days left</strong>
            </span>
          </div>
        )}

        {/* View Store */}
        <Link
          href={`https://${storeSlug}.gomarketi.com`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[13px] font-bold transition-all active:scale-[0.98]"
          style={{
            background: "#1A7A42",
            color: "#fff",
            boxShadow: "0 2px 8px rgba(26,122,66,0.25)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#239452")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#1A7A42")}
        >
          <Globe className="w-3.5 h-3.5" />
          View Store
          <ExternalLink className="w-3 h-3 opacity-70" />
        </Link>

        {/* Notification bell */}
        <button
          type="button"
          className="relative flex items-center justify-center w-9 h-9 rounded-[8px] border transition-colors hover:bg-[#F0FAF3]"
          style={{ borderColor: "#e2e8f0" }}
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" style={{ color: "#374151" }} />
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
            onClick={() => {
              setProfileOpen((v) => !v);
              setLocationOpen(false);
            }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-[10px] border transition-colors hover:bg-[#F0FAF3]"
            style={{ borderColor: "#e2e8f0" }}
          >
            {/* Avatar */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white shrink-0"
              style={{ background: "#1A7A42" }}
            >
              {initials}
            </div>
            <span
              className="hidden sm:block text-[13px] font-semibold max-w-[110px] truncate"
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
            <div
              className="absolute top-full right-0 mt-1.5 w-56 rounded-[12px] border shadow-lg overflow-hidden z-50"
              style={{ background: "#fff", borderColor: "#e2e8f0" }}
            >
              {/* Profile header */}
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: "#f1f5f9" }}
              >
                <p
                  className="text-[13px] font-bold truncate"
                  style={{ color: "#1C1C1C" }}
                >
                  {merchantName}
                </p>
                <p
                  className="text-[11px] truncate"
                  style={{ color: "#6b7280" }}
                >
                  {userEmail ?? storeName}
                </p>
              </div>

              <div className="py-1.5">
                {[
                  { icon: User, label: "Profile" },
                  { icon: Settings, label: "Account Settings" },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-left transition-colors hover:bg-[#F0FAF3]"
                    style={{ color: "#374151" }}
                  >
                    <Icon className="w-4 h-4" style={{ color: "#9ca3af" }} />
                    {label}
                  </button>
                ))}
              </div>

              <div
                className="py-1.5 border-t"
                style={{ borderColor: "#f1f5f9" }}
              >
                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-left transition-colors hover:bg-red-50"
                  style={{ color: "#dc2626" }}
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
