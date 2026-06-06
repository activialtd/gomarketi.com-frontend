"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Wallet,
  Megaphone,
  Puzzle,
  Settings,
  ChevronDown,
  ChevronRight,
  Store,
  Zap,
  HelpCircle,
  LogOut,
  Tag,
  Filter,
  RotateCcw,
  UserCheck,
  TrendingUp,
  Globe,
  CreditCard,
  Receipt,
  Building2,
  Layers,
} from "lucide-react";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@gomarket/ui";

// ─── Nav structure ────────────────────────────────────────────────────────────

type NavItem = {
  label: string;
  href?: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: "green" | "red" | "gray";
  children?: NavItem[];
};

type NavSection = {
  title?: string;
  items: NavItem[];
};

const NAV: NavSection[] = [
  {
    title: "Quick Access",
    items: [
      {
        label: "Dashboard",
        href: ROUTES.MERCHANT.OVERVIEW,
        icon: LayoutDashboard,
      },
      {
        label: "Products",
        icon: Package,
        children: [
          {
            label: "All Products",
            href: ROUTES.MERCHANT.PRODUCTS,
            icon: Layers,
          },
          {
            label: "Product Filter",
            href: ROUTES.MERCHANT.PRODUCT_FILTER,
            icon: Filter,
          },
          { label: "Categories", href: ROUTES.MERCHANT.CATEGORIES, icon: Tag },
        ],
      },
      {
        label: "Orders",
        icon: ShoppingCart,
        children: [
          { label: "All Orders", href: ROUTES.MERCHANT.ORDERS, icon: Receipt },
          {
            label: "Abandoned",
            href: ROUTES.MERCHANT.ABANDONED,
            icon: RotateCcw,
          },
        ],
      },
      { label: "Customers", href: ROUTES.MERCHANT.CUSTOMERS, icon: Users },
      { label: "Analytics", href: ROUTES.MERCHANT.ANALYTICS, icon: BarChart3 },
      { label: "GoMarket Wallet", href: ROUTES.MERCHANT.WALLET, icon: Wallet },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Sales & Marketing",
        href: ROUTES.MERCHANT.MARKETING,
        icon: Megaphone,
      },
      { label: "Extensions", href: ROUTES.MERCHANT.EXTENSIONS, icon: Puzzle },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        label: "Payouts",
        href: ROUTES.MERCHANT.PAYOUTS,
        icon: CreditCard,
        badge: "New",
        badgeVariant: "green",
      },
      { label: "Invoices", href: ROUTES.MERCHANT.INVOICES, icon: Receipt },
    ],
  },
  {
    title: "Store Setup",
    items: [
      {
        label: "Store Information",
        href: ROUTES.MERCHANT.STORE_INFO,
        icon: Building2,
      },
      { label: "Customisation", href: ROUTES.MERCHANT.CUSTOMISE, icon: Globe },
      { label: "Staff & Roles", href: ROUTES.MERCHANT.STAFF, icon: UserCheck },
      { label: "More", href: ROUTES.MERCHANT.MORE, icon: Layers },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(["Products", "Orders"]),
  );

  function toggleExpand(label: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

  function isActive(href?: string) {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  }

  function isSectionActive(item: NavItem): boolean {
    if (isActive(item.href)) return true;
    return item.children?.some((c) => isActive(c.href)) ?? false;
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen flex flex-col transition-transform duration-300 ease-in-out",
          "lg:relative lg:translate-x-0 lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{
          width: "240px",
          background: "#ffffff",
          borderRight: "1px solid #e2e8f0",
        }}
      >
        {/* ── Logo ──────────────────────────────────────────── */}
        <div
          className="flex items-center gap-2.5 px-5 shrink-0"
          style={{ height: "60px", borderBottom: "1px solid #f1f5f9" }}
        >
          <div
            className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
            style={{ background: "#1A7A42" }}
          >
            <Store className="w-4 h-4 text-white" />
          </div>
          <span
            className="font-extrabold text-[17px] tracking-tight"
            style={{ color: "#1C1C1C" }}
          >
            GoMarket
          </span>
        </div>

        {/* ── Nav ───────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {NAV.map((section, si) => (
            <div key={si} className={si > 0 ? "mt-1" : ""}>
              {/* Section header */}
              {section.title && (
                <p
                  className="text-[9px] font-extrabold uppercase px-3 pt-4 pb-1.5"
                  style={{ letterSpacing: "0.14em", color: "#94a3b8" }}
                >
                  {section.title}
                </p>
              )}

              {section.items.map((item) => {
                const active = isSectionActive(item);
                const open = expanded.has(item.label);
                const hasChildren = !!item.children?.length;

                return (
                  <div key={item.label}>
                    {/* Top-level item */}
                    {hasChildren ? (
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.label)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[13px] font-medium transition-all text-left group",
                          "hover:bg-[#F0FAF3]",
                        )}
                        style={{
                          color: active ? "#1A7A42" : "#374151",
                          background: active ? "#F0FAF3" : "transparent",
                        }}
                      >
                        <item.icon
                          className="w-[16px] h-[16px] shrink-0 transition-colors"
                          style={{ color: active ? "#1A7A42" : "#6b7280" }}
                        />
                        <span className="flex-1 font-semibold">
                          {item.label}
                        </span>
                        <ChevronDown
                          className="w-3.5 h-3.5 transition-transform duration-200"
                          style={{
                            color: "#9ca3af",
                            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
                          }}
                        />
                      </button>
                    ) : (
                      <Link
                        href={item.href!}
                        onClick={() => onClose()}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[13px] font-semibold transition-all",
                          "hover:bg-[#F0FAF3]",
                        )}
                        style={{
                          color: active ? "#1A7A42" : "#374151",
                          background: active ? "#F0FAF3" : "transparent",
                        }}
                      >
                        <item.icon
                          className="w-[16px] h-[16px] shrink-0"
                          style={{ color: active ? "#1A7A42" : "#6b7280" }}
                        />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <Badge variant={item.badgeVariant}>
                            {item.badge}
                          </Badge>
                        )}
                        {active && !hasChildren && (
                          <div
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: "#1A7A42" }}
                          />
                        )}
                      </Link>
                    )}

                    {/* Children */}
                    {hasChildren && open && (
                      <div
                        className="ml-[28px] mt-0.5 mb-1 space-y-0.5 border-l pl-3"
                        style={{ borderColor: "#e2e8f0" }}
                      >
                        {item.children!.map((child) => {
                          const childActive = isActive(child.href);
                          return (
                            <Link
                              key={child.label}
                              href={child.href!}
                              onClick={() => onClose()}
                              className="flex items-center gap-2 py-1.5 px-2 rounded-[6px] text-[12px] font-medium transition-all hover:bg-[#F0FAF3]"
                              style={{
                                color: childActive ? "#1A7A42" : "#6b7280",
                                background: childActive
                                  ? "rgba(26,122,66,0.06)"
                                  : "transparent",
                              }}
                            >
                              <child.icon className="w-3.5 h-3.5 shrink-0" />
                              {child.label}
                              {childActive && (
                                <div
                                  className="ml-auto w-1.5 h-1.5 rounded-full"
                                  style={{ background: "#1A7A42" }}
                                />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── Bottom actions ─────────────────────────────────── */}
        <div
          className="px-3 py-3 space-y-0.5 shrink-0"
          style={{ borderTop: "1px solid #f1f5f9" }}
        >
          <Link
            href={ROUTES.MERCHANT.SETTINGS}
            className="flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[13px] font-semibold transition-all hover:bg-[#F0FAF3]"
            style={{ color: "#374151" }}
          >
            <Settings className="w-4 h-4" style={{ color: "#6b7280" }} />
            Settings
          </Link>
          <Link
            href={ROUTES.MERCHANT.HELP}
            className="flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[13px] font-semibold transition-all hover:bg-[#F0FAF3]"
            style={{ color: "#374151" }}
          >
            <HelpCircle className="w-4 h-4" style={{ color: "#6b7280" }} />
            Help & Support
          </Link>
          <button
            type="button"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[13px] font-semibold transition-all hover:bg-red-50 text-left"
            style={{ color: "#374151" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#dc2626")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#374151")}
          >
            <LogOut className="w-4 h-4" style={{ color: "#6b7280" }} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────

function Badge({
  children,
  variant = "green",
}: {
  children: React.ReactNode;
  variant?: "green" | "red" | "gray";
}) {
  const styles = {
    green: { background: "#dcfce7", color: "#15803d" },
    red: { background: "#fee2e2", color: "#dc2626" },
    gray: { background: "#f1f5f9", color: "#64748b" },
  };
  return (
    <span
      className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full"
      style={{ letterSpacing: "0.08em", ...styles[variant] }}
    >
      {children}
    </span>
  );
}
