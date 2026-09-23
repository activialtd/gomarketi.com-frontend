import Link from "next/link";
import type { Metadata } from "next";
import { MarketStalls } from "@/components/site/MarketStalls";
import { AwningEdge, WaitlistForm } from "@/components/site/WaitlistForm";
import { IconCheck } from "@/components/site/Icons";

export const metadata: Metadata = {
  title: "GoMarketi | The whole market, without the traffic",
  description:
    "Search Nigerian market stalls by voice or text. Vendors bring your items to our hub, we check everything, and deliver it in one trip.",
};

const STEPS = [
  {
    title: "Ask for it",
    body: "Type it or say it the way you would to a trader: red ankara, six yards, under fifteen thousand.",
  },
  {
    title: "Stalls confirm",
    body: "Vendors who have it confirm your order and set it aside for you.",
  },
  {
    title: "Checked at the hub",
    body: "Every vendor brings your items to our hub, where we check them and pack them together.",
  },
  {
    title: "One delivery",
    body: "Items from different stalls reach your door in a single trip.",
  },
  {
    title: "You confirm",
    body: "The vendor is paid only after you tell us it arrived.",
  },
];

const VENDOR_POINTS = [
  {
    title: "Your own storefront",
    body: "At yourstore.gomarketi.com, with your logo and your colours.",
  },
  {
    title: "Found in market search",
    body: "Buyers searching for what you sell see your stall.",
  },
  {
    title: "One dashboard for orders",
    body: "Confirm an order, get it to the hub, and we handle the rest.",
  },
  {
    title: "Paid to your bank",
    body: "Earnings clear when the buyer confirms and you withdraw straight to your account.",
  },
];

const btnPrimary =
  "inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const btnOutline =
  "inline-flex items-center justify-center rounded-md border-2 border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-16 pb-12 md:grid-cols-[1fr_1.05fr] md:pt-24 md:pb-16">
          <div>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              The whole market, without the traffic.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              Search market stalls across Nigeria by voice or text. Vendors
              bring your items to our hub, we check everything, and deliver it
              to you in one trip.
            </p>
            <div id="waitlist" className="mt-8 max-w-md scroll-mt-28">
              <WaitlistForm />
            </div>
            <p className="mt-4 text-sm text-muted">
              Coming to iOS and Android. Selling something?{" "}
              <Link
                href="/#vendors"
                className="font-semibold text-primary underline underline-offset-4"
              >
                Open a store
              </Link>
            </p>
          </div>

          <MarketStalls className="h-auto w-full" />
        </div>
      </section>
      <AwningEdge />

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-16">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="max-w-xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              From stall to doorstep
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Buy from as many stalls as you like. It still arrives as one
              order.
            </p>
          </div>

          <ol className="mt-14 grid gap-10 md:grid-cols-5 md:gap-6">
            {STEPS.map((step, i) => {
              const last = i === STEPS.length - 1;
              return (
                <li key={step.title}>
                  <div className="flex items-center">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary text-sm font-bold ${
                        last
                          ? "bg-primary text-white"
                          : "bg-background text-primary"
                      }`}
                    >
                      {i + 1}
                    </span>
                    {!last && (
                      <span
                        aria-hidden
                        className="ml-3 hidden flex-1 border-t-2 border-dashed border-primary/30 md:block"
                      />
                    )}
                  </div>
                  <h3 className="mt-5 font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {step.body}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Payment protection */}
      <section className="bg-primary text-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            You pay once. The vendor gets paid when you say it arrived.
          </h2>
          <dl className="space-y-8">
            <div>
              <dt className="font-bold">Held, not spent</dt>
              <dd className="mt-2 leading-relaxed text-white/75">
                Your payment stays with us while your order moves from stall to
                hub to your door.
              </dd>
            </div>
            <div>
              <dt className="font-bold">Refunds without chasing anyone</dt>
              <dd className="mt-2 leading-relaxed text-white/75">
                If a vendor cancels or never brings your item to the hub, your
                money goes back automatically.
              </dd>
            </div>
            <div>
              <dt className="font-bold">A team that steps in</dt>
              <dd className="mt-2 leading-relaxed text-white/75">
                Something wrong? Report it before you confirm delivery and we
                look into it while your payment stays on hold.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Vendors */}
      <section id="vendors" className="scroll-mt-16">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Keep your stall. Sell past closing time.
            </h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
              Run the same shop you run today. GoMarketi puts it online, sends
              buyers your way, and handles delivery from the hub.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {/* TODO: point this at the vendor signup route */}
              <Link href="/signup" className={btnPrimary}>
                Open your store
              </Link>
              <Link href="/support#selling" className={btnOutline}>
                How selling works
              </Link>
            </div>
          </div>

          <ul className="divide-y divide-border border-y border-border">
            {VENDOR_POINTS.map((point) => (
              <li key={point.title} className="flex gap-4 py-5">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-primary-soft">
                  <IconCheck className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h3 className="font-bold text-foreground">{point.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {point.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Be first in when we open.
            </h2>
            <p className="mt-2 text-muted">
              One email when we launch. Nothing else.
            </p>
          </div>
          <div className="w-full md:max-w-md">
            <WaitlistForm />
          </div>
        </div>
      </section>
    </>
  );
}
