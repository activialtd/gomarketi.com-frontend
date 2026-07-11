"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
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

interface LagosLayoutProps {
  children: React.ReactNode;
  storeName: string;
  slug?: string;
  primary?: string;
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

export default function LagosLayout({
  children,
  storeName,
  slug = "",
  primary = "#C75D3A",
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
}: LagosLayoutProps) {
  const { itemCount } = useCart();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const links = navItems?.length
    ? navItems
    : [
        { label: "Shop", url: slug ? `/storefront/${slug}/shop` : "/shop" },
        ...(hasCollections ? [{ label: "Collections", url: slug ? `/storefront/${slug}/collections` : "/collections" }] : []),
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
    <div className="min-h-screen bg-[#0E0E0E] text-[#F7F4EE]">

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-white/8 bg-[#0E0E0E]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-6">
          <button onClick={() => setMobileNavOpen(true)} className="p-1 text-white/70 lg:hidden" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>

          <Link href={slug ? `/storefront/${slug}` : "/"} className="flex items-center no-underline">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="h-9 w-auto max-w-[140px] object-contain brightness-0 invert" />
            ) : (
              <span className="text-[17px] font-semibold tracking-tight text-[#F7F4EE]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {storeName}
              </span>
            )}
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
          <div className="absolute left-0 top-0 h-full w-[280px] border-r border-white/10 bg-[#0E0E0E] p-6">
            <div className="mb-8 flex items-center justify-between">
              {logoUrl ? (
                <img src={logoUrl} alt={storeName} className="h-8 w-auto max-w-[120px] object-contain brightness-0 invert" />
              ) : (
                <span className="text-[16px] font-semibold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{storeName}</span>
              )}
              <button onClick={() => setMobileNavOpen(false)} className="p-1 text-white/50 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <Link key={l.label} href={l.url} onClick={() => setMobileNavOpen(false)}
                  className="border-b border-white/8 px-2 py-3 text-[13px] font-medium uppercase tracking-[0.1em] text-white/70 no-underline hover:text-white">
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
      <footer className="bg-[#080808]">
        <div className="mx-auto max-w-7xl">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[2fr_1fr_1fr_1fr]">

            {/* Brand */}
            <div>
              {logoUrl ? (
                <img src={logoUrl} alt={storeName} className="h-10 w-auto max-w-[140px] object-contain brightness-0 invert mb-4" />
              ) : (
                <p className="text-[24px] font-semibold text-[#F7F4EE] leading-none"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {storeName}
                </p>
              )}
              {tagline && (
                <p className="mt-3 max-w-[260px] text-[13px] leading-relaxed text-white/35">{tagline}</p>
              )}
              {socialLinks.length > 0 && (
                <div className="mt-6 flex gap-3">
                  {socialLinks.map((s) => (
                    <a key={s.label} href={s.href!} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                      className="flex h-9 w-9 items-center justify-center border border-white/12 text-white/35 transition-all hover:border-white/30 hover:text-white/75">
                      {s.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Explore */}
            <div>
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/22">Explore</p>
              <div className="flex flex-col gap-3">
                {links.map((l) => (
                  <Link key={l.label} href={l.url} className="text-[13px] text-white/40 no-underline transition-colors hover:text-white/75">{l.label}</Link>
                ))}
              </div>
            </div>

            {/* Policies */}
            <div>
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/22">Legal</p>
              <div className="flex flex-col gap-3">
                {[{ label: "Shipping", href: "/shipping" }, { label: "Returns", href: "/returns" }, { label: "Privacy", href: "/privacy" }].map((l) => (
                  <Link key={l.label} href={l.href} className="text-[13px] text-white/40 no-underline transition-colors hover:text-white/75">{l.label}</Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/22">Contact</p>
              <div className="flex flex-col gap-3">
                {whatsapp && (
                  <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[13px] text-white/40 no-underline transition-colors hover:text-white/75">
                    <IconWhatsApp className="h-3.5 w-3.5 shrink-0" />
                    WhatsApp
                  </a>
                )}
                {email && <a href={`mailto:${email}`} className="text-[13px] text-white/40 no-underline transition-colors hover:text-white/75 truncate">{email}</a>}
                {phone && <a href={`tel:${phone}`} className="text-[13px] text-white/40 no-underline transition-colors hover:text-white/75">{phone}</a>}
                {address && <p className="text-[13px] leading-relaxed text-white/28">{address}</p>}
                {!hasContact && <p className="text-[13px] text-white/25">—</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/6 px-6 py-5">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <p className="text-[10px] text-white/18">© {new Date().getFullYear()} {storeName}</p>
            <p className="text-[10px] text-white/12">Powered by GoMarketi</p>
          </div>
        </div>
      </footer>

      {/* ── Floating WhatsApp — Lagos: minimal square pill ── */}
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center transition-all duration-200 hover:scale-105"
          style={{ background: "#25D366", boxShadow: "0 4px 24px rgba(37,211,102,0.3)" }}
        >
          <IconWhatsApp className="h-6 w-6 text-white" />
        </a>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} slug={slug} />
    </div>
  );
}
