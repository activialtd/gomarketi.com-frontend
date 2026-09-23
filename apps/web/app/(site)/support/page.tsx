import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AwningEdge } from "@/components/site/WaitlistForm";
import { IconBook, IconFlag, IconMail, IconPlus } from "@/components/site/Icons";

export const metadata: Metadata = {
  title: "Support | GoMarketi",
  description: "Answers for buyers and vendors, and how to reach the GoMarketi team.",
};

const FAQ = [
  {
    id: "buying",
    title: "Buying",
    items: [
      {
        q: "When am I charged?",
        a: "At checkout, through Paystack. The payment is held by GoMarketi and only released to the vendor after you confirm your order arrived.",
      },
      {
        q: "Why does my order go through a hub?",
        a: "When you buy from several stalls, each vendor brings their items to our hub. We check them and pack them together, so you get one delivery instead of several.",
      },
      {
        q: "What if a vendor can't fill my order?",
        a: "If a vendor cancels or doesn't bring your item to the hub, that part of your order is refunded to your original payment method automatically.",
      },
      {
        q: "Something arrived wrong or damaged. What now?",
        a: "Report it from your order page before you confirm delivery. Your payment stays on hold while our team reviews it.",
      },
    ],
  },
  {
    id: "selling",
    title: "Selling",
    items: [
      {
        q: "What do I need to open a store?",
        a: "An email address, your business details, and a BVN or NIN for identity checks. You choose a plan during setup.",
      },
      {
        q: "When do I get paid?",
        a: "When the buyer confirms delivery, the amount moves from pending to available in your wallet. You can then withdraw it to your bank account.",
      },
      {
        q: "Do I handle delivery?",
        a: "No. You confirm the order and get it to the hub. We deliver it to the buyer.",
      },
    ],
  },
];

const POLICIES = [
  { href: "/shipping", label: "Shipping" },
  { href: "/returns", label: "Returns" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
];

function ContactCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background p-6">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-surface text-primary">{icon}</span>
      <h2 className="mt-5 font-bold text-foreground">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-muted">{children}</div>
    </div>
  );
}

export default function SupportPage() {
  return (
    <>
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-14 md:pt-24 md:pb-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            How can we help?
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
            Find a quick answer below, or write to us and a person will reply.
          </p>
        </div>
      </section>
      <AwningEdge />

      <section>
        <div className="mx-auto grid max-w-6xl gap-5 px-6 py-14 md:grid-cols-3">
          <ContactCard icon={<IconMail className="h-5 w-5" />} title="Email us">
            <a
              href="mailto:hello@gomarketi.com"
              className="font-semibold text-primary underline underline-offset-4"
            >
              hello@gomarketi.com
            </a>
            <p className="mt-1">For anything about an order, a store or your account.</p>
          </ContactCard>

          <ContactCard icon={<IconBook className="h-5 w-5" />} title="Help center">
            <p>Step by step guides for buyers and vendors.</p>
            <Link href="/help" className="mt-1 inline-block font-semibold text-primary underline underline-offset-4">
              Browse guides
            </Link>
          </ContactCard>

          <ContactCard icon={<IconFlag className="h-5 w-5" />} title="Problem with an order?">
            <p>
              Open the order and report it before you confirm delivery. That
              keeps your payment on hold while we look into it.
            </p>
          </ContactCard>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[1fr_2fr] md:py-24">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Common questions</h2>

          <div className="space-y-14">
            {FAQ.map((group) => (
              <div key={group.id} id={group.id} className="scroll-mt-24">
                <h3 className="text-lg font-bold text-foreground">{group.title}</h3>
                <div className="mt-3 border-t border-border">
                  {group.items.map((item) => (
                    <details key={item.q} className="group border-b border-border">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-sm py-5 font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                        {item.q}
                        <IconPlus className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-45" />
                      </summary>
                      <p className="max-w-2xl pb-5 leading-relaxed text-muted">{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-bold text-foreground">Policies</h2>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {POLICIES.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="text-sm font-medium text-muted transition-colors hover:text-foreground">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
