import Link from "next/link";
import type { Metadata } from "next";
import { AwningEdge } from "@/components/site/WaitlistForm";

export const metadata: Metadata = {
  title: "About | GoMarketi",
  description: "Why we're putting Nigeria's market stalls online, and what we hold ourselves to.",
};

const PRINCIPLES = [
  {
    title: "The trader stays the owner",
    body: "Vendors set their prices, keep their customers and get a storefront of their own. We're the road to the market, not a replacement for it.",
  },
  {
    title: "Money moves when goods do",
    body: "A buyer's payment is held until they confirm delivery, so trust doesn't depend on already knowing someone.",
  },
  {
    title: "Built for here",
    body: "Prices in naira, search that understands Nigerian English, and delivery planned around how real markets run.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-14 md:pt-24 md:pb-20">
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl">
            Markets already work. Getting to them is the hard part.
          </h1>
        </div>
      </section>
      <AwningEdge />

      <section>
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1fr_2fr] md:py-24">
          <h2 className="text-xl font-bold text-foreground">Why GoMarketi</h2>
          <div className="max-w-2xl space-y-5 text-lg leading-relaxed text-muted">
            <p>
              Nigerian markets are some of the best-stocked places to shop
              anywhere. Prices are fair, traders know their goods, and whatever
              you need is usually two stalls away.
            </p>
            <p>
              What gets in the way is everything around the market: the
              traffic, the heat, the day off work, and not knowing which stall
              has it today.
            </p>
            <p>
              GoMarketi puts those stalls online without changing how they run.
              Traders keep their shops. Buyers search the way they would ask a
              trader. We handle the part in between: collecting, checking and
              delivering.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">What we hold to</h2>
          <dl className="mt-12 grid gap-10 md:grid-cols-3">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="border-t-2 border-primary pt-5">
                <dt className="text-lg font-bold text-foreground">{p.title}</dt>
                <dd className="mt-3 leading-relaxed text-muted">{p.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-primary text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-14 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-xl font-bold leading-snug">
            GoMarketi is built in Nigeria, on infrastructure by Activia.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/#waitlist"
              className="inline-flex rounded-md bg-white px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Join the waitlist
            </Link>
            <Link
              href="/support"
              className="inline-flex rounded-md border-2 border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
