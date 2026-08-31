"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  Ticket,
  ShieldCheck,
  LogOut,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { useAuthStore, roleAtLeast } from "@/store/useAuthStore";
import type { AdminRole } from "@gomarket/api-client";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  comingSoon?: boolean;
}

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/vendors", label: "Vendors", icon: Store },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/errors", label: "Errors", icon: AlertTriangle },
  { href: "/tickets", label: "Tickets", icon: Ticket, comingSoon: true },
];

const ROLE_LABEL: Record<AdminRole, string> = {
  agent: "Agent",
  supervisor: "Supervisor",
  super_admin: "Super Admin",
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, clearAuth } = useAuthStore();

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  }

  const initials = (admin?.full_name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside
      className="flex h-screen w-[240px] shrink-0 flex-col"
      style={{ background: "var(--sidebar-bg)" }}
    >
      {/* Logo */}
      <div
        className="flex h-16 shrink-0 items-center gap-2.5 px-5"
        style={{ borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-[9px]"
          style={{ background: "var(--sidebar-accent-soft)" }}
        >
          <Sparkles className="h-[16px] w-[16px]" style={{ color: "var(--sidebar-accent)" }} />
        </div>
        <div>
          <p className="text-[14px] font-extrabold leading-none text-white">GoMarketi</p>
          <p
            className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: "var(--sidebar-fg)" }}
          >
            Admin Center
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        <p
          className="px-3 pb-2 text-[9.5px] font-bold uppercase tracking-[0.16em]"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          Operations
        </p>
        {NAV.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          if (item.comingSoon) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-[13px] font-semibold"
                style={{ color: "rgba(255,255,255,0.28)", cursor: "not-allowed" }}
                title="Coming soon"
              >
                <Icon className="h-[15px] w-[15px] shrink-0" />
                <span className="flex-1">{item.label}</span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
                >
                  Soon
                </span>
              </div>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-[13px] font-semibold transition-colors"
              style={{
                color: active ? "var(--sidebar-fg-active)" : "var(--sidebar-fg)",
                background: active ? "var(--sidebar-accent-soft)" : "transparent",
              }}
            >
              <Icon
                className="h-[15px] w-[15px] shrink-0"
                style={{ color: active ? "var(--sidebar-accent)" : "rgba(255,255,255,0.4)" }}
              />
              {item.label}
            </Link>
          );
        })}

        {admin && roleAtLeast(admin.role, "super_admin") && (
          <>
            <p
              className="px-3 pb-2 pt-4 text-[9.5px] font-bold uppercase tracking-[0.16em]"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              Administration
            </p>
            <div
              className="flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-[13px] font-semibold"
              style={{ color: "rgba(255,255,255,0.28)", cursor: "not-allowed" }}
              title="Coming soon"
            >
              <ShieldCheck className="h-[15px] w-[15px] shrink-0" />
              <span className="flex-1">Admin users</span>
              <span
                className="rounded-full px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
              >
                Soon
              </span>
            </div>
          </>
        )}
      </nav>

      {/* Identity + sign out */}
      <div className="shrink-0 px-3 pb-4 pt-3" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
        <div className="mb-1 flex items-center gap-2.5 rounded-[8px] px-2 py-2">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold"
            style={{ background: "var(--sidebar-accent-soft)", color: "var(--sidebar-accent)" }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-semibold text-white">{admin?.full_name}</p>
            <p className="text-[10.5px] font-medium" style={{ color: "var(--sidebar-fg)" }}>
              {admin ? ROLE_LABEL[admin.role] : ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            clearAuth();
            router.push("/login");
          }}
          className="flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2 text-[12.5px] font-semibold transition-colors"
          style={{ color: "var(--sidebar-fg)" }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = "#fca5a5";
            e.currentTarget.style.background = "rgba(239,68,68,0.08)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "var(--sidebar-fg)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <LogOut className="h-[15px] w-[15px] shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
