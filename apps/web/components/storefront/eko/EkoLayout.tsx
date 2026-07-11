"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { CartDrawer } from "@/components/storefront/CartDrawer";

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.01" strokeWidth="2.5" />
    </svg>
  );
}
function IconTwitterX() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}
function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function IconTikTok() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.17a8.16 8.16 0 004.77 1.52V7.24a4.85 4.85 0 01-1-.55z" />
    </svg>
  );
}
function IconYouTube() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
    </svg>
  );
}
function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.096.54 4.07 1.487 5.787L0 24l6.39-1.467A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.814 9.814 0 01-5.007-1.37l-.359-.213-3.721.854.87-3.625-.234-.373A9.818 9.818 0 012.182 12C2.182 6.579 6.579 2.182 12 2.182c5.42 0 9.818 4.397 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z" />
    </svg>
  );
}

interface EkoLayoutProps {
  children: React.ReactNode;
  storeName: string;
  slug?: string;
  primary?: string;
  secondary?: string;
  tagline?: string;
  whatsapp?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  email?: string;
  phone?: string;
  address?: string;
  navItems?: Array<{ label: string; url: string }>;
  logoUrl?: string;
  hasCollections?: boolean;
}

export default function EkoLayout({
  children,
  storeName,
  slug = "",
  primary = "#1A7A42",
  secondary = "#0A4D2A",
  tagline,
  whatsapp,
  instagram,
  twitter,
  facebook,
  tiktok,
  youtube,
  email,
  phone,
  address,
  navItems,
  logoUrl,
  hasCollections = false,
}: EkoLayoutProps) {
  const { itemCount } = useCart();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const navLinks = navItems?.length
    ? navItems.map((i) => ({ label: i.label, href: i.url }))
    : [
        { label: "Shop", href: slug ? `/storefront/${slug}/shop` : "/shop" },
        ...(hasCollections ? [{ label: "Collections", href: slug ? `/storefront/${slug}/collections` : "/collections" }] : []),
      ];

  const socialLinks = [
    { href: instagram ? `https://instagram.com/${instagram.replace("@", "")}` : null, icon: <IconInstagram />, label: "Instagram" },
    { href: twitter ? `https://twitter.com/${twitter.replace("@", "")}` : null, icon: <IconTwitterX />, label: "Twitter/X" },
    { href: facebook ? `https://facebook.com/${facebook.replace("@", "")}` : null, icon: <IconFacebook />, label: "Facebook" },
    { href: tiktok ? `https://tiktok.com/@${tiktok.replace("@", "")}` : null, icon: <IconTikTok />, label: "TikTok" },
    { href: youtube ? `https://youtube.com/@${youtube.replace("@", "")}` : null, icon: <IconYouTube />, label: "YouTube" },
  ].filter((s) => s.href);

  const hasContact = !!(email || phone || address || whatsapp);

  return (
    <div className="flex min-h-screen flex-col bg-white antialiased">
      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40" style={{ background: primary }}>
        <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between px-5">
          <button onClick={() => setMobileNavOpen(true)} className="p-1 text-white lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>

          <Link href={slug ? `/storefront/${slug}` : "/"} className="flex items-center no-underline">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="h-9 w-auto max-w-[140px] object-contain" />
            ) : (
              <span className="text-[18px] font-extrabold tracking-tight text-white" style={{ letterSpacing: "-0.3px" }}>
                {storeName}
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="text-[13px] font-medium text-white/80 no-underline transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button className="hidden p-1.5 text-white/90 transition-colors hover:text-white lg:flex" aria-label="Search">
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
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[280px] bg-white p-5">
            <div className="mb-7 flex items-center justify-between">
              {logoUrl ? (
                <img src={logoUrl} alt={storeName} className="h-8 w-auto max-w-[120px] object-contain" />
              ) : (
                <span className="text-[17px] font-extrabold" style={{ color: primary }}>{storeName}</span>
              )}
              <button onClick={() => setMobileNavOpen(false)} className="rounded-full p-1 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="flex flex-col gap-0.5">
              {navLinks.map((link) => (
                <Link key={link.label} href={link.href} onClick={() => setMobileNavOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-[14px] font-semibold text-gray-700 no-underline transition-colors hover:bg-gray-50">
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
      <footer style={{ background: secondary }}>
        <div className="mx-auto max-w-6xl px-5 pt-14 pb-10">
          <div className={`grid gap-10 ${hasContact ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}>

            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              {logoUrl ? (
                <img src={logoUrl} alt={storeName} className="h-10 w-auto max-w-[140px] object-contain brightness-0 invert mb-3" />
              ) : (
                <p className="text-[21px] font-extrabold text-white" style={{ letterSpacing: "-0.4px" }}>{storeName}</p>
              )}
              {tagline && (
                <p className="mt-2.5 text-[12.5px] leading-relaxed max-w-[220px]" style={{ color: "rgba(255,255,255,0.5)" }}>{tagline}</p>
              )}
              {socialLinks.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {socialLinks.map((s) => (
                    <a key={s.label} href={s.href!} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                      className="flex h-8 w-8 items-center justify-center rounded-full transition-all"
                      style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
                      onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.22)"; e.currentTarget.style.color = "#fff"; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>
                      {s.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Quick links */}
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.35)" }}>Shop</p>
              <div className="flex flex-col gap-2.5">
                {navLinks.map((l) => (
                  <Link key={l.label} href={l.href} className="text-[13px] no-underline transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.62)" }}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Policies */}
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.35)" }}>Policies</p>
              <div className="flex flex-col gap-2.5">
                {[{ label: "Shipping", href: "/shipping" }, { label: "Returns & refunds", href: "/returns" }, { label: "Privacy", href: "/privacy" }].map((l) => (
                  <Link key={l.label} href={l.href} className="text-[13px] no-underline transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.62)" }}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            {hasContact && (
              <div>
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.35)" }}>Contact</p>
                <div className="flex flex-col gap-3">
                  {whatsapp && (
                    <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[13px] no-underline hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.62)" }}>
                      <IconWhatsApp className="h-3.5 w-3.5 shrink-0" />
                      WhatsApp
                    </a>
                  )}
                  {email && <a href={`mailto:${email}`} className="text-[13px] no-underline hover:text-white transition-colors truncate" style={{ color: "rgba(255,255,255,0.62)" }}>{email}</a>}
                  {phone && <a href={`tel:${phone}`} className="text-[13px] no-underline hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.62)" }}>{phone}</a>}
                  {address && <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{address}</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t px-5 py-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.28)" }}>
              © {new Date().getFullYear()} {storeName}. All rights reserved.
            </p>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.18)" }}>Powered by GoMarketi</p>
          </div>
        </div>
      </footer>

      {/* ── Floating WhatsApp button ──────────────────────── */}
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full px-4 py-3 shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl"
          style={{ background: "#25D366", color: "#fff", boxShadow: "0 4px 20px rgba(37,211,102,0.4)" }}
        >
          <IconWhatsApp className="h-5 w-5 shrink-0" />
          <span className="hidden text-[12px] font-bold sm:block">Chat with us</span>
        </a>
      )}

      {/* ── Cart drawer ──────────────────────────────────── */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} slug={slug} />
    </div>
  );
}
