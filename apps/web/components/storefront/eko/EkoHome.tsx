"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight, Truck, ShieldCheck, MessageCircle,
  Sparkles, Package, ChevronLeft, ChevronRight, Layers,
} from "lucide-react";
import { ProductCard } from "@/components/storefront/eko/EkoProductCard";
import type { StoreData, ThemeConfig, StorefrontProduct } from "@/app/storefront/[slug]/page";
import { ordersApi } from "@gomarket/api-client";

interface Props {
  store?: StoreData;
  themeConfig?: ThemeConfig;
  products?: StorefrontProduct[];
  collections?: Array<{ id: string; name: string; slug?: string; image_url?: string }>;
}

// ── Hero variants ─────────────────────────────────────────────────────────────

function SplitHero({ storeName, sec, colors }: { storeName: string; sec: NonNullable<ThemeConfig["sections"]>; colors: ThemeConfig["colors"] }) {
  const headline = sec.hero?.headline || storeName;
  const sub = sec.hero?.subheadline || "";
  const cta = sec.hero?.ctaText || "Shop the collection";
  const ctaUrl = sec.hero?.ctaUrl || "/shop";
  const cta2 = sec.hero?.secondaryCtaText;
  const img = sec.hero?.imageUrl;

  return (
    <section className="relative overflow-hidden bg-[var(--store-bg)]">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--store-primary)]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-[var(--store-primary)]/5 blur-3xl" />
      <div className="relative mx-auto flex max-w-6xl flex-col-reverse items-center gap-10 px-5 py-14 sm:py-20 lg:flex-row lg:gap-16 lg:py-28">
        <div className="w-full max-w-xl animate-[fadeUp_0.6s_ease_forwards] text-center lg:text-left">
          {sec.hero?.eyebrow && (
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--store-primary)] shadow-sm">
              <Sparkles className="h-3 w-3" />{sec.hero.eyebrow}
            </span>
          )}
          <h1 className="text-[clamp(2rem,5.5vw,3.25rem)] font-extrabold leading-[1.05] tracking-tight text-[var(--store-text)]">
            {headline}
          </h1>
          {sub && <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-gray-500 lg:mx-0">{sub}</p>}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <Link href={ctaUrl} className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--store-primary)] px-7 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-[var(--store-primary)]/25 transition-transform duration-200 hover:-translate-y-0.5 sm:w-auto">
              {cta}<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            {cta2 && (
              <Link href={sec.hero?.secondaryCtaUrl ?? "/collections"} className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white/70 px-7 py-3.5 text-[14px] font-semibold text-[var(--store-text)] backdrop-blur-sm transition-colors hover:bg-white sm:w-auto">
                {cta2}
              </Link>
            )}
          </div>
        </div>
        <div className="relative w-full max-w-md animate-[fadeUp_0.7s_ease_forwards] [animation-delay:120ms]">
          {img ? (
            <div className="aspect-[4/5] overflow-hidden rounded-[28px] shadow-2xl shadow-black/10">
              <img src={img} alt="" className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out hover:scale-105" />
            </div>
          ) : (
            <div className="aspect-[4/5] flex flex-col items-center justify-center rounded-[28px] gap-4" style={{ background: "var(--store-bg)", border: "2px dashed var(--store-primary)", opacity: 0.6 }}>
              <Package className="h-12 w-12 text-[var(--store-primary)]" />
              <p className="text-[13px] font-semibold text-center text-[var(--store-primary)] px-6">
                Add a hero image from your store customization.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CenteredHero({ storeName, sec }: { storeName: string; sec: NonNullable<ThemeConfig["sections"]> }) {
  const headline = sec.hero?.headline || storeName;
  const sub = sec.hero?.subheadline || "";
  const cta = sec.hero?.ctaText || "Shop the collection";
  const img = sec.hero?.imageUrl;

  return (
    <section className="relative overflow-hidden bg-[var(--store-bg)]">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--store-primary)]/10 blur-3xl" />
      <div className="mx-auto max-w-3xl px-5 py-20 text-center animate-[fadeUp_0.6s_ease_forwards]">
        {sec.hero?.eyebrow && (
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--store-primary)] shadow-sm">
            <Sparkles className="h-3 w-3" />{sec.hero.eyebrow}
          </span>
        )}
        <h1 className="text-[clamp(2.25rem,6vw,3.75rem)] font-extrabold leading-[1.05] tracking-tight text-[var(--store-text)]">
          {headline}
        </h1>
        {sub && <p className="mx-auto mt-5 max-w-lg text-[16px] leading-relaxed text-gray-500">{sub}</p>}
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/shop" className="group inline-flex items-center gap-2 rounded-xl bg-[var(--store-primary)] px-8 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-[var(--store-primary)]/25 transition-transform duration-200 hover:-translate-y-0.5">
            {cta}<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
        {img && (
          <div className="mt-12 overflow-hidden rounded-2xl shadow-2xl shadow-black/10">
            <img src={img} alt="" className="w-full object-cover max-h-[420px]" />
          </div>
        )}
      </div>
    </section>
  );
}

