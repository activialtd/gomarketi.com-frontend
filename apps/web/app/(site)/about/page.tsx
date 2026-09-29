import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/site/anim/Reveal";
import { Mark } from "@/components/site/brand/Mark";
import { btnGhostLight, btnLime, eyebrow, heading } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "About — GoMarket",
  description:
    "GoMarket brings Nigeria's markets to the people who shop them, without asking traders to change how they trade.",
};

const PRINCIPLES = [
  {
    title: "The trader keeps their name",
    body: "Every order is from a named stall, not an anonymous warehouse. Buyers see who they bought from, and traders build a reputation that belongs to them.",
  },
  {
    title: "Money moves when goods do",
    body: "A trader's earnings are held until the buyer confirms the order arrived. It protects the buyer without asking the trader to carry the risk of a stranger's doubt.",
  },
  {
    title: "One trip, not five",
    body: "Vendors deliver to our hub and we make a single run to the buyer. It is cheaper for everyone and takes vehicles off roads that do not need them.",
  },
  {
    title: "Nothing to learn",
    body: "A trader who can use a phone can use GoMarket. No inventory systems, no jargon, no training course before the first sale.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Reveal />

      {/* Header */}
      <section className="relative overflow-hidden bg-ink pt-32 pb-20 md:pt-40 md:pb-28">
        <Mark className="pointer-events-none absolute -top-20 -right-20 w-[420px] text-lime/[0.07] md:w-[560px]" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-[12px] font-bold tracking-[0.16em] text-lime uppercase">
            About
          </p>
          <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-display)] text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.98] font-extrabold tracking-[-0.03em] text-white">
            The market is not the problem. Getting there is.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/70">
            Nigerian markets are some of the best-stocked places to shop
            anywhere — deeper range, better prices, and traders who know their
            goods. What they ask of you is a morning, a drive and a walk between
            stalls. GoMarket keeps the first part and removes the second.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="bg-background py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
            <h2 className={`${heading} text-foreground`} data-reveal="left">
              Why we built it
            </h2>
            <div className="space-y-6" data-reveal="lines">
              <p className="text-xl leading-relaxed text-foreground">
                Online shopping in Nigeria mostly means choosing between a big
                retailer&apos;s catalogue and a stranger on social media. The
                market — where most people actually buy — was never really
                online at all.
              </p>
              <p className="text-lg leading-relaxed text-muted">
                Not because traders are unwilling. Because the tools asked them
                to become something else: a logistics company, a customer
                service desk, a payments processor. Most traders want to trade.
              </p>
              <p className="text-lg leading-relaxed text-muted">
                So GoMarket takes on the parts that are not trading. The vendor
                confirms an order and brings it to our hub. We check it, pack it
                with everything else that buyer ordered, and deliver once. The
                trader does what they have always done, and reaches people who
                could never have made the trip.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="bg-surface py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl" data-reveal="up">
            <p className={eyebrow}>What we hold to</p>
            <h2 className={`mt-5 ${heading} text-foreground`}>
              Four things we will not trade away.
            </h2>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-border md:grid-cols-2">
            {PRINCIPLES.map((p, i) => (
              <div
                key={p.title}
                className="bg-surface p-8 md:p-10"
                data-reveal="up"
                data-reveal-delay={i * 0.07}
              >
                <span className="font-[family-name:var(--font-display)] text-2xl font-extrabold text-primary-accent tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl font-bold text-foreground">
                  {p.title}
                </h3>
                <p className="mt-3 leading-relaxed text-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Close */}
      <section className="bg-ink py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <Mark className="mx-auto w-14 text-lime" data-reveal="scale" />
          <h2
            className="mt-10 font-[family-name:var(--font-display)] text-[clamp(1.9rem,4vw,3rem)] leading-[1.05] font-extrabold tracking-[-0.02em] text-white"
            data-reveal="up"
          >
            Built in Lagos, for the way Lagos shops.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/70" data-reveal="up">
            We started with the markets we know best and the traders who were
            willing to try something new. There is a lot more of the country to
            reach.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4" data-reveal="up">
            <Link href="/vendors" className={btnLime}>
              Sell on GoMarket
            </Link>
            <Link href="/contact" className={btnGhostLight}>
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
