import Link from "next/link";
import type { Metadata } from "next";
import { Hero } from "@/components/site/Hero";
import { Reveal } from "@/components/site/anim/Reveal";
import { Mark } from "@/components/site/brand/Mark";
import { MarketMarquee } from "@/components/site/MarketMarquee";
import { btnGhostLight, btnLime } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "GoMarket — Shop your local market without the trip",
  description:
    "Order from the traders you already buy from. Vendors bring your items to our hub, we check them, and one delivery brings everything to your door.",
};

const STEPS = [
  {
    title: "Find the stall",
    body: "Search the way you would ask a trader — red ankara, six yards, under fifteen thousand. Results come from real stalls in markets you know.",
  },
  {
    title: "The vendor confirms",
    body: "Traders who have the item confirm your order and set it aside. You see who you are buying from before you pay.",
  },
  {
    title: "Checked at our hub",
    body: "Every vendor brings your items to the GoMarket hub, where we check each one against your order and pack them together.",
  },
  {
    title: "One delivery",
    body: "Items from three different stalls arrive at your door in a single trip, at a delivery price the vendor set upfront.",
  },
  {
    title: "You confirm, then they are paid",
    body: "A trader's earnings are released once you confirm the order arrived. Until then, the money stays with us.",
  },
];

const VENDOR_POINTS = [
  {
    title: "A storefront of your own",
    body: "Your stall online at your own address, carrying your name, your logo and your colours.",
  },
  {
    title: "Found by people searching",
    body: "Buyers looking for what you sell find your stall, whether or not they know your shop by name.",
  },
  {
    title: "Orders in one place",
    body: "Confirm an order, bring it to the hub, and the delivery is handled for you.",
  },
  {
    title: "Paid into your account",
    body: "Set your own delivery prices, watch your balance, and withdraw straight to your bank.",
  },
];

export default function HomePage() {
  return (
    <>
      <Reveal />
      <Hero />

      {/* 2 — The idea behind it */}
      <section className="bg-background py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div data-reveal="left">
              <p className="text-[12px] font-bold tracking-[0.16em] text-primary-soft uppercase">
                The idea
              </p>
              <h2 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-extrabold tracking-[-0.02em] text-foreground">
                A market day should not cost you a day.
              </h2>
            </div>

            <div className="space-y-7" data-reveal="lines">
              <p className="text-xl leading-relaxed text-foreground">
                Buying from the market means the traffic there, the walk between
                stalls, the haggling, and the traffic back — for a basket of
                things you buy every week.
              </p>
              <p className="text-lg leading-relaxed text-muted">
                GoMarket keeps the part that works. The same traders, the same
                prices you would negotiate at the stall, the same choice across
                a whole market. What it removes is the journey: you shop the
                stalls from your phone, and we bring the market to you.
              </p>
              <p className="text-lg leading-relaxed text-muted">
                This is not a supermarket with a delivery service attached. Every
                item comes from a named trader with a stall you could walk to,
                which is exactly why people trust what they buy there.
              </p>
            </div>
          </div>

          {/* Three contrasts, stated plainly. */}
          <div className="mt-20 grid gap-px overflow-hidden rounded-3xl bg-border md:grid-cols-3">
            {[
              {
                before: "A morning in traffic",
                after: "A few minutes on your phone",
              },
              {
                before: "Five stalls, five trips",
                after: "Five stalls, one delivery",
              },
              {
                before: "Hoping it is what you asked for",
                after: "Checked at our hub before it ships",
              },
            ].map((row, i) => (
              <div
                key={row.before}
                className="bg-background p-8"
                data-reveal="up"
                data-reveal-delay={i * 0.08}
              >
                <p className="text-sm text-muted line-through decoration-muted/40">
                  {row.before}
                </p>
                <p className="mt-3 font-[family-name:var(--font-display)] text-xl leading-snug font-bold text-foreground">
                  {row.after}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 — How it works */}
      <section id="how-it-works" className="bg-surface py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl" data-reveal="up">
            <p className="text-[12px] font-bold tracking-[0.16em] text-primary-soft uppercase">
              How it works
            </p>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-extrabold tracking-[-0.02em] text-foreground">
              From your basket to your door.
            </h2>
          </div>

          <ol className="mt-16 space-y-px overflow-hidden rounded-3xl bg-border">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="group grid gap-4 bg-surface p-8 transition-colors hover:bg-background md:grid-cols-[auto_1fr_1.4fr] md:items-baseline md:gap-10 md:p-10"
                data-reveal="up"
                data-reveal-delay={i * 0.06}
              >
                <span className="font-[family-name:var(--font-display)] text-3xl font-extrabold text-primary-accent tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-foreground md:text-2xl">
                  {step.title}
                </h3>
                <p className="leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4 — For vendors */}
      <section id="vendors" className="relative overflow-hidden bg-ink py-24 md:py-32">
        <Mark
          className="pointer-events-none absolute -bottom-24 -left-20 w-[380px] text-lime/[0.06] md:w-[520px]"
          data-parallax="-40"
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div data-reveal="left">
              <p className="text-[12px] font-bold tracking-[0.16em] text-lime uppercase">
                For traders
              </p>
              <h2 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-extrabold tracking-[-0.02em] text-white">
                Your stall, open to the whole city.
              </h2>
              <p className="mt-7 max-w-lg text-lg leading-relaxed text-white/70">
                The trader with the best fabric in Balogun should not lose a sale
                because a buyer could not face the drive. GoMarket puts your
                stall in front of people who are already looking for what you
                sell, and handles everything after the sale.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/vendors" className={btnLime}>
                  Open a store
                </Link>
                <Link href="/vendors#requirements" className={btnGhostLight}>
                  What you need
                </Link>
              </div>
            </div>

            <div className="grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2">
              {VENDOR_POINTS.map((point, i) => (
                <div
                  key={point.title}
                  className="bg-ink p-7"
                  data-reveal="up"
                  data-reveal-delay={i * 0.07}
                >
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-lime">
                    {point.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">
                    {point.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5 — Markets and the app */}
      <section id="get-the-app" className="bg-background py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl" data-reveal="up">
            <p className="text-[12px] font-bold tracking-[0.16em] text-primary-soft uppercase">
              Where we are
            </p>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-extrabold tracking-[-0.02em] text-foreground">
              The markets already on GoMarket.
            </h2>
          </div>
        </div>

        <div className="mt-14">
          <MarketMarquee />
        </div>

        <div className="mx-auto mt-20 max-w-7xl px-5 sm:px-8">
          <div
            className="relative overflow-hidden rounded-[2rem] bg-primary px-8 py-16 text-center md:px-16 md:py-20"
            data-reveal="scale"
          >
            <Mark className="pointer-events-none absolute -top-10 -right-10 w-64 text-white/[0.06]" />
            <h2 className="relative mx-auto max-w-3xl font-[family-name:var(--font-display)] text-[clamp(1.9rem,4vw,3rem)] leading-[1.05] font-extrabold tracking-[-0.02em] text-white">
              Shop your market this week without leaving the house.
            </h2>
            <p className="relative mx-auto mt-6 max-w-xl text-lg text-white/70">
              The app is where you browse stalls, place an order and track it to
              your door. Traders start on the web dashboard.
            </p>
            <div className="relative mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/contact" className={btnLime}>
                Get the app
              </Link>
              <Link href="/vendors" className={btnGhostLight}>
                Sell on GoMarket
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
