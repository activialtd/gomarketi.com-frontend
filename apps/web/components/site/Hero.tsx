"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Mark } from "./brand/Mark";

/**
 * Landing hero. The headline arrives a line at a time, the mark draws itself
 * behind the type, and the order cards settle in afterwards — one timeline on
 * load rather than on scroll, since this is the first thing anyone sees.
 */

const ORDER_CARDS = [
  {
    stall: "Mama Chidinma",
    market: "Mile 12 Market",
    item: "Tomatoes, one basket",
    price: "₦18,500",
  },
  {
    stall: "Emeka Electronics",
    market: "Computer Village",
    item: "USB-C charger, 65W",
    price: "₦12,000",
  },
  {
    stall: "Aisha Fabrics",
    market: "Balogun Market",
    item: "Ankara, six yards",
    price: "₦14,200",
  },
];

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from("[data-hero-eyebrow]", { opacity: 0, y: 16, duration: 0.6 })
        .from(
          "[data-hero-line]",
          { opacity: 0, yPercent: 110, duration: 1, stagger: 0.12 },
          "-=0.3",
        )
        .from("[data-hero-body]", { opacity: 0, y: 20, duration: 0.7 }, "-=0.5")
        .from(
          "[data-hero-cta]",
          { opacity: 0, y: 18, duration: 0.6, stagger: 0.08 },
          "-=0.4",
        )
        .from(
          "[data-hero-mark]",
          { opacity: 0, scale: 0.8, rotate: -12, duration: 1.4, ease: "expo.out" },
          "-=1.2",
        )
        .from(
          "[data-hero-card]",
          { opacity: 0, y: 40, duration: 0.8, stagger: 0.12 },
          "-=1",
        );

      // The cards keep drifting gently once they have landed, so the hero
      // never looks completely static.
      gsap.utils.toArray<HTMLElement>("[data-hero-card]").forEach((card, i) => {
        gsap.to(card, {
          y: i % 2 === 0 ? -10 : 10,
          duration: 3 + i * 0.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 1.6 + i * 0.2,
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-ink pt-28 pb-20 sm:pt-32 md:pt-40 md:pb-28"
    >
      {/* The mark, oversized and low-contrast, anchors the composition. */}
      <Mark
        data-hero-mark
        className="pointer-events-none absolute -top-16 -right-24 w-[420px] text-lime/[0.07] sm:w-[560px] lg:-top-24 lg:w-[720px]"
      />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-primary-soft/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p
            data-hero-eyebrow
            className="inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/10 px-4 py-1.5 text-[12px] font-bold tracking-[0.12em] text-lime uppercase"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-lime" />
            Now serving Lagos markets
          </p>

          <h1 className="mt-7 font-[family-name:var(--font-display)] text-[clamp(2.6rem,7vw,5rem)] leading-[0.95] font-extrabold tracking-[-0.03em] text-white">
            <span className="block overflow-hidden">
              <span data-hero-line className="block">
                Your market,
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-hero-line className="block text-lime">
                without the trip.
              </span>
            </span>
          </h1>

          <p
            data-hero-body
            className="mt-7 max-w-xl text-lg leading-relaxed text-white/70"
          >
            The traders you already buy from, now a tap away. Order across
            different stalls in one basket — vendors bring everything to our
            hub, we check it, and a single delivery brings it to your door.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              data-hero-cta
              href="/#get-the-app"
              className="inline-flex items-center rounded-full bg-lime px-7 py-4 text-sm font-bold tracking-wide text-ink uppercase transition-transform hover:-translate-y-0.5"
            >
              Get the app
            </Link>
            <Link
              data-hero-cta
              href="/vendors"
              className="inline-flex items-center rounded-full border border-white/25 px-7 py-4 text-sm font-bold tracking-wide text-white uppercase transition-colors hover:border-lime hover:text-lime"
            >
              Sell on GoMarket
            </Link>
          </div>
        </div>

        {/* A basket being assembled from three different stalls. */}
        <div className="relative lg:pl-8">
          <div className="space-y-4">
            {ORDER_CARDS.map((card) => (
              <article
                key={card.stall}
                data-hero-card
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-[family-name:var(--font-display)] text-base font-bold text-white">
                      {card.stall}
                    </p>
                    <p className="mt-0.5 text-[13px] text-lime">{card.market}</p>
                  </div>
                  <p className="shrink-0 font-[family-name:var(--font-display)] text-base font-bold text-white">
                    {card.price}
                  </p>
                </div>
                <p className="mt-3 text-sm text-white/60">{card.item}</p>
              </article>
            ))}
          </div>

          <div
            data-hero-card
            className="mt-4 flex items-center justify-between rounded-2xl bg-lime p-5"
          >
            <div>
              <p className="text-[12px] font-bold tracking-[0.12em] text-ink/60 uppercase">
                Three stalls
              </p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-extrabold text-ink">
                One delivery
              </p>
            </div>
            <Mark className="w-10 text-ink" />
          </div>
        </div>
      </div>
    </section>
  );
}
