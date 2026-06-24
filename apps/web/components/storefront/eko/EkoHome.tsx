"use client";

import Link from "next/link";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  MessageCircle,
  Sparkles,
  Package,
} from "lucide-react";
import { PRODUCTS, COLLECTIONS } from "@/lib/data/products";
import { STORE_CONFIG } from "@/lib/storeConfig";
import { ProductCard } from "@/components/storefront/eko/EkoProductCard";
import EkoLayout from "@/components/storefront/eko/EkoLayout";
import type { StoreData, ThemeConfig } from "@/app/storefront/[slug]/page";

interface Props {
  store?: StoreData;
  themeConfig?: ThemeConfig;
}

export default function HomePage({ store, themeConfig }: Props) {
  const storeName = store?.name ?? STORE_CONFIG.storeName;
  const sec = themeConfig?.sections;
  const colors = themeConfig?.colors ?? {
    primary: STORE_CONFIG.colors.primary,
    secondary: STORE_CONFIG.colors.secondary,
    bg: STORE_CONFIG.colors.bg,
    text: STORE_CONFIG.colors.text,
  };

  const tagline = sec?.hero?.enabled ? (sec.hero?.headline || storeName) : storeName;
  const subtagline = sec?.hero?.enabled ? (sec.hero?.subheadline || "") : "";

  const featured = PRODUCTS.filter(
    (p) => p.featured && p.status === "active",
  ).slice(0, 6);
  const displayProducts =
    featured.length >= 3
      ? featured
      : PRODUCTS.filter((p) => p.status === "active").slice(0, 6);

  return (
    <EkoLayout
      storeName={storeName}
      primary={colors.primary}
      secondary={colors.secondary}
      tagline={sec?.footer?.tagline}
      whatsapp={sec?.footer?.contact?.whatsapp}
      instagram={sec?.footer?.social?.instagram}
    >
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[var(--store-bg)]">
        {/* Ambient blob — purely decorative, sits behind content */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--store-primary)]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-[var(--store-primary)]/5 blur-3xl" />

        <div className="relative mx-auto flex max-w-6xl flex-col-reverse items-center gap-10 px-5 py-14 sm:py-20 lg:flex-row lg:gap-16 lg:py-28">
          <div className="w-full max-w-xl animate-[fadeUp_0.6s_ease_forwards] text-center lg:text-left">
            <span className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--store-primary)] shadow-sm">
              <Sparkles className="h-3 w-3" />
              {storeName}
            </span>

            <h1 className="text-[clamp(2rem,5.5vw,3.25rem)] font-extrabold leading-[1.05] tracking-tight text-[var(--store-text)]">
              {tagline}
            </h1>

            <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-gray-500 lg:mx-0">
              {subtagline}
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/shop"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--store-primary)] px-7 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-[var(--store-primary)]/25 transition-transform duration-200 hover:-translate-y-0.5 sm:w-auto"
              >
                Shop the collection
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/collections"
                className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white/70 px-7 py-3.5 text-[14px] font-semibold text-[var(--store-text)] backdrop-blur-sm transition-colors hover:bg-white sm:w-auto"
              >
                Browse collections
              </Link>
            </div>
          </div>

          <div className="relative w-full max-w-md animate-[fadeUp_0.7s_ease_forwards] [animation-delay:120ms]">
            {store && !STORE_CONFIG.hero.image ? (
              <div className="aspect-[4/5] flex flex-col items-center justify-center rounded-[28px] gap-4" style={{ background: "var(--store-bg)", border: "2px dashed var(--store-primary)", opacity: 0.6 }}>
                <Package className="h-12 w-12 text-[var(--store-primary)]" />
                <p className="text-[13px] font-semibold text-center text-[var(--store-primary)] px-6">
                  Your store banner will appear here once you add one from your dashboard.
                </p>
              </div>
            ) : (
              <div className="aspect-[4/5] overflow-hidden rounded-[28px] shadow-2xl shadow-black/10">
                <img
                  src={STORE_CONFIG.hero.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out hover:scale-105"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Value props ──────────────────────────────────── */}
      <section className="border-y border-gray-100">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-gray-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            {
              icon: Truck,
              title: "Nationwide delivery",
              copy: "Delivered to your door, anywhere in Nigeria",
            },
            {
              icon: ShieldCheck,
              title: STORE_CONFIG.returnPolicy.split(".")[0],
              copy: "Shop with confidence, every time",
            },
            {
              icon: MessageCircle,
              title: "Real human support",
              copy: "Reach us directly on WhatsApp",
            },
          ].map(({ icon: Icon, title, copy }) => (
            <div key={title} className="flex items-center gap-3 px-6 py-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--store-bg)]">
                <Icon className="h-[18px] w-[18px] text-[var(--store-primary)]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[var(--store-text)]">
                  {title}
                </p>
                <p className="text-[11.5px] text-gray-500">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Collections strip ────────────────────────────── */}
      {COLLECTIONS.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="mb-7 flex items-baseline justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--store-primary)]">
                Curated for you
              </p>
              <h2 className="mt-1 text-[22px] font-extrabold tracking-tight text-[var(--store-text)]">
                Shop by collection
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-[13px] font-bold text-[var(--store-primary)] hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {COLLECTIONS.slice(0, 4).map((col, i) => (
              <Link
                key={col.id}
                href={`/collections/${col.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl opacity-0 [animation-fill-mode:forwards]"
                style={{ animation: `fadeUp 0.5s ease forwards ${i * 80}ms` }}
              >
                <img
                  src={col.coverImage}
                  alt={col.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent transition-opacity duration-300 group-hover:from-black/75" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-[14px] font-bold leading-tight text-white">
                    {col.name}
                  </p>
                  <p className="mt-0.5 text-[10.5px] text-white/70">
                    {col.productIds.length} items
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured products ────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-7 flex items-baseline justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--store-primary)]">
              Handpicked
            </p>
            <h2 className="mt-1 text-[22px] font-extrabold tracking-tight text-[var(--store-text)]">
              Featured products
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-[13px] font-bold text-[var(--store-primary)] hover:underline"
          >
            Shop all →
          </Link>
        </div>

        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {displayProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-5 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--store-bg)]">
              <Package className="h-8 w-8 text-[var(--store-primary)]" />
            </div>
            <div className="text-center">
              <p className="text-[18px] font-extrabold text-[var(--store-text)]">{storeName} is setting up</p>
              <p className="mt-2 text-[14px] text-gray-500 max-w-xs">
                Products are on their way. Check back soon or send us a message.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ── Bottom CTA band ──────────────────────────────── */}
      {sec?.ctaBand?.enabled && (
        <section className="mx-auto max-w-6xl px-5 pb-20">
          <div className="overflow-hidden rounded-3xl px-8 py-12 text-center sm:py-16" style={{ background: colors.secondary }}>
            <h3 className="text-[22px] font-extrabold tracking-tight text-white sm:text-[26px]">
              {sec?.ctaBand?.headline || "Have a question?"}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-[13px] text-white/65">
              {sec?.ctaBand?.text || `Message ${storeName} directly on WhatsApp.`}
            </p>
            {sec?.footer?.contact?.whatsapp && (
              <a
                href={`https://wa.me/${sec?.footer?.contact?.whatsapp?.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-[13px] font-bold transition-transform duration-200 hover:-translate-y-0.5"
                style={{ color: colors.secondary }}
              >
                <MessageCircle className="h-4 w-4" />
                {sec?.ctaBand?.btnText || "Chat on WhatsApp"}
              </a>
            )}
          </div>
        </section>
      )}
    </EkoLayout>
  );
}
