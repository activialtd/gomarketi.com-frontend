"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { IconClose, IconMenu } from "../Icons";
import { Mark } from "../brand/Mark";

/**
 * The logo sits in the middle, with the navigation split around it. On the
 * home page the bar starts transparent over the dark hero and turns solid as
 * soon as the visitor scrolls; every other page starts solid, because their
 * headers are light.
 */

const LEFT_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/vendors", label: "For vendors" },
];

const RIGHT_LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const ALL_LINKS = [...LEFT_LINKS, ...RIGHT_LINKS];

/**
 * Pages that open with a dark full-bleed header and leave room for the bar to
 * sit over it. Everywhere else — legal pages, help, storefronts — the bar is
 * sticky and in flow, so their content is not hidden underneath it.
 */
const OVERLAY_ROUTES = ["/", "/about", "/vendors", "/contact"];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const overlay = OVERLAY_ROUTES.includes(pathname);
  const overHero = overlay && !scrolled;

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The overlay keeps the page underneath from scrolling while it is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Stagger the overlay's links in. Reduced motion skips straight to the end.
  useEffect(() => {
    if (!open || !menuRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-menu-item]", {
        opacity: 0,
        y: 28,
        duration: 0.5,
        stagger: 0.06,
        ease: "power3.out",
      });
    }, menuRef);
    return () => ctx.revert();
  }, [open]);

  const isActive = (href: string) => !href.includes("#") && pathname === href;

  const linkClass = (href: string) =>
    [
      "group relative px-1 py-2 text-[13px] font-semibold tracking-wide uppercase transition-colors",
      focusRing,
      overHero
        ? "text-white/75 hover:text-white"
        : isActive(href)
          ? "text-primary"
          : "text-muted hover:text-primary",
    ].join(" ");

  const underline = (href: string) =>
    [
      "absolute -bottom-0.5 left-0 h-[2px] bg-lime transition-all duration-300",
      isActive(href) ? "w-full" : "w-0 group-hover:w-full",
    ].join(" ");

  return (
    <>
      <header
        className={[
          "inset-x-0 top-0 z-50 transition-all duration-300",
          overlay ? "fixed" : "sticky",
          overHero
            ? "bg-transparent"
            : "border-b border-border bg-background/85 backdrop-blur-md",
        ].join(" ")}
      >
        <nav
          aria-label="Main"
          className={[
            "mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 transition-all duration-300 sm:px-8",
            scrolled ? "h-16" : "h-20",
          ].join(" ")}
        >
          {/* Left — navigation on desktop, menu button on mobile */}
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label="Open menu"
              className={`-ml-2 rounded-md p-2 md:hidden ${focusRing} ${
                overHero ? "text-white" : "text-primary"
              }`}
            >
              <IconMenu className="h-6 w-6" />
            </button>

            <ul className="hidden items-center gap-8 md:flex">
              {LEFT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass(link.href)}>
                    {link.label}
                    <span className={underline(link.href)} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Centre — the mark */}
          <Link
            href="/"
            aria-label="GoMarket home"
            className={`group flex items-center justify-center rounded-lg px-3 ${focusRing}`}
          >
            <Mark
              className={[
                "w-9 transition-all duration-300 group-hover:scale-105 sm:w-10",
                overHero ? "text-lime" : "text-primary",
              ].join(" ")}
            />
            <span className="sr-only">GoMarket</span>
          </Link>

          {/* Right — navigation and the call to action */}
          <div className="flex items-center justify-end gap-8">
            <ul className="hidden items-center gap-8 md:flex">
              {RIGHT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass(link.href)}>
                    {link.label}
                    <span className={underline(link.href)} />
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/#get-the-app"
              className={[
                // Hidden on the smallest screens: the centre mark needs the
                // room, and the overlay menu carries the same action.
                "hidden sm:inline-flex items-center whitespace-nowrap rounded-full px-5 py-2.5 text-[13px] font-bold tracking-wide uppercase transition-all duration-300",
                focusRing,
                overHero
                  ? "bg-lime text-ink hover:bg-white"
                  : "bg-primary text-white hover:bg-primary-soft",
              ].join(" ")}
            >
              Get the app
            </Link>
          </div>
        </nav>
      </header>

      {/* Mobile overlay */}
      {open && (
        <div
          ref={menuRef}
          id="site-menu"
          className="fixed inset-0 z-50 flex flex-col bg-ink px-6 py-6 md:hidden"
        >
          <div className="flex items-center justify-between">
            <Mark className="w-10 text-lime" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className={`rounded-md p-2 text-white ${focusRing}`}
            >
              <IconClose className="h-6 w-6" />
            </button>
          </div>

          <ul className="mt-12 flex flex-col gap-2">
            {ALL_LINKS.map((link) => (
              <li key={link.href} data-menu-item>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-auto" data-menu-item>
            <Link
              href="/#get-the-app"
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center rounded-full bg-lime px-6 py-4 text-sm font-bold tracking-wide text-ink uppercase"
            >
              Get the app
            </Link>
            <p className="mt-5 text-sm text-white/50">
              Lagos markets, delivered in one trip.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
