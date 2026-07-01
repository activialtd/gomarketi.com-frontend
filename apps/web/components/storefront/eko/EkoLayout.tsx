"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Search, Menu, X, Share2, Phone } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { CartDrawer } from "@/components/storefront/CartDrawer";

interface EkoLayoutProps {
  children: React.ReactNode;
  storeName: string;
  primary?: string;
  secondary?: string;
  tagline?: string;
  whatsapp?: string;
  instagram?: string;
  navItems?: Array<{ label: string; url: string }>;
}

export default function EkoLayout({
  children,
  storeName,
  primary = "#1A7A42",
  secondary = "#0A4D2A",
  tagline,
  whatsapp,
  instagram,
  navItems,
}: EkoLayoutProps) {
  const { itemCount } = useCart();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const navLinks = navItems?.length
    ? navItems.map((i) => ({ label: i.label, href: i.url }))
    : [{ label: "Shop", href: "/shop" }, { label: "Collections", href: "/collections" }];

  return (
    <div className="flex min-h-screen flex-col bg-white antialiased">
      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40" style={{ background: primary }}>
        <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between px-5">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileNavOpen(true)}
            className="p-1 text-white lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="text-[18px] font-extrabold tracking-tight text-white no-underline"
            style={{ letterSpacing: "-0.3px" }}
          >
            {storeName}
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[13px] font-medium text-white/80 no-underline transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-1.5">
            <button
              className="hidden p-1.5 text-white/90 transition-colors hover:text-white lg:flex"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12px] font-bold text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.18)" }}
              onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.28)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
              aria-label="Open cart"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {itemCount > 0 && <span>{itemCount}</span>}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile nav drawer ───────────────────────────── */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[280px] bg-white p-5">
            <div className="mb-7 flex items-center justify-between">
              <span className="text-[17px] font-extrabold" style={{ color: primary }}>
                {storeName}
              </span>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="flex flex-col gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-[14px] font-semibold text-gray-700 no-underline transition-colors hover:bg-gray-50"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Page content ─────────────────────────────────── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer style={{ background: secondary, color: "rgba(255,255,255,0.85)" }}>
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <p className="text-[18px] font-extrabold text-white" style={{ letterSpacing: "-0.3px" }}>
                {storeName}
              </p>
              {tagline && (
                <p className="mt-1.5 max-w-[260px] text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {tagline}
                </p>
              )}
              <div className="mt-3 flex gap-2.5">
                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                    style={{ background: "rgba(255,255,255,0.12)" }}
                  >
                    <Phone className="h-3.5 w-3.5 text-white" />
                  </a>
                )}
                {instagram && (
                  <a
                    href={`https://instagram.com/${instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                    style={{ background: "rgba(255,255,255,0.12)" }}
                  >
                    <Share2 className="h-3.5 w-3.5 text-white" />
                  </a>
                )}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                Quick links
              </p>
              <div className="flex flex-col gap-1.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-[12.5px] no-underline transition-colors hover:text-white"
                    style={{ color: "rgba(255,255,255,0.65)" }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="border-t px-5 py-4 text-center" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
            © {new Date().getFullYear()} {storeName} · Powered by GoMarket
          </p>
        </div>
      </footer>

      {/* ── Cart drawer ──────────────────────────────────── */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
