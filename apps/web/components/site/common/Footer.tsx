import Link from "next/link";
import { IconClose, IconMenu, Logo } from "../Icons";

const COLUMNS = [
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/support", label: "Support" },
      { href: "/help", label: "Help center" },
    ],
  },
  {
    title: "Sell",
    links: [
      { href: "/#vendors", label: "Open a store" },
      { href: "/support#selling", label: "Getting paid" },
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
    <footer className="bg-primary text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <Logo inverted />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            Nigeria&apos;s markets, delivered in one trip.
          </p>
          <a
            href="mailto:hello@gomarketi.com"
            className="mt-4 inline-block text-sm font-semibold underline underline-offset-4 hover:text-white/80"
          >
            hello@gomarketi.com
          </a>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="text-sm font-semibold">{col.title}</h2>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
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
          <p>© {new Date().getFullYear()} GoMarketi. All rights reserved.</p>
          <p>Powered by Activia</p>
        </div>
      </div>
    </footer>
  );
}
