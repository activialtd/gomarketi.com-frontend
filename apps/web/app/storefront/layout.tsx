"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  // Instagram,
  // Twitter,
  // Facebook,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { STORE_CONFIG } from "@/lib/storeConfig";
import { useCart } from "@/lib/cartContext";
import { COLLECTIONS } from "@/lib/data/products";
import { CartDrawer } from "@/components/storefront/CartDrawer";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { itemCount } = useCart();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const navLinks = [
    { label: "Shop all", href: "/shop" },
    ...COLLECTIONS.slice(0, 3).map((col) => ({
      label: col.name,
      href: `/collections/${col.slug}`,
    })),
  ];

  const socialLinks = [
    {
      key: "instagram",
      Icon: Phone,
      handle: STORE_CONFIG.social.instagram,
      href: `https://instagram.com/${STORE_CONFIG.social.instagram?.replace("@", "")}`,
    },
    {
      key: "twitter",
      Icon: Phone,
      handle: STORE_CONFIG.social.twitter,
      href: `https://x.com/${STORE_CONFIG.social.twitter?.replace("@", "")}`,
    },
    {
      key: "facebook",
      Icon: Phone,
      handle: STORE_CONFIG.social.facebook,
      href: `https://facebook.com/${STORE_CONFIG.social.facebook}`,
    },
  ].filter((s) => s.handle);

  return (
    <div
      style={{ fontFamily: STORE_CONFIG.fontFamily }}
      className="flex min-h-screen flex-col bg-white text-[var(--store-text)] antialiased"
    >
      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-[var(--store-primary)]">
        <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between px-5">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileNavOpen(true)}
            className="p-1 text-white lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo — the one place the store name gets real typographic weight */}
          <Link
            href="/"
            className="font-serif text-[20px] font-bold italic tracking-tight text-white no-underline"
          >
            {STORE_CONFIG.storeName}
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
              className="flex items-center gap-1.5 rounded-lg bg-white/18 px-3.5 py-2 text-[12px] font-bold text-white transition-colors hover:bg-white/25"
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
          <div className="absolute left-0 top-0 h-full w-[280px] bg-white p-5 [animation:slideIn_0.25s_ease_forwards]">
            <div className="mb-7 flex items-center justify-between">
              <span className="font-serif text-[17px] font-bold italic text-[var(--store-primary)]">
                {STORE_CONFIG.storeName}
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
                  className="rounded-lg px-3 py-2.5 text-[14px] font-semibold text-gray-700 no-underline transition-colors hover:bg-[var(--store-bg)] hover:text-[var(--store-primary)]"
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
      <footer className="bg-[var(--store-secondary)] text-white/85">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 py-14 sm:grid-cols-3">
          {/* About */}
          <div>
            <p className="font-serif text-[19px] font-bold italic text-white">
              {STORE_CONFIG.storeName}
            </p>
            <p className="mt-2.5 max-w-[240px] text-[12px] leading-relaxed text-white/65">
              {STORE_CONFIG.tagline}
            </p>
            {socialLinks.length > 0 && (
              <div className="mt-4 flex gap-2.5">
                {socialLinks.map(({ key, Icon, href }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/75 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Contact */}
          <div>
            <p className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">
              Contact
            </p>
            <div className="flex flex-col gap-2.5 text-[12.5px]">
              <a
                href={`tel:${STORE_CONFIG.contact.phone}`}
                className="flex items-center gap-2.5 text-white/75 no-underline transition-colors hover:text-white"
              >
                <Phone className="h-3.5 w-3.5 shrink-0" />{" "}
                {STORE_CONFIG.contact.phone}
              </a>
              <a
                href={`mailto:${STORE_CONFIG.contact.email}`}
                className="flex items-center gap-2.5 text-white/75 no-underline transition-colors hover:text-white"
              >
                <Mail className="h-3.5 w-3.5 shrink-0" />{" "}
                {STORE_CONFIG.contact.email}
              </a>
              <div className="flex items-start gap-2.5 text-white/75">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  {STORE_CONFIG.contact.address}, {STORE_CONFIG.contact.city},{" "}
                  {STORE_CONFIG.contact.state}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-white/75">
                <Clock className="h-3.5 w-3.5 shrink-0" />{" "}
                {STORE_CONFIG.contact.openingHours}
              </div>
            </div>
          </div>

          {/* Policy */}
          <div>
            <p className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">
              Returns & refunds
            </p>
            <p className="text-[12.5px] leading-relaxed text-white/70">
              {STORE_CONFIG.returnPolicy}
            </p>
            <Link
              href="/shop"
              className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-white no-underline hover:underline"
            >
              Start shopping <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 px-5 py-4 text-center">
          <p className="text-[11px] text-white/40">
            © {new Date().getFullYear()} {STORE_CONFIG.storeName} · Powered by
            GoMarket
          </p>
        </div>
      </footer>

      {/* ── Cart drawer ──────────────────────────────────── */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
