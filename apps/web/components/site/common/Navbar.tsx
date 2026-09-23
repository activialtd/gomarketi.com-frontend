"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IconClose, IconMenu, Logo } from "../Icons";

const LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#vendors", label: "For vendors" },
  { href: "/about", label: "About" },
  { href: "/support", label: "Support" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever the route changes
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => !href.includes("#") && pathname === href;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"
      >
        <Link
          href="/"
          className={`rounded-md ${focusRing}`}
          aria-label="GoMarketi home"
        >
          <Logo />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${focusRing} ${
                    active
                      ? "text-foreground underline decoration-primary-soft decoration-2 underline-offset-8"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/#waitlist"
            className={`hidden rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-soft md:inline-flex ${focusRing}`}
          >
            Join the waitlist
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className={`rounded-md p-2 text-foreground md:hidden ${focusRing}`}
          >
            {open ? (
              <IconClose className="h-6 w-6" />
            ) : (
              <IconMenu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-border md:hidden">
          <ul className="mx-auto max-w-6xl px-6 py-3">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`block rounded-md py-3 text-base font-medium ${focusRing} ${
                    isActive(link.href) ? "text-foreground" : "text-muted"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2 pb-3">
              <Link
                href="/#waitlist"
                onClick={() => setOpen(false)}
                className={`flex w-full justify-center rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white ${focusRing}`}
              >
                Join the waitlist
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
