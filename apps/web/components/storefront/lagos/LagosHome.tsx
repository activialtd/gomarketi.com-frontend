"use client";

import Link from "next/link";
import { ArrowUpRight, MessageCircle, Package } from "lucide-react";
import { LagosProductCard } from "./LagosProductCard";
import LagosLayout from "./LagosLayout";
import type { StoreData, ThemeConfig, StorefrontProduct } from "@/app/storefront/[slug]/page";

interface Props {
  store?: StoreData;
  themeConfig?: ThemeConfig;
  products?: StorefrontProduct[];
}

export default function LagosHome({ store, themeConfig, products = [] }: Props) {
  const storeName = store?.name ?? "Our Store";
  const sec = themeConfig?.sections;
  const accent = themeConfig?.colors?.primary ?? "#C75D3A";

  const headline = sec?.hero?.enabled ? (sec.hero.headline || storeName) : storeName;
  const subline  = sec?.hero?.enabled ? (sec.hero.subheadline || "") : "";
  const heroImage = sec?.hero?.imageUrl;
  const ctaText  = sec?.hero?.ctaText || "Explore the edit";

  const displayProducts = products.slice(0, sec?.featured?.count ?? 7);

  return (
    <LagosLayout
      storeName={storeName}
      primary={accent}
      tagline={sec?.footer?.tagline}
      whatsapp={sec?.footer?.contact?.whatsapp}
      instagram={sec?.footer?.social?.instagram}
      navItems={sec?.nav?.items?.map((i) => ({ label: i.label, url: i.url }))}
    >
      {/* ── Announcement ─────────────────────────────── */}
      {sec?.announcement?.enabled && (
        <div style={{ background: sec.announcement.bgColor ?? "#1A1A1A", color: sec.announcement.textColor ?? "#fff" }}
          className="py-2 px-6 text-center text-[11px] font-semibold">
          {sec.announcement.text}
        </div>
      )}

      {/* ── Hero ─────────────────────────────────────── */}
      {(sec ? sec.hero?.enabled : true) && (
        <section className="relative mx-auto grid max-w-7xl grid-cols-1 gap-0 px-6 pb-0 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch lg:gap-10 lg:pt-16">
          <div className="flex flex-col justify-center">
            {sec?.hero?.eyebrow && (
              <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: accent }}>
                {sec.hero.eyebrow}
              </p>
            )}
            <h1 className="mt-5 text-[clamp(2.6rem,7vw,5rem)] font-semibold leading-[0.95] tracking-tight text-[#F7F4EE]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {headline}
            </h1>
            {subline && <p className="mt-6 max-w-md text-[14.5px] leading-relaxed text-white/55">{subline}</p>}
            <div className="mt-9 flex items-center gap-5">
              <Link href="/shop"
                className="group inline-flex items-center gap-2 border border-[#F7F4EE] px-7 py-3.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#F7F4EE] no-underline transition-colors hover:bg-[#F7F4EE] hover:text-[#0E0E0E]">
                {ctaText}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              {sec?.hero?.secondaryCtaText && (
                <Link href="/collections"
                  className="text-[12px] font-semibold uppercase tracking-[0.1em] text-white/50 no-underline hover:text-white transition-colors">
                  {sec.hero.secondaryCtaText}
                </Link>
              )}
            </div>
          </div>

          <div className="relative mt-10 aspect-[4/5] overflow-hidden lg:mt-0">
            {heroImage ? (
              <img src={heroImage} alt="" className="h-full w-full object-cover transition-transform duration-[1.4s] ease-out hover:scale-[1.03]" />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center border border-white/10" style={{ background: "#1a1a1a" }}>
                <Package className="h-10 w-10 text-white/20 mb-3" />
                <p className="text-[11px] text-white/30 uppercase tracking-[0.1em]">Hero image</p>
                <p className="text-[10px] text-white/20 mt-1">Upload from Store Editor</p>
              </div>
            )}
            <div className="pointer-events-none absolute inset-3 border border-white/20" />
          </div>
        </section>
      )}

      {/* ── Featured products ─────────────────────────── */}
      {(sec ? sec.featured?.enabled : true) && (
        <section className="mx-auto max-w-7xl px-6 pb-24 pt-16">
          <div className="mb-8 flex items-baseline justify-between">
            <h2 className="text-[28px] font-semibold tracking-tight text-[#F7F4EE]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {sec?.featured?.title || "New arrivals"}
            </h2>
            <Link href="/shop" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/50 no-underline hover:text-[#C75D3A]">
              Shop all →
            </Link>
          </div>

          {displayProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {displayProducts.map((product, i) => (
                <div key={product.id} className={i % 5 === 0 ? "lg:row-span-2" : ""}>
                  <LagosProductCard product={product} index={i} tall={i % 5 === 0} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-4 border border-white/10">
              <Package className="h-10 w-10 text-white/20" />
              <p className="text-[16px] font-semibold text-white/50">{storeName} is setting up</p>
              <p className="text-[13px] text-white/30">Products are on their way — check back soon.</p>
            </div>
          )}
        </section>
      )}

      {/* ── CTA band ─────────────────────────────────── */}
      {sec?.ctaBand?.enabled && (
        <section className="border-t border-white/10 px-6 py-20 text-center">
          <h3 className="mx-auto mt-3 max-w-md text-[26px] font-semibold leading-tight text-[#F7F4EE]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {sec.ctaBand.headline || `${storeName} replies on WhatsApp, usually within minutes.`}
          </h3>
          {sec?.footer?.contact?.whatsapp && (
            <a href={`https://wa.me/${sec.footer.contact.whatsapp.replace(/\D/g, "")}`}
              target="_blank" rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 px-7 py-3.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-white no-underline transition-transform duration-200 hover:-translate-y-0.5"
              style={{ background: accent }}>
              <MessageCircle className="h-4 w-4" />
              {sec.ctaBand.btnText || "Message us"}
            </a>
          )}
        </section>
      )}
    </LagosLayout>
  );
}
