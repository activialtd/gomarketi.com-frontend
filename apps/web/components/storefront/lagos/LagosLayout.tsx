"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X, Share2, Phone } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { CartDrawer } from "@/components/storefront/CartDrawer";

interface LagosLayoutProps {
  children: React.ReactNode;
  storeName: string;
  primary?: string;
  tagline?: string;
  whatsapp?: string;
  instagram?: string;
  navItems?: Array<{ label: string; url: string }>;
}

export default function LagosLayout({
  children,
  storeName,
  primary = "#C75D3A",
  tagline,
  whatsapp,
  instagram,
  navItems,
}: LagosLayoutProps) {
  const { itemCount } = useCart();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const links = navItems?.length
    ? navItems
    : [{ label: "Shop", url: "/shop" }, { label: "Collections", url: "/collections" }];

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-[#F7F4EE]">

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-white/8 bg-[#0E0E0E]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-6">
          <button onClick={() => setMobileNavOpen(true)} className="p-1 text-white/70 lg:hidden" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="text-[17px] font-semibold tracking-tight text-[#F7F4EE] no-underline"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {storeName}
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {links.map((l) => (
              <Link key={l.label} href={l.url}
                className="text-[12px] font-medium uppercase tracking-[0.1em] text-white/60 no-underline transition-colors hover:text-white">
                {l.label}
              </Link>
            ))}
          </div>

          <button onClick={() => setCartOpen(true)}
            className="flex items-center gap-1.5 border border-white/20 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#F7F4EE] transition-colors hover:border-white/40"
            aria-label="Cart">
            <ShoppingBag className="h-3.5 w-3.5" />
            {itemCount > 0 ? itemCount : "Bag"}
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ─────────────────────────────── */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[280px] bg-[#0E0E0E] p-6 border-r border-white/10">
            <div className="mb-8 flex items-center justify-between">
              <span className="text-[16px] font-semibold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{storeName}</span>
              <button onClick={() => setMobileNavOpen(false)} className="p-1 text-white/50 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <Link key={l.label} href={l.url} onClick={() => setMobileNavOpen(false)}
                  className="px-2 py-3 text-[13px] font-medium uppercase tracking-[0.1em] text-white/70 no-underline border-b border-white/8 hover:text-white">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Page content ─────────────────────────────── */}
      <main>{children}</main>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="border-t border-white/10 bg-[#0A0A0A]">
        <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col sm:flex-row items-start justify-between gap-8">
          <div>
            <p className="text-[17px] font-semibold text-[#F7F4EE]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{storeName}</p>
            {tagline && <p className="mt-2 max-w-[240px] text-[12px] leading-relaxed text-white/45">{tagline}</p>}
            <div className="mt-4 flex gap-3">
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center border border-white/15 text-white/50 transition-colors hover:border-white/40 hover:text-white">
                  <Phone className="h-3.5 w-3.5" />
                </a>
              )}
              {instagram && (
                <a href={`https://instagram.com/${instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center border border-white/15 text-white/50 transition-colors hover:border-white/40 hover:text-white">
                  <Share2 className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-1">Quick links</p>
            {links.map((l) => (
              <Link key={l.label} href={l.url}
                className="text-[12px] text-white/50 no-underline hover:text-white transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>
        <div className="border-t border-white/8 px-6 py-4 text-center">
          <p className="text-[10px] text-white/25">© {new Date().getFullYear()} {storeName} · Powered by GoMarketi</p>
        </div>
      </footer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
