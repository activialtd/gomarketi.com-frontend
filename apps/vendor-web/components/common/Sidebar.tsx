"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, ChevronDown, Store, HelpCircle, LogOut, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@gomarket/ui";
import { NAV, NavItem } from "@/lib/config/sidebar";
import { useAuthStore, type StaffRole } from "@/store/useAuthStore";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut?: () => void;
}

const ROLE_LABELS: Record<StaffRole, string> = {
  manager: "Manager",
  fulfillment: "Fulfillment",
  support: "Support",
  analytics_only: "Analytics",
};

function canSeeItem(item: NavItem, staffRole: StaffRole | null): boolean {
  if (staffRole === null) return true; // vendor — sees everything
  if (!item.allowedRoles) return false; // vendor-only section
  return item.allowedRoles.includes(staffRole);
}

export function Sidebar({ isOpen, onClose, onSignOut }: SidebarProps) {
  const pathname = usePathname();
  const staffRole = useAuthStore((s) => s.staffRole);
  const user = useAuthStore((s) => s.user);
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

  function isActive(href?: string, exact?: boolean): boolean {
    if (!href) return false;
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  function isSectionActive(item: NavItem): boolean {
    if (!item.children?.length) return isActive(item.href, item.exact);
    return item.children.some((c) => isActive(c.href, c.exact));
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/50 backdrop-blur-sm"
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
        style={{ width: "248px", background: "#0A2E1A" }}
      >
        {/* ── Logo ──────────────────────────────────────────── */}
        <div
          className="flex items-center gap-3 px-5 shrink-0"
          style={{
            height: "64px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0"
            style={{ background: staffRole ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.12)" }}
          >
            {staffRole
              ? <ShieldCheck className="w-[17px] h-[17px]" style={{ color: "#c4b5fd" }} />
              : <Store className="w-[17px] h-[17px]" style={{ color: "#fff" }} />}
          </div>
          <div>
            <p className="text-[15px] font-extrabold tracking-tight text-white leading-none">
              GoMarket
            </p>
            <p className="text-[10px] font-medium mt-0.5" style={{ color: staffRole ? "#c4b5fd" : "rgba(255,255,255,0.4)" }}>
              {staffRole ? `${ROLE_LABELS[staffRole]} · Staff` : "Vendor dashboard"}
            </p>
          </div>
        </div>

        {/* ── Staff identity banner ─────────────────────────── */}
        {staffRole && user && (
          <div style={{ margin: "0 12px 0", padding: "10px 12px", borderRadius: "10px", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)", marginTop: "12px" }}>
            <p style={{ margin: 0, fontSize: "10px", fontWeight: 700, color: "#c4b5fd", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Signed in as staff
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email ?? "Staff member"}
            </p>
          </div>
        )}

        {/* ── Nav ───────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV.map((section, si) => {
            const visibleItems = section.items.filter((item) => canSeeItem(item, staffRole));
            if (visibleItems.length === 0) return null;
            return (
            <div key={si} className={si > 0 ? "pt-4" : ""}>
              {/* Section header */}
              {section.title && (
                <p
                  className="text-[9.5px] font-bold uppercase px-3 pb-2"
                  style={{
                    letterSpacing: "0.16em",
                    color: "rgba(255,255,255,0.28)",
                  }}
                >
                  {section.title}
                </p>
              )}

              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const sectionActive = isSectionActive(item);
                  const open = expanded.has(item.label);
                  const hasChildren = !!item.children?.length;

                  return (
                    <div
                      key={item.label}
                      data-tour={item.label.toLowerCase().replace(/\s+/g, "-")}
                    >
                      {/* Top-level item */}
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.label)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[13px] font-semibold transition-all text-left"
                          style={{
                            color: sectionActive
                              ? "rgba(255,255,255,0.95)"
                              : "rgba(255,255,255,0.55)",
                            background: sectionActive
                              ? "rgba(255,255,255,0.07)"
                              : "transparent",
                          }}
                          onMouseOver={(e) => {
                            if (!sectionActive)
                              e.currentTarget.style.background =
                                "rgba(255,255,255,0.05)";
                          }}
                          onMouseOut={(e) => {
                            if (!sectionActive)
                              e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <item.icon
                            className="w-[15px] h-[15px] shrink-0"
                            style={{
                              color: sectionActive
                                ? "rgba(255,255,255,0.9)"
                                : "rgba(255,255,255,0.4)",
                            }}
                          />
                          <span className="flex-1">{item.label}</span>
                          <ChevronDown
                            className="w-3.5 h-3.5 transition-transform duration-200"
                            style={{
                              color: "rgba(255,255,255,0.3)",
                              transform: open
                                ? "rotate(0deg)"
                                : "rotate(-90deg)",
                            }}
                          />
                        </button>
                      ) : (
                        <Link
                          href={item.href!}
                          onClick={onClose}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[13px] font-semibold transition-all"
                          style={{
                            color: sectionActive
                              ? "#0A2E1A"
                              : "rgba(255,255,255,0.55)",
                            background: sectionActive
                              ? "#F0FAF3"
                              : "transparent",
                          }}
                          onMouseOver={(e) => {
                            if (!sectionActive) {
                              e.currentTarget.style.color =
                                "rgba(255,255,255,0.85)";
                              e.currentTarget.style.background =
                                "rgba(255,255,255,0.05)";
                            }
                          }}
                          onMouseOut={(e) => {
                            if (!sectionActive) {
                              e.currentTarget.style.color =
                                "rgba(255,255,255,0.55)";
                              e.currentTarget.style.background = "transparent";
                            }
                          }}
                        >
                          <item.icon
                            className="w-[15px] h-[15px] shrink-0"
                            style={{
                              color: sectionActive
                                ? "#1A7A42"
                                : "rgba(255,255,255,0.4)",
                            }}
                          />
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <Badge variant={item.badgeVariant}>
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      )}

                      {/* Children */}
                      {hasChildren && open && (
                        <div
                          className="ml-[22px] mt-0.5 mb-1 space-y-0.5 border-l pl-3"
                          style={{ borderColor: "rgba(255,255,255,0.08)" }}
                        >
                          {item.children!.map((child) => {
                            const childActive = isActive(
                              child.href,
                              child.exact,
                            );
                            return (
                              <Link
                                key={child.label}
                                href={child.href!}
                                onClick={onClose}
                                className="flex items-center gap-2 py-1.5 px-2 rounded-[6px] text-[12px] font-medium transition-all"
                                style={{
                                  color: childActive
                                    ? "#0A2E1A"
                                    : "rgba(255,255,255,0.45)",
                                  background: childActive
                                    ? "#F0FAF3"
                                    : "transparent",
                                }}
                                onMouseOver={(e) => {
                                  if (!childActive) {
                                    e.currentTarget.style.color =
                                      "rgba(255,255,255,0.75)";
                                    e.currentTarget.style.background =
                                      "rgba(255,255,255,0.05)";
                                  }
                                }}
                                onMouseOut={(e) => {
                                  if (!childActive) {
                                    e.currentTarget.style.color =
                                      "rgba(255,255,255,0.45)";
                                    e.currentTarget.style.background =
                                      "transparent";
                                  }
                                }}
                              >
                                <child.icon
                                  className="w-3.5 h-3.5 shrink-0"
                                  style={{
                                    color: childActive
                                      ? "#1A7A42"
                                      : "rgba(255,255,255,0.3)",
                                  }}
                                />
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
          })}
        </nav>

        {/* ── Bottom actions ─────────────────────────────────── */}
        <div
          className="px-3 pb-4 pt-3 space-y-0.5 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          {[
            // Settings is vendor-only — staff manage via store owner
            ...(!staffRole ? [{ href: ROUTES.MERCHANT.SETTINGS, Icon: Settings, label: "Settings" }] : []),
            {
              href: ROUTES.MERCHANT.HELP,
              Icon: HelpCircle,
              label: "Help & Support",
            },
          ].map(({ href, Icon, label }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[13px] font-medium transition-all"
              style={{ color: "rgba(255,255,255,0.45)" }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Icon
                className="w-4 h-4 shrink-0"
                style={{ color: "rgba(255,255,255,0.3)" }}
              />
              {label}
            </Link>
          ))}

          <button
            type="button"
            onClick={onSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[13px] font-medium transition-all text-left"
            style={{ color: "rgba(255,255,255,0.45)" }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "#fca5a5";
              e.currentTarget.style.background = "rgba(239,68,68,0.08)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.45)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogOut
              className="w-4 h-4 shrink-0"
              style={{ color: "rgba(255,255,255,0.3)" }}
            />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({
  children,
  variant = "green",
}: {
  children: React.ReactNode;
  variant?: "green" | "red" | "gray";
}) {
  const styles = {
    green: { background: "rgba(34,197,94,0.18)", color: "#86efac" },
    red: { background: "rgba(239,68,68,0.18)", color: "#fca5a5" },
    gray: {
      background: "rgba(255,255,255,0.1)",
      color: "rgba(255,255,255,0.5)",
    },
  };
  return (
    <span
      className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
      style={{ letterSpacing: "0.08em", ...styles[variant] }}
    >
      {children}
    </span>
  );
}
