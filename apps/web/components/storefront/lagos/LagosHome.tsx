"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, MessageCircle, Package, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { LagosProductCard } from "./LagosProductCard";
import type { StoreData, ThemeConfig, StorefrontProduct } from "@/app/storefront/[slug]/page";
import { ordersApi } from "@gomarket/api-client";

interface Props {
  store?: StoreData;
  themeConfig?: ThemeConfig;
  products?: StorefrontProduct[];
  collections?: Array<{ id: string; name: string; slug?: string; image_url?: string }>;
}

type CarouselSlide = NonNullable<NonNullable<ThemeConfig["sections"]>["hero"]>["carouselSlides"] extends Array<infer T> | undefined ? T : never;

// ── Hero variants ──────────────────────────────────────────────────────────────

function LagosSplitHero({ storeName, sec, accent }: { storeName: string; sec: NonNullable<ThemeConfig["sections"]>; accent: string }) {
  const headline = sec.hero?.headline || storeName;
  const sub = sec.hero?.subheadline || "";
  const cta = sec.hero?.ctaText || "Explore the edit";
  const ctaUrl = sec.hero?.ctaUrl || "/shop";
  const img = sec.hero?.imageUrl;

  return (
    <section className="relative mx-auto grid max-w-7xl grid-cols-1 gap-0 px-6 pb-0 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch lg:gap-10 lg:pt-16">
      <div className="flex flex-col justify-center">
        {sec.hero?.eyebrow && (
          <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: accent }}>{sec.hero.eyebrow}</p>
        )}
        <h1 className="mt-5 text-[clamp(2.6rem,7vw,5rem)] font-semibold leading-[0.95] tracking-tight text-[#F7F4EE]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {headline}
        </h1>
        {sub && <p className="mt-6 max-w-md text-[14.5px] leading-relaxed text-white/55">{sub}</p>}
        <div className="mt-9 flex items-center gap-5">
          <Link href={ctaUrl}
            className="group inline-flex items-center gap-2 border border-[#F7F4EE] px-7 py-3.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#F7F4EE] no-underline transition-colors hover:bg-[#F7F4EE] hover:text-[#0E0E0E]">
            {cta}<ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          {sec.hero?.secondaryCtaText && (
            <Link href={sec.hero?.secondaryCtaUrl || "/collections"}
              className="text-[12px] font-semibold uppercase tracking-[0.1em] text-white/50 no-underline hover:text-white transition-colors">
              {sec.hero.secondaryCtaText}
            </Link>
          )}
        </div>
      </div>
      <div className="relative mt-10 aspect-[4/5] overflow-hidden lg:mt-0">
        {img ? (
          <img src={img} alt="" className="h-full w-full object-cover transition-transform duration-[1.4s] ease-out hover:scale-[1.03]" />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center border border-white/10" style={{ background: "#1a1a1a" }}>
            <Package className="h-10 w-10 text-white/20 mb-3" />
            <p className="text-[11px] text-white/30 uppercase tracking-[0.1em]">Hero image</p>
          </div>
        )}
        <div className="pointer-events-none absolute inset-3 border border-white/20" />
      </div>
    </section>
  );
}

