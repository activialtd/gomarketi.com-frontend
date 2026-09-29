import Link from "next/link";
import { Mark } from "../brand/Mark";

const COLUMNS = [
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/support", label: "Support" },
      { href: "/help", label: "Help centre" },
    ],
  },
  {
    title: "Sell",
    links: [
      { href: "/vendors", label: "Open a store" },
      { href: "/vendors#how-to-start", label: "How to start" },
      { href: "/vendors#requirements", label: "What you need" },
    ],
  },
  {
    title: "Policies",
    links: [
      { href: "/shipping", label: "Shipping" },
      { href: "/returns", label: "Returns" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/cookies", label: "Cookies" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <Mark className="w-11 text-lime" title="GoMarket" />
          <p className="mt-5 max-w-xs text-lg leading-snug font-bold text-white font-[family-name:var(--font-display)]">
            Your market, without the trip.
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
            Order from the traders you already buy from. One delivery brings
            everything to your door.
          </p>
          <a
            href="mailto:hello@gomarketi.com"
            className="mt-5 inline-block text-sm font-semibold text-lime underline underline-offset-4 hover:text-white"
          >
            hello@gomarketi.com
          </a>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/40">
              {col.title}
            </h2>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-lime"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-white/60 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} GoMarket. All rights reserved.</p>
          <p>Powered by Activia</p>
        </div>
      </div>
    </footer>
  );
}
