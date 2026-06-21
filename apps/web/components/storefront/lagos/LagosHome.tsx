"use client";

import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { STORE_CONFIG } from "@/lib/storeConfig";
import { PRODUCTS, COLLECTIONS } from "@/lib/data/products";
import { LagosProductCard } from "./LagosProductCard";

export default function LagosHome() {
  const featured = PRODUCTS.filter(
    (p) => p.featured && p.status === "active",
  ).slice(0, 7);
  const displayProducts =
    featured.length >= 5
      ? featured
      : PRODUCTS.filter((p) => p.status === "active").slice(0, 7);

  return (
    <div className="bg-[#0E0E0E] text-[#F7F4EE]">
      {/* ── Hero — asymmetric split, big serif type vs. full-bleed image ── */}
      <section className="relative mx-auto grid max-w-7xl grid-cols-1 gap-0 px-6 pb-0 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch lg:gap-10 lg:pt-16">
        <div className="flex flex-col justify-center [animation:fadeUp_0.7s_ease_forwards]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#C75D3A]">
            {STORE_CONFIG.hero.eyebrow} — Lookbook
          </p>
          <h1
            className="mt-5 text-[clamp(2.6rem,7vw,5rem)] font-semibold leading-[0.95] tracking-tight text-[#F7F4EE]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {STORE_CONFIG.hero.headline}
          </h1>
          <p className="mt-6 max-w-md text-[14.5px] leading-relaxed text-white/55">
            {STORE_CONFIG.hero.subheadline}
          </p>
          <div className="mt-9 flex items-center gap-5">
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 border border-[#F7F4EE] px-7 py-3.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#F7F4EE] no-underline transition-colors hover:bg-[#F7F4EE] hover:text-[#0E0E0E]"
            >
              Explore the edit
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <span className="text-[11px] text-white/35">
              {PRODUCTS.length} pieces · {COLLECTIONS.length} collections
            </span>
          </div>
        </div>

        {/* Full-bleed hero image with frame-line + look number, the section's signature device */}
        <div className="relative mt-10 aspect-[4/5] overflow-hidden lg:mt-0 [animation:fadeUp_0.8s_ease_forwards] [animation-delay:140ms]">
          <img
            src={STORE_CONFIG.hero.image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-[1.4s] ease-out hover:scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-3 border border-white/25" />
          <div className="absolute bottom-5 left-5 flex items-baseline gap-2">
            <span
              className="text-[40px] font-semibold leading-none text-white/90"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              01
            </span>
            <span className="text-[10px] uppercase tracking-[0.14em] text-white/60">
              Look of the season
            </span>
          </div>
        </div>
      </section>

      {/* ── Editorial strip — thin rule divider with a stat, not a value-prop grid ── */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-y border-white/10 py-6 sm:flex-row">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
            {STORE_CONFIG.returnPolicy.split(".")[0]} · Nationwide delivery ·
            Verified Paystack checkout
          </p>
          <a
            href={`https://wa.me/${STORE_CONFIG.contact.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#C75D3A] no-underline hover:underline"
          >
            <MessageCircle className="h-3.5 w-3.5" /> Talk to us
          </a>
        </div>
      </section>

      {/* ── Collections — large editorial tiles, asymmetric pairing ── */}
      {COLLECTIONS.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-8 flex items-baseline justify-between">
            <h2
              className="text-[28px] font-semibold tracking-tight text-[#F7F4EE]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              The collections
            </h2>
            <Link
              href="/shop"
              className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/50 no-underline hover:text-[#C75D3A]"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {COLLECTIONS.slice(0, 3).map((col, i) => (
              <Link
                key={col.id}
                href={`/collections/${col.slug}`}
                className={`group relative block overflow-hidden opacity-0 [animation-fill-mode:forwards] ${
                  i === 0
                    ? "sm:col-span-2 sm:row-span-2 aspect-[4/3] sm:aspect-auto sm:h-full"
                    : "aspect-[4/3]"
                }`}
                style={{
                  animation: `fadeUp 0.6s ease forwards ${i * 100}ms`,
                  minHeight: i === 0 ? "420px" : undefined,
                }}
              >
                <img
                  src={col.coverImage}
                  alt={col.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p
                    className="text-[22px] font-semibold leading-tight text-white"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {col.name}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-white/60">
                    {col.productIds.length} pieces
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Masonry product grid — mixed heights, moodboard feel ── */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-8 flex items-baseline justify-between">
          <h2
            className="text-[28px] font-semibold tracking-tight text-[#F7F4EE]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            New arrivals
          </h2>
          <Link
            href="/shop"
            className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/50 no-underline hover:text-[#C75D3A]"
          >
            Shop all →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {displayProducts.map((product, i) => (
            <div
              key={product.id}
              className={i % 5 === 0 ? "lg:row-span-2" : ""}
            >
              <LagosProductCard
                product={product}
                index={i}
                tall={i % 5 === 0}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Closing band ─────────────────────────────────── */}
      <section className="border-t border-white/10 px-6 py-20 text-center">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
          Questions before you order?
        </p>
        <h3
          className="mx-auto mt-3 max-w-md text-[26px] font-semibold leading-tight text-[#F7F4EE]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {STORE_CONFIG.storeName} replies on WhatsApp, usually within minutes.
        </h3>
        <a
          href={`https://wa.me/${STORE_CONFIG.contact.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex items-center gap-2 bg-[#C75D3A] px-7 py-3.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-white no-underline transition-transform duration-200 hover:-translate-y-0.5"
        >
          <MessageCircle className="h-4 w-4" /> Message us
        </a>
      </section>
    </div>
  );
}