function FullBleedHero({ storeName, sec }: { storeName: string; sec: NonNullable<ThemeConfig["sections"]> }) {
  const headline = sec.hero?.headline || storeName;
  const sub = sec.hero?.subheadline || "";
  const cta = sec.hero?.ctaText || "Shop the collection";
  const img = sec.hero?.imageUrl;
  const overlay = sec.hero?.overlayOpacity ?? 0.4;

  return (
    <section className="relative overflow-hidden min-h-[520px] flex items-center" style={{ background: img ? undefined : "var(--store-primary)" }}>
      {img && <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />}
      <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${overlay})` }} />
      <div className="relative mx-auto max-w-3xl px-5 py-24 text-center animate-[fadeUp_0.6s_ease_forwards]">
        {sec.hero?.eyebrow && (
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-white/70">{sec.hero.eyebrow}</p>
        )}
        <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] font-extrabold leading-[1.02] tracking-tight text-white">
          {headline}
        </h1>
        {sub && <p className="mx-auto mt-5 max-w-lg text-[16px] leading-relaxed text-white/75">{sub}</p>}
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link href="/shop" className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-[14px] font-bold transition-transform duration-200 hover:-translate-y-0.5" style={{ color: "var(--store-primary)" }}>
            {cta}<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

type CarouselSlide = { id: string; imageUrl?: string; headline?: string; subheadline?: string; ctaText?: string; ctaUrl?: string; textPosition?: "bottom-left" | "center" | "bottom-right" };

function CarouselHero({ storeName, sec }: { storeName: string; sec: NonNullable<ThemeConfig["sections"]> }) {
  const slides: CarouselSlide[] = sec.hero?.carouselSlides?.length
    ? sec.hero.carouselSlides
    : [{ id: "default", imageUrl: sec.hero?.imageUrl, headline: sec.hero?.headline || storeName, subheadline: sec.hero?.subheadline, ctaText: sec.hero?.ctaText, ctaUrl: sec.hero?.ctaUrl ?? "/shop", textPosition: "center" }];

  const animation = sec.hero?.carouselAnimation ?? "slide";
  const [cur, setCur] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => setCur((c) => (c + 1) % slides.length), 4500);
  };

  useEffect(() => { resetTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [slides.length]);

  const prev = () => { setCur((c) => (c - 1 + slides.length) % slides.length); resetTimer(); };
  const next = () => { setCur((c) => (c + 1) % slides.length); resetTimer(); };
  const slide = slides[cur];

  const pos = slide?.textPosition ?? "center";
  const sectionAlign = pos === "bottom-left" ? "items-end justify-start" : pos === "bottom-right" ? "items-end justify-end" : "items-end justify-center";
  const textAlign = pos === "bottom-left" ? "text-left" : pos === "bottom-right" ? "text-right" : "text-center";
  const paddingX = pos === "bottom-left" ? "pl-8 pr-4" : pos === "bottom-right" ? "pr-8 pl-4" : "px-5";

  const imgClass = animation === "fade" ? "animate-[fadeIn_0.7s_ease]" : animation === "zoom" ? "animate-[zoomIn_0.7s_ease]" : "animate-[fadeUp_0.7s_ease_forwards]";

  return (
    <section className={`relative overflow-hidden min-h-[480px] sm:min-h-[580px] flex ${sectionAlign}`} style={{ background: "var(--store-primary)" }}>
      {slide?.imageUrl && (
        <img key={slide.id} src={slide.imageUrl} alt="" className={`absolute inset-0 w-full h-full object-cover ${imgClass}`} />
      )}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)" }} />

      {/* Content */}
      <div className={`relative w-full ${paddingX} pb-16 sm:pb-20 max-w-2xl ${textAlign}`}>
        <h1 className="text-[clamp(1.75rem,5vw,3.25rem)] font-extrabold leading-[1.05] tracking-tight text-white mb-4">
          {slide?.headline || storeName}
        </h1>
        {slide?.subheadline && <p className="text-white/75 text-[15px] mb-6 max-w-md">{slide.subheadline}</p>}
        <Link href={slide?.ctaUrl ?? "/shop"} className={`inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-[14px] font-bold transition-transform hover:-translate-y-0.5 ${textAlign === "text-right" ? "flex-row-reverse" : ""}`} style={{ color: "var(--store-primary)" }}>
          {slide?.ctaText || "Shop now"}<ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm hover:bg-black/40 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm hover:bg-black/40 transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => { setCur(i); resetTimer(); }} className="rounded-full transition-all duration-300" style={{ width: i === cur ? "20px" : "8px", height: "8px", background: i === cur ? "#fff" : "rgba(255,255,255,0.4)" }} />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Featured product layouts ──────────────────────────────────────────────────

function GridProducts({ products }: { products: StorefrontProduct[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
    </div>
  );
}

function BentoProducts({ products }: { products: StorefrontProduct[] }) {
  const [first, ...rest] = products;
  if (!first) return <GridProducts products={products} />;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4" style={{ gridAutoRows: "auto" }}>
      {/* First card: tall, spans 2 rows on sm+ */}
      <div className="row-span-2 sm:row-span-2">
        <ProductCard product={first} index={0} />
      </div>
      {rest.slice(0, 4).map((p, i) => (
        <ProductCard key={p.id} product={p} index={i + 1} />
      ))}
    </div>
  );
}

function SplitProducts({ products }: { products: StorefrontProduct[] }) {
  return (
    <div className="flex flex-col gap-4">
      {products.map((p, i) => (
        <Link key={p.id} href={`/products/${p.id}`}
          className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-3 hover:shadow-md transition-shadow"
          style={{ textDecoration: "none", animationDelay: `${i * 50}ms` }}>
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 overflow-hidden rounded-xl bg-[var(--store-bg)]">
            {p.images[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <Package className="w-8 h-8 m-auto mt-5 text-[var(--store-primary)] opacity-30" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-[var(--store-text)] truncate">{p.name}</p>
            {p.tags?.[0] && <p className="text-[11px] text-gray-400 mt-0.5 uppercase tracking-wide">{p.tags[0]}</p>}
            <p className="mt-2 text-[16px] font-extrabold text-[var(--store-primary)]">
              ₦{(p.price_kobo / 100).toLocaleString("en-NG", { maximumFractionDigits: 0 })}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
        </Link>
      ))}
    </div>
  );
}

function CarouselProducts({ products }: { products: StorefrontProduct[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
      {products.map((p, i) => (
        <div key={p.id} className="snap-start flex-shrink-0 w-[200px] sm:w-[240px]">
          <ProductCard product={p} index={i} />
        </div>
      ))}
    </div>
  );
}

// ── Collections strip ─────────────────────────────────────────────────────────

function CollectionsStrip({ collections, sec }: { collections: NonNullable<Props["collections"]>; sec: NonNullable<ThemeConfig["sections"]> }) {
  const format = sec.collections?.format ?? "grid";
  const cols = sec.collections?.columns ?? 3;
  const title = sec.collections?.title || "Shop by collection";

  if (format === "split") {
    return (
      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-[22px] font-extrabold tracking-tight text-[var(--store-text)] mb-6">{title}</h2>
        <div className="flex flex-col gap-4">
          {collections.map((col) => (
            <Link key={col.id} href={`/collections/${col.slug ?? col.id}`} style={{ textDecoration: "none" }}
              className="flex items-center gap-4 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow bg-[var(--store-bg)]">
              <div className="w-24 h-24 flex-shrink-0 overflow-hidden">
                {col.image_url ? <img src={col.image_url} alt={col.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Layers className="w-8 h-8 text-[var(--store-primary)] opacity-30" /></div>}
              </div>
              <p className="text-[15px] font-bold text-[var(--store-text)]">{col.name}</p>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  if (format === "bento") {
    const [first, ...rest] = collections;
    return (
      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-[22px] font-extrabold tracking-tight text-[var(--store-text)] mb-6">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {first && (
            <Link key={first.id} href={`/collections/${first.slug ?? first.id}`} className="col-span-2 sm:col-span-2 row-span-2 relative overflow-hidden rounded-2xl aspect-[2/1] sm:aspect-auto sm:min-h-[240px]" style={{ textDecoration: "none" }}>
              {first.image_url ? <img src={first.image_url} alt={first.name} className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center bg-[var(--store-bg)]"><Layers className="w-12 h-12 text-[var(--store-primary)] opacity-20" /></div>}
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)" }} />
              <div className="absolute bottom-4 left-4"><p className="text-white font-bold text-[17px]">{first.name}</p></div>
            </Link>
          )}
          {rest.map((col) => (
            <Link key={col.id} href={`/collections/${col.slug ?? col.id}`} className="relative overflow-hidden rounded-2xl aspect-square" style={{ textDecoration: "none" }}>
              {col.image_url ? <img src={col.image_url} alt={col.name} className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center bg-[var(--store-bg)]"><Layers className="w-8 h-8 text-[var(--store-primary)] opacity-20" /></div>}
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }} />
              <div className="absolute bottom-3 left-3"><p className="text-white font-semibold text-[13px]">{col.name}</p></div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  // Grid (default)
  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <h2 className="text-[22px] font-extrabold tracking-tight text-[var(--store-text)] mb-6">{title}</h2>
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(cols, collections.length)}, minmax(0, 1fr))` }}>
        {collections.map((col) => (
          <Link key={col.id} href={`/collections/${col.slug ?? col.id}`} className="group relative overflow-hidden rounded-2xl aspect-square" style={{ textDecoration: "none" }}>
            {col.image_url ? <img src={col.image_url} alt={col.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="absolute inset-0 flex items-center justify-center bg-[var(--store-bg)]"><Layers className="w-10 h-10 text-[var(--store-primary)] opacity-20" /></div>}
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }} />
            <div className="absolute bottom-4 left-4"><p className="text-white font-bold text-[15px]">{col.name}</p></div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── Newsletter section ────────────────────────────────────────────────────────

function EkoNewsletterSection({
  storeId, sec, primary,
}: {
  storeId: string;
  sec: NonNullable<NonNullable<ThemeConfig["sections"]>["newsletter"]>;
  primary: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      await ordersApi.subscribe({ store_id: storeId, email });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-5 pb-16">
      <div className="overflow-hidden rounded-3xl px-8 py-12 sm:py-14" style={{ background: "var(--store-bg)", border: `1.5px solid ${primary}26` }}>
        <div className="mx-auto max-w-lg text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: primary }}>{sec.eyebrow ?? "Newsletter"}</p>
          <h2 className="mt-2 text-[22px] font-extrabold tracking-tight text-[var(--store-text)]">
            {sec.headline ?? "Stay in the loop"}
          </h2>
          <p className="mt-2 text-[13px] text-gray-500">{sec.subtext ?? "Get updates on new arrivals and exclusive deals."}</p>
          {status === "success" ? (
            <div className="mt-6 flex items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-semibold" style={{ background: `${primary}15`, color: primary }}>
              ✓ You&apos;re subscribed — thank you!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={sec.placeholder ?? "Enter your email"}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-[13px] outline-none focus:border-[var(--store-primary)] transition-colors"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-xl px-6 py-3 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: primary }}
              >
                {status === "loading" ? "Subscribing…" : "Subscribe"}
              </button>
            </form>
          )}
          {status === "error" && (
            <p className="mt-2 text-[12px] text-red-500">Something went wrong. Please try again.</p>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EkoHome({ store, themeConfig, products = [], collections = [] }: Props) {
  const storeName = store?.name ?? "Our Store";
  const sec = themeConfig?.sections;
  const colors = themeConfig?.colors ?? { primary: "#1A7A42", secondary: "#0A4D2A", bg: "#F0FAF3", text: "#1C1C1C" };

  const heroEnabled = sec?.hero?.enabled !== false;
  const heroLayout = sec?.hero?.layout ?? "split";
  const featLayout = sec?.featured?.layout ?? "grid";
  const displayProducts = products.slice(0, sec?.featured?.count ?? 6);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      {heroEnabled && (
        <>
          {heroLayout === "carousel" && <CarouselHero storeName={storeName} sec={sec ?? {}} />}
          {heroLayout === "full-bleed" && <FullBleedHero storeName={storeName} sec={sec ?? {}} />}
          {heroLayout === "centered" && <CenteredHero storeName={storeName} sec={sec ?? {}} />}
          {heroLayout === "split" && <SplitHero storeName={storeName} sec={sec ?? {}} colors={colors} />}
        </>
      )}

      {/* ── Value props strip ────────────────────────────── */}
      <section className="border-y border-gray-100">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-gray-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { icon: Truck, title: "Nationwide delivery", copy: "Delivered to your door, anywhere in Nigeria" },
            { icon: ShieldCheck, title: "Safe shopping", copy: "Shop with confidence, every time" },
            { icon: MessageCircle, title: "Real human support", copy: "Reach us directly on WhatsApp" },
          ].map(({ icon: Icon, title, copy }) => (
            <div key={title} className="flex items-center gap-3 px-6 py-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--store-bg)]">
                <Icon className="h-[18px] w-[18px] text-[var(--store-primary)]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[var(--store-text)]">{title}</p>
                <p className="text-[11.5px] text-gray-500">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Collections strip ───────────────────────────── */}
      {sec?.collections?.enabled && collections.length > 0 && (
        <CollectionsStrip collections={collections} sec={sec} />
      )}

      {/* ── Featured products ────────────────────────────── */}
      {(sec?.featured?.enabled !== false) && (
        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="mb-7 flex items-baseline justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--store-primary)]">Handpicked</p>
              <h2 className="mt-1 text-[22px] font-extrabold tracking-tight text-[var(--store-text)]">
                {sec?.featured?.title || "Featured products"}
              </h2>
            </div>
            <Link href="/shop" className="text-[13px] font-bold text-[var(--store-primary)] hover:underline">Shop all →</Link>
          </div>

          {displayProducts.length > 0 ? (
            <>
              {featLayout === "bento" && <BentoProducts products={displayProducts} />}
              {featLayout === "split" && <SplitProducts products={displayProducts} />}
              {featLayout === "carousel" && <CarouselProducts products={displayProducts} />}
              {featLayout === "grid" && <GridProducts products={displayProducts} />}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-5 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--store-bg)]">
                <Package className="h-8 w-8 text-[var(--store-primary)]" />
              </div>
              <div className="text-center">
                <p className="text-[18px] font-extrabold text-[var(--store-text)]">{storeName} is setting up</p>
                <p className="mt-2 text-[14px] text-gray-500 max-w-xs">Products are on their way. Check back soon.</p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Newsletter signup ──────────────────────────── */}
      {sec?.newsletter?.enabled && store?.id && (
        <EkoNewsletterSection storeId={store.id} sec={sec.newsletter} primary={colors.primary} />
      )}

      {/* ── WhatsApp CTA band ───────────────────────────── */}
      {sec?.ctaBand?.enabled && (
        <section className="mx-auto max-w-6xl px-5 pb-20">
          <div className="overflow-hidden rounded-3xl px-8 py-12 text-center sm:py-16" style={{ background: colors.secondary }}>
            <h3 className="text-[22px] font-extrabold tracking-tight text-white sm:text-[26px]">
              {sec.ctaBand.headline || "Have a question?"}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-[13px] text-white/65">
              {sec.ctaBand.text || `Message ${storeName} directly on WhatsApp.`}
            </p>
            {sec.footer?.contact?.whatsapp && (
              <a href={`https://wa.me/${sec.footer.contact.whatsapp.replace(/\D/g, "")}`}
                target="_blank" rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-[13px] font-bold transition-transform duration-200 hover:-translate-y-0.5"
                style={{ color: colors.secondary }}>
                <MessageCircle className="h-4 w-4" />
                {sec.ctaBand.btnText || "Chat on WhatsApp"}
              </a>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
