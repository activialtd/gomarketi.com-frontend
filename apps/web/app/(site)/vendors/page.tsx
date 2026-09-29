import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/site/anim/Reveal";
import { Mark } from "@/components/site/brand/Mark";
import { btnGhostDark, btnGhostLight, btnLime, eyebrow, heading } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Sell on GoMarket — for market traders",
  description:
    "Put your stall online, reach buyers across the city, set your own delivery prices, and get paid to your bank account.",
};

const BENEFITS = [
  {
    title: "A storefront of your own",
    body: "Your stall gets its own page carrying your name, your logo and your colours. Share the link the way you already share your number.",
  },
  {
    title: "Buyers who are already looking",
    body: "People search for what they need — fabric, tomatoes, a charger — and your stall appears because you sell it, not because you paid to be first.",
  },
  {
    title: "Orders in one place",
    body: "See what has been ordered, confirm what you have, and bring it to the hub. Every order is tracked from the moment it is placed.",
  },
  {
    title: "Your delivery, your price",
    body: "Set the areas you deliver to and what each one costs, in your own words. Buyers see your prices at checkout and choose one.",
  },
  {
    title: "Money to your bank",
    body: "Earnings appear in your wallet and you withdraw to your account. No waiting for a monthly settlement you did not agree to.",
  },
  {
    title: "Staff without sharing your password",
    body: "Add the people who help you run the stall, each with their own login and only the access they need.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Create your account",
    body: "Your name, your phone number and the market you trade in. It takes a few minutes.",
  },
  {
    n: "02",
    title: "Set up your stall",
    body: "Add your shop name, a logo if you have one, and the delivery areas you cover.",
  },
  {
    n: "03",
    title: "List what you sell",
    body: "A photo, a price and a short description for each item. Add more whenever you like.",
  },
  {
    n: "04",
    title: "Start receiving orders",
    body: "Confirm each order, bring it to the hub, and collect your money once the buyer confirms.",
  },
];

const REQUIREMENTS = [
  "A stall or shop in a market we serve",
  "A phone number that reaches you during trading hours",
  "A bank account in your name or your business name",
  "A valid means of identification for verification",
];

export default function VendorsPage() {
  return (
    <>
      <Reveal />

      {/* Header */}
      <section className="relative overflow-hidden bg-ink pt-32 pb-20 md:pt-40 md:pb-28">
        <Mark className="pointer-events-none absolute -right-16 -bottom-24 w-[400px] text-lime/[0.07] md:w-[540px]" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-[12px] font-bold tracking-[0.16em] text-lime uppercase">
                For traders
              </p>
              <h1 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.98] font-extrabold tracking-[-0.03em] text-white">
                Sell to the whole city from the stall you already have.
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/70">
                You keep trading the way you always have. We bring you the
                buyers who cannot make it to the market, and handle everything
                that happens after the sale.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/contact" className={btnLime}>
                  Open a store
                </Link>
                <Link href="#how-to-start" className={btnGhostLight}>
                  How to start
                </Link>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/10">
              {[
                { k: "You set", v: "Your prices" },
                { k: "You set", v: "Your delivery areas" },
                { k: "We handle", v: "The delivery run" },
                { k: "We handle", v: "Payment and payout" },
              ].map((stat) => (
                <div key={stat.v} className="bg-ink p-6">
                  <dt className="text-[11px] font-bold tracking-[0.14em] text-white/40 uppercase">
                    {stat.k}
                  </dt>
                  <dd className="mt-2 font-[family-name:var(--font-display)] text-lg leading-snug font-bold text-lime">
                    {stat.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-background py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl" data-reveal="up">
            <p className={eyebrow}>What you get</p>
            <h2 className={`mt-5 ${heading} text-foreground`}>
              Everything the stall cannot do on its own.
            </h2>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-border md:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b, i) => (
              <div
                key={b.title}
                className="bg-background p-8"
                data-reveal="up"
                data-reveal-delay={(i % 3) * 0.07}
              >
                <Mark className="w-7 text-primary-accent" />
                <h3 className="mt-6 font-[family-name:var(--font-display)] text-lg font-bold text-foreground">
                  {b.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to start */}
      <section id="how-to-start" className="bg-surface py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl" data-reveal="up">
            <p className={eyebrow}>Getting started</p>
            <h2 className={`mt-5 ${heading} text-foreground`}>
              Four steps to your first order.
            </h2>
          </div>

          <ol className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-border md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li
                key={s.n}
                className="bg-surface p-8"
                data-reveal="up"
                data-reveal-delay={i * 0.07}
              >
                <span className="font-[family-name:var(--font-display)] text-3xl font-extrabold text-primary-accent tabular-nums">
                  {s.n}
                </span>
                <h3 className="mt-5 font-[family-name:var(--font-display)] text-lg font-bold text-foreground">
                  {s.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Requirements */}
      <section id="requirements" className="bg-background py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div data-reveal="left">
              <p className={eyebrow}>What you need</p>
              <h2 className={`mt-5 ${heading} text-foreground`}>
                The short list.
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
                Verification protects buyers and the traders who do this
                properly. It is a one-time check, and we will walk you through
                it.
              </p>
              <Link href="/contact" className={`mt-10 ${btnGhostDark}`}>
                Ask a question first
              </Link>
            </div>

            <ul className="space-y-px overflow-hidden rounded-3xl bg-border">
              {REQUIREMENTS.map((r, i) => (
                <li
                  key={r}
                  className="flex items-center gap-5 bg-background p-7"
                  data-reveal="right"
                  data-reveal-delay={i * 0.06}
                >
                  <Mark className="w-6 shrink-0 text-primary-accent" />
                  <span className="text-lg text-foreground">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Close */}
      <section className="bg-ink py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <h2
            className="font-[family-name:var(--font-display)] text-[clamp(1.9rem,4vw,3rem)] leading-[1.05] font-extrabold tracking-[-0.02em] text-white"
            data-reveal="up"
          >
            Your next customer is stuck in traffic somewhere.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/70" data-reveal="up">
            Open your store today and they can buy from you before they get
            home.
          </p>
          <div className="mt-10 flex justify-center" data-reveal="up">
            <Link href="/contact" className={btnLime}>
              Open a store
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
