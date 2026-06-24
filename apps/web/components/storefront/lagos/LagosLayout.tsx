"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Menu,
  X,
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
import { InstagramIcon, LinkedInIcon, TwitterIcon } from "@/lib/icons";

export default function LagosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { itemCount } = useCart();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const navLinks = [
    { label: "Shop", href: "/shop" },
    ...COLLECTIONS.slice(0, 3).map((col) => ({
      label: col.name,
      href: `/collections/${col.slug}`,
    })),
  ];

  const socials = [
    {
      key: "instagram",
      Icon: InstagramIcon,
      handle: STORE_CONFIG.social.instagram,
      href: `https://instagram.com/${STORE_CONFIG.social.instagram?.replace("@", "")}`,
    },
    {
      key: "twitter",
      Icon: TwitterIcon,
      handle: STORE_CONFIG.social.twitter,
      href: `https://x.com/${STORE_CONFIG.social.twitter?.replace("@", "")}`,
    },
    {
      key: "linkedin",
      Icon: LinkedInIcon,
      handle: STORE_CONFIG.social.facebook,
      href: `https://linkedin.com/company/${STORE_CONFIG.social.facebook}`,
    },
  ].filter((s) => s.handle);

  return (
    <div
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      className="flex min-h-screen flex-col bg-[#0E0E0E] text-[#F7F4EE] antialiased"
    >
      {/* ── Nav — thin rule, no fill ─────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#0E0E0E]/90 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="p-1 text-[#F7F4EE] lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Wordmark — tall serif, generous tracking */}
          <Link
            href="/"
            className="font-serif text-[22px] font-semibold uppercase tracking-[0.08em] text-[#F7F4EE] no-underline"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {STORE_CONFIG.storeName}
          </Link>

          <div className="hidden items-center gap-9 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/55 no-underline transition-colors hover:text-[#C75D3A]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <button
            onClick={() => setCartOpen(true)}
            className="group flex items-center gap-2 border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#F7F4EE] transition-colors hover:border-[#C75D3A] hover:text-[#C75D3A]"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {itemCount > 0 ? `(${itemCount})` : "Bag"}
          </button>
        </div>
      </nav>

      {/* ── Mobile nav drawer ───────────────────────────── */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[300px] bg-[#0E0E0E] p-6 [animation:slideIn_0.25s_ease_forwards]">
            <div className="mb-10 flex items-center justify-between">
              <span
                className="font-serif text-[18px] uppercase tracking-[0.06em] text-[#F7F4EE]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {STORE_CONFIG.storeName}
              </span>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="p-1 text-white/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-5">
              {navLinks.map((link, i) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-baseline gap-3 text-[15px] font-medium text-white/85 no-underline transition-colors hover:text-[#C75D3A]"
                >
                  <span className="text-[10px] text-white/30">0{i + 1}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">{children}</main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-white/10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-16 sm:grid-cols-3">
          <div>
            <p
              className="text-[24px] font-semibold uppercase tracking-[0.04em] text-[#F7F4EE]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {STORE_CONFIG.storeName}
            </p>
            <p className="mt-3 max-w-[260px] text-[12.5px] leading-relaxed text-white/45">
              {STORE_CONFIG.tagline}
            </p>
            {socials.length > 0 && (
              <div className="mt-6 flex gap-3">
                {socials.map(({ key, Icon, href }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/60 transition-colors hover:border-[#C75D3A] hover:text-[#C75D3A]"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
              Contact
            </p>
            <div className="flex flex-col gap-2.5 text-[12.5px] text-white/55">
              <a
                href={`tel:${STORE_CONFIG.contact.phone}`}
                className="flex items-center gap-2.5 no-underline transition-colors hover:text-[#C75D3A]"
              >
                <Phone className="h-3.5 w-3.5 shrink-0" />{" "}
                {STORE_CONFIG.contact.phone}
              </a>
              <a
                href={`mailto:${STORE_CONFIG.contact.email}`}
                className="flex items-center gap-2.5 no-underline transition-colors hover:text-[#C75D3A]"
              >
                <Mail className="h-3.5 w-3.5 shrink-0" />{" "}
                {STORE_CONFIG.contact.email}
              </a>
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  {STORE_CONFIG.contact.address}, {STORE_CONFIG.contact.city},{" "}
                  {STORE_CONFIG.contact.state}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-3.5 w-3.5 shrink-0" />{" "}
                {STORE_CONFIG.contact.openingHours}
              </div>
            </div>
          </div>

          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
              Returns
            </p>
            <p className="text-[12.5px] leading-relaxed text-white/50">
              {STORE_CONFIG.returnPolicy}
            </p>
            <Link
              href="/shop"
              className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#C75D3A] no-underline hover:underline"
            >
              Start shopping <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 px-6 py-5 text-center">
          <p className="text-[10.5px] uppercase tracking-[0.1em] text-white/25">
            © {new Date().getFullYear()} {STORE_CONFIG.storeName} · Powered by
            GoMarket
          </p>
        </div>
      </footer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