function LagosFullBleedHero({ storeName, sec, accent }: { storeName: string; sec: NonNullable<ThemeConfig["sections"]>; accent: string }) {
  const headline = sec.hero?.headline || storeName;
  const sub = sec.hero?.subheadline || "";
  const cta = sec.hero?.ctaText || "Explore the edit";
  const ctaUrl = sec.hero?.ctaUrl || "/shop";
  const img = sec.hero?.imageUrl;
  const overlay = sec.hero?.overlayOpacity ?? 0.55;
  const pos = sec.hero?.textPosition ?? "center";

  const alignMap = { "bottom-left": "items-end justify-start text-left", "center": "items-center justify-center text-center", "bottom-right": "items-end justify-end text-right" };
  const align = alignMap[pos] ?? alignMap.center;

  return (
    <section className={`relative overflow-hidden min-h-[600px] flex ${align} px-10 py-20`} style={{ background: "#0E0E0E" }}>
      {img && <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />}
      <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${overlay})` }} />
      <div className="relative max-w-2xl">
        {sec.hero?.eyebrow && <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">{sec.hero.eyebrow}</p>}
        <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-tight text-[#F7F4EE]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {headline}
        </h1>
        {sub && <p className="mt-5 text-[14px] leading-relaxed text-white/55 max-w-md">{sub}</p>}
        <div className="mt-9">
          <Link href={ctaUrl}
            className="group inline-flex items-center gap-2 border border-[#F7F4EE] px-7 py-3.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#F7F4EE] no-underline transition-colors hover:bg-[#F7F4EE] hover:text-[#0E0E0E]">
            {cta}<ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function LagosCenteredHero({ storeName, sec, accent }: { storeName: string; sec: NonNullable<ThemeConfig["sections"]>; accent: string }) {
  const headline = sec.hero?.headline || storeName;
  const sub = sec.hero?.subheadline || "";
  const cta = sec.hero?.ctaText || "Explore the edit";
  const ctaUrl = sec.hero?.ctaUrl || "/shop";
  const img = sec.hero?.imageUrl;

  return (
    <section className="max-w-3xl mx-auto px-6 pt-20 pb-8 text-center">
      {sec.hero?.eyebrow && <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: accent }}>{sec.hero.eyebrow}</p>}
      <h1 className="text-[clamp(2.8rem,7vw,5rem)] font-semibold leading-[0.93] tracking-tight text-[#F7F4EE]"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        {headline}
      </h1>
      {sub && <p className="mt-6 text-[14.5px] leading-relaxed text-white/55 max-w-md mx-auto">{sub}</p>}
      <div className="mt-8 flex justify-center">
        <Link href={ctaUrl}
          className="group inline-flex items-center gap-2 border border-[#F7F4EE] px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#F7F4EE] no-underline transition-colors hover:bg-[#F7F4EE] hover:text-[#0E0E0E]">
          {cta}<ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
      {img && (
        <div className="mt-12 relative overflow-hidden">
          <img src={img} alt="" className="w-full max-h-[480px] object-cover" />
          <div className="pointer-events-none absolute inset-4 border border-white/10" />
        </div>
      )}
    </section>
  );
}

// Standard Lagos carousel (full-bleed with dots + arrows)
function LagosStandardCarousel({ storeName, slides, animation }: { storeName: string; slides: CarouselSlide[]; animation?: string }) {
  const [cur, setCur] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => setCur(c => (c + 1) % slides.length), 5000);
  };

  useEffect(() => { resetTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [slides.length]);

  const go = (dir: 1 | -1) => { setCur(c => (c + dir + slides.length) % slides.length); resetTimer(); };
  const slide = slides[cur] ?? slides[0];
  const pos = slide?.textPosition ?? "center";

  const alignMap = { "bottom-left": "items-end pb-16 pl-10", "center": "items-center justify-center text-center px-8", "bottom-right": "items-end pb-16 pr-10" };
  const align = alignMap[pos] ?? alignMap.center;

  const transitionClass = animation === "fade" ? "animate-[fadeIn_0.6s_ease]" : animation === "zoom" ? "animate-[zoomIn_0.6s_ease]" : "animate-[slideInRight_0.5s_ease]";

  return (
    <section className={`relative overflow-hidden min-h-[580px] flex flex-col ${align}`} style={{ background: "#0E0E0E" }}>
      {slide?.imageUrl && (
        <img key={slide.id} src={slide.imageUrl} alt="" className={`absolute inset-0 w-full h-full object-cover ${transitionClass}`} />
      )}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)" }} />

      <div className="relative max-w-xl">
        {slide?.headline && (
          <h1 className="text-[clamp(2.2rem,6vw,4.5rem)] font-semibold leading-[0.93] tracking-tight text-[#F7F4EE]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {slide.headline}
          </h1>
        )}
        {slide?.subheadline && <p className="mt-4 text-[14px] text-white/60 max-w-md">{slide.subheadline}</p>}
        {slide?.ctaText && (
          <Link href={slide.ctaUrl ?? "/shop"}
            className="mt-7 inline-flex items-center gap-2 border border-[#F7F4EE] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#F7F4EE] no-underline transition-colors hover:bg-[#F7F4EE] hover:text-[#0E0E0E]">
            {slide.ctaText}<ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {slides.length > 1 && (
        <>
          <button onClick={() => go(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-white/30 text-white hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => go(1)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-white/30 text-white hover:bg-white/10 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCur(i)}
                className="transition-all duration-300 border border-white/40"
                style={{ width: i === cur ? "24px" : "8px", height: "8px", background: i === cur ? "#fff" : "transparent" }} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

// Editorial Lagos carousel — geometric "Dribbble" feel: numbered slides, side "Up Next" preview panel
function LagosEditorialCarousel({ storeName, slides, accent }: { storeName: string; slides: CarouselSlide[]; accent: string }) {
  const [cur, setCur] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => setCur(c => (c + 1) % slides.length), 6000);
  };

  useEffect(() => { resetTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [slides.length]);

  const go = (dir: 1 | -1) => { setCur(c => (c + dir + slides.length) % slides.length); resetTimer(); };
  const slide = slides[cur] ?? slides[0];
  const nextSlide = slides[(cur + 1) % slides.length];

  return (
    <section className="relative overflow-hidden" style={{ background: "#0E0E0E", minHeight: "100vh", maxHeight: "780px", display: "flex", flexDirection: "column" }}>
      {/* Main image */}
      <div className="absolute inset-0">
        {slide?.imageUrl && (
          <img key={cur} src={slide.imageUrl} alt="" className="w-full h-full object-cover animate-[fadeIn_0.8s_ease]" />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.6) 80%, rgba(0,0,0,0.85) 100%)" }} />
      </div>

      {/* Left: slide numbers */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
        {slides.map((_, i) => (
          <button key={i} onClick={() => { setCur(i); resetTimer(); }}
            className="flex items-center gap-2 group"
            style={{ opacity: i === cur ? 1 : 0.35 }}>
            <div className="w-4 h-px transition-all duration-500" style={{ background: i === cur ? "#F7F4EE" : "rgba(255,255,255,0.4)", width: i === cur ? "20px" : "8px" }} />
            <span className="text-[10px] font-mono font-bold text-white tracking-[0.1em]">
              {String(i + 1).padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col justify-end pb-0 pl-20 pr-6 pt-16 z-10">
        <div className="max-w-lg mb-8">
          {slide?.headline && (
            <h1 className="text-[clamp(2.8rem,6.5vw,5.5rem)] font-semibold leading-[0.9] tracking-tight text-[#F7F4EE]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {slide.headline}
            </h1>
          )}
          {slide?.subheadline && <p className="mt-4 text-[13px] text-white/55 leading-relaxed max-w-sm">{slide.subheadline}</p>}
          {slide?.ctaText && (
            <Link href={slide.ctaUrl ?? "/shop"}
              className="mt-7 inline-flex items-center gap-2 border border-[#F7F4EE] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#F7F4EE] no-underline transition-colors hover:bg-[#F7F4EE] hover:text-[#0E0E0E]">
              {slide.ctaText}<ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Bottom bar: Up Next + Prev/Next */}
      <div className="relative z-10 flex" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {/* Up next */}
        {slides.length > 1 && nextSlide && (
          <div className="flex items-center gap-4 px-6 py-4 flex-1 min-w-0">
            <div className="w-14 h-14 flex-shrink-0 overflow-hidden" style={{ outline: "1px solid rgba(255,255,255,0.1)" }}>
              {nextSlide.imageUrl
                ? <img src={nextSlide.imageUrl} alt="" className="w-full h-full object-cover opacity-70" />
                : <div className="w-full h-full" style={{ background: "#1a1a1a" }} />
              }
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">Up next</p>
              <p className="text-[13px] font-semibold text-[#F7F4EE] truncate mt-0.5">{nextSlide.headline ?? storeName}</p>
            </div>
          </div>
        )}

        {/* Prev / Next */}
        <div className="flex items-center gap-0 border-l ml-auto flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <button onClick={() => go(-1)}
            className="flex items-center gap-2 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/50 hover:text-[#F7F4EE] transition-colors border-r"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>
          <button onClick={() => go(1)}
            className="flex items-center gap-2 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/50 hover:text-[#F7F4EE] transition-colors">
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Featured product layouts (Lagos aesthetic) ────────────────────────────────

function LagosGridProducts({ products }: { products: StorefrontProduct[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product, i) => (
        <div key={product.id} className={i % 5 === 0 ? "lg:row-span-2" : ""}>
          <LagosProductCard product={product} index={i} tall={i % 5 === 0} />
        </div>
      ))}
    </div>
  );
}

function LagosBentoProducts({ products }: { products: StorefrontProduct[] }) {
  const [first, ...rest] = products;
  if (!first) return <LagosGridProducts products={products} />;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div className="row-span-2 sm:row-span-2">
        <LagosProductCard product={first} index={0} tall />
      </div>
      {rest.slice(0, 4).map((p, i) => <LagosProductCard key={p.id} product={p} index={i + 1} />)}
    </div>
  );
}

function LagosSplitProducts({ products }: { products: StorefrontProduct[] }) {
  return (
    <div className="flex flex-col gap-0 border-t border-white/10">
      {products.map((p) => (
        <Link key={p.id} href={`/products/${p.id}`} style={{ textDecoration: "none" }}
          className="flex items-center gap-5 py-5 border-b border-white/10 hover:bg-white/3 transition-colors group px-1">
          <div className="w-20 h-20 flex-shrink-0 overflow-hidden border border-white/10">
            {p.images[0]
              ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
              : <div className="w-full h-full flex items-center justify-center" style={{ background: "#1a1a1a" }}><Package className="w-6 h-6 text-white/20" /></div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-[#F7F4EE] truncate" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{p.name}</p>
            {p.tags?.[0] && <p className="text-[10px] text-white/30 uppercase tracking-[0.12em] mt-0.5">{p.tags[0]}</p>}
          </div>
          <p className="text-[16px] font-semibold text-[#F7F4EE] flex-shrink-0">
            ₦{(p.price_kobo / 100).toLocaleString("en-NG", { maximumFractionDigits: 0 })}
          </p>
          <ArrowUpRight className="w-4 h-4 text-white/30 flex-shrink-0 group-hover:text-[#F7F4EE] transition-colors" />
        </Link>
      ))}
    </div>
  );
}

function LagosCarouselProducts({ products }: { products: StorefrontProduct[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory -mx-1 px-1">
      {products.map((p, i) => (
        <div key={p.id} className="snap-start flex-shrink-0 w-[200px] sm:w-[240px]">
          <LagosProductCard product={p} index={i} />
        </div>
      ))}
    </div>
  );
}

// ── Collections strip ─────────────────────────────────────────────────────────

function LagosCollections({ collections, sec }: { collections: NonNullable<Props["collections"]>; sec: NonNullable<ThemeConfig["sections"]> }) {
  const format = sec.collections?.format ?? "grid";
  const title = sec.collections?.title || "Shop by collection";

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h2 className="text-[22px] font-semibold tracking-tight text-[#F7F4EE] mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        {title}
      </h2>
      {format === "split" ? (
        <div className="flex flex-col gap-0 border-t border-white/10">
          {collections.map(col => (
            <Link key={col.id} href={`/collections/${col.slug ?? col.id}`} style={{ textDecoration: "none" }}
              className="flex items-center gap-4 py-4 border-b border-white/10 hover:bg-white/3 transition-colors group">
              <div className="w-16 h-16 flex-shrink-0 overflow-hidden border border-white/10">
                {col.image_url
                  ? <img src={col.image_url} alt={col.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  : <div className="w-full h-full flex items-center justify-center" style={{ background: "#1a1a1a" }}><Layers className="w-5 h-5 text-white/20" /></div>
                }
              </div>
              <p className="flex-1 text-[15px] font-semibold text-[#F7F4EE]">{col.name}</p>
              <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-[#F7F4EE] transition-colors" />
            </Link>
          ))}
        </div>
      ) : (
        <div className={`grid gap-4 ${format === "bento" ? "grid-cols-2 sm:grid-cols-3" : `grid-cols-${Math.min(sec.collections?.columns ?? 3, collections.length)}`}`}>
          {collections.map((col, idx) => (
            <Link key={col.id} href={`/collections/${col.slug ?? col.id}`}
              className={`relative overflow-hidden group ${format === "bento" && idx === 0 ? "col-span-2 row-span-2" : ""}`}
              style={{ aspectRatio: format === "bento" && idx === 0 ? "2/1" : "1/1", textDecoration: "none" }}>
              {col.image_url
                ? <img src={col.image_url} alt={col.name} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity" />
                : <div className="absolute inset-0 flex items-center justify-center" style={{ background: "#1a1a1a" }}><Layers className="w-8 h-8 text-white/20" /></div>
              }
              <div className="absolute inset-0 border border-white/10" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />
              <div className="absolute bottom-3 left-3">
                <p className="text-white font-semibold text-[13px]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{col.name}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Newsletter section ──────────────────────────────────────────────────────

function LagosNewsletterSection({
  storeId, sec, accent,
}: {
  storeId: string;
  sec: NonNullable<NonNullable<ThemeConfig["sections"]>["newsletter"]>;
  accent: string;
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
    <section className="border-t border-white/8 px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: accent }}>
          {sec.eyebrow ?? "Newsletter"}
        </p>
        <h2 className="text-[26px] font-semibold text-[#F7F4EE] mb-3 leading-tight"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {sec.headline ?? "Stay in the loop"}
        </h2>
        <p className="text-[13px] text-white/45 mb-7">{sec.subtext ?? "Get updates on new arrivals and exclusive deals."}</p>
        {status === "success" ? (
          <div className="flex items-center justify-center gap-2 rounded-none py-3 text-[13px] font-semibold border border-white/10 text-white/70">
            ✓ You&apos;re subscribed — thank you!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={sec.placeholder ?? "Enter your email"}
              className="flex-1 border border-white/15 bg-transparent px-4 py-3 text-[13px] text-white outline-none placeholder:text-white/30 focus:border-white/30 transition-colors"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-7 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-80"
              style={{ background: accent }}
            >
              {status === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        )}
        {status === "error" && (
          <p className="mt-2 text-[12px] text-red-400">Something went wrong. Please try again.</p>
        )}
      </div>
    </section>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function LagosHome({ store, themeConfig, products = [], collections = [] }: Props) {
  const storeName = store?.name ?? "Our Store";
  const sec = themeConfig?.sections;
  const accent = themeConfig?.colors?.primary ?? "#C75D3A";

  const heroLayout = sec?.hero?.layout ?? "split";
  const heroEnabled = sec?.hero?.enabled !== false;
  const carouselStyle = sec?.hero?.carouselStyle ?? "normal";
  const carouselAnimation = sec?.hero?.carouselAnimation ?? "slide";
  const slides = sec?.hero?.carouselSlides ?? [];

  const featLayout = sec?.featured?.layout ?? "grid";
  const displayProducts = products.slice(0, sec?.featured?.count ?? 7);

  return (
    <div>
      {/* ── Announcement ─────────────────────────────────── */}
      {sec?.announcement?.enabled && (
        <div style={{ background: sec.announcement.bgColor ?? "#1A1A1A", color: sec.announcement.textColor ?? "#fff" }}
          className="py-2 px-6 text-center text-[11px] font-semibold tracking-[0.05em]">
          {sec.announcement.text}
        </div>
      )}

      {/* ── Hero ─────────────────────────────────────────── */}
      {heroEnabled && (
        <>
          {heroLayout === "carousel" && (
            <>
              {slides.length === 0 ? (
                <LagosSplitHero storeName={storeName} sec={sec ?? {}} accent={accent} />
              ) : carouselStyle === "editorial" ? (
                <LagosEditorialCarousel storeName={storeName} slides={slides} accent={accent} />
              ) : (
                <LagosStandardCarousel storeName={storeName} slides={slides} animation={carouselAnimation} />
              )}
            </>
          )}
          {heroLayout === "full-bleed" && <LagosFullBleedHero storeName={storeName} sec={sec ?? {}} accent={accent} />}
          {heroLayout === "centered" && <LagosCenteredHero storeName={storeName} sec={sec ?? {}} accent={accent} />}
          {heroLayout === "split" && <LagosSplitHero storeName={storeName} sec={sec ?? {}} accent={accent} />}
        </>
      )}

      {/* ── Collections ──────────────────────────────────── */}
      {sec?.collections?.enabled && collections.length > 0 && (
        <LagosCollections collections={collections} sec={sec} />
      )}

      {/* ── Featured products ─────────────────────────────── */}
      {(sec ? sec.featured?.enabled : true) && (
        <section className="mx-auto max-w-7xl px-6 pb-24 pt-16">
          <div className="mb-8 flex items-baseline justify-between">
            <h2 className="text-[28px] font-semibold tracking-tight text-[#F7F4EE]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {sec?.featured?.title || "New arrivals"}
            </h2>
            <Link href="/shop" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/50 no-underline hover:text-[#F7F4EE] transition-colors">
              Shop all →
            </Link>
          </div>

          {displayProducts.length > 0 ? (
            <>
              {featLayout === "bento" && <LagosBentoProducts products={displayProducts} />}
              {featLayout === "split" && <LagosSplitProducts products={displayProducts} />}
              {featLayout === "carousel" && <LagosCarouselProducts products={displayProducts} />}
              {featLayout === "grid" && <LagosGridProducts products={displayProducts} />}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-4 border border-white/10">
              <Package className="h-10 w-10 text-white/20" />
              <p className="text-[16px] font-semibold text-white/50">{storeName} is setting up</p>
              <p className="text-[13px] text-white/30">Products are on their way — check back soon.</p>
            </div>
          )}
        </section>
      )}

      {/* ── Newsletter signup ──────────────────────────── */}
      {sec?.newsletter?.enabled && store?.id && (
        <LagosNewsletterSection storeId={store.id} sec={sec.newsletter} accent={accent} />
      )}

      {/* ── CTA band ─────────────────────────────────────── */}
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
    </div>
  );
}
