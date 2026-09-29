import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/site/anim/Reveal";
import { ContactForm } from "@/components/site/ContactForm";
import { Mark } from "@/components/site/brand/Mark";
import { eyebrow, heading } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Contact — GoMarket",
  description:
    "Talk to the GoMarket team about shopping, opening a store, an order you placed, or working together.",
};

const CHANNELS = [
  {
    title: "General enquiries",
    detail: "hello@gomarketi.com",
    href: "mailto:hello@gomarketi.com",
    body: "Anything about the product, the company or the press.",
  },
  {
    title: "Traders",
    detail: "vendors@gomarketi.com",
    href: "mailto:vendors@gomarketi.com",
    body: "Opening a store, verification, payouts and delivery prices.",
  },
  {
    title: "An order you placed",
    detail: "support@gomarketi.com",
    href: "mailto:support@gomarketi.com",
    body: "Where an order is, what arrived, and anything that went wrong.",
  },
];

export default function ContactPage() {
  return (
    <>
      <Reveal />

      {/* Header */}
      <section className="relative overflow-hidden bg-ink pt-32 pb-20 md:pt-40 md:pb-24">
        <Mark className="pointer-events-none absolute -top-16 -left-20 w-[380px] text-lime/[0.06] md:w-[480px]" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-[12px] font-bold tracking-[0.16em] text-lime uppercase">
            Contact
          </p>
          <h1 className="mt-5 max-w-3xl font-[family-name:var(--font-display)] text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.98] font-extrabold tracking-[-0.03em] text-white">
            Tell us what you need.
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/70">
            Whether you are shopping, selling, or just want to understand how
            this works — a person reads every message, usually the same working
            day.
          </p>
        </div>
      </section>

      {/* Channels */}
      <section className="bg-background pt-20 md:pt-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-px overflow-hidden rounded-3xl bg-border md:grid-cols-3">
            {CHANNELS.map((c, i) => (
              <a
                key={c.title}
                href={c.href}
                className="group bg-background p-8 transition-colors hover:bg-surface"
                data-reveal="up"
                data-reveal-delay={i * 0.07}
              >
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-foreground">
                  {c.title}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  {c.body}
                </p>
                <p className="mt-5 inline-flex items-center gap-2 text-[15px] font-bold text-primary">
                  {c.detail}
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="bg-background py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr]">
            <div data-reveal="left">
              <p className={eyebrow}>Write to us</p>
              <h2 className={`mt-5 ${heading} text-foreground`}>
                Send a message.
              </h2>
              <p className="mt-6 max-w-sm text-lg leading-relaxed text-muted">
                Give us enough detail to be useful — if it is about an order,
                the order number helps us find it straight away.
              </p>

              <div className="mt-10 rounded-2xl border border-border bg-surface p-7">
                <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-foreground">
                  Are you a trader?
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">
                  Read what you need before you start, then open a store.
                </p>
                <Link
                  href="/vendors"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary underline underline-offset-4 hover:text-primary-soft"
                >
                  Selling on GoMarket →
                </Link>
              </div>
            </div>

            <div data-reveal="right">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Where we are */}
      <section className="bg-ink py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-10">
            <div>
              <p className="text-[12px] font-bold tracking-[0.16em] text-lime uppercase">
                Where we are
              </p>
              <p className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold text-white md:text-3xl">
                Lagos, Nigeria
              </p>
              <p className="mt-3 max-w-md text-white/60">
                Our hub sits close to the markets we serve, which is what makes
                a single delivery run possible.
              </p>
            </div>
            <Mark className="w-20 text-lime/30 md:w-28" data-parallax="-30" />
          </div>
        </div>
      </section>
    </>
  );
}
