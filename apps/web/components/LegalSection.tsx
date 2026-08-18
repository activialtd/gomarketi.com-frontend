import { ReactNode } from "react";
import Link from "next/link";

export function LegalLayout({
  eyebrow,
  title,
  intro,
  updatedAt,
  toc,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updatedAt: string;
  toc: { id: string; label: string }[];
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header band — brand ink */}
      <header className="border-b border-border bg-primary text-white">
        <div className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
          <p className="text-xs font-semibold tracking-[0.2em] text-white/60">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80">
            {intro}
          </p>
          <p className="mt-6 text-xs text-white/60">
            Last updated: <span className="text-white/80">{updatedAt}</span>
          </p>
        </div>
      </header>

      {/* Body: TOC + content */}
      <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          {/* Sticky TOC on desktop */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted">
              On this page
            </p>
            <ul className="space-y-2 text-sm">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="block text-muted transition hover:text-primary"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          {/* Long-form content */}
          <article className="prose-policy space-y-10">{children}</article>
        </div>

        {/* Footer note */}
        <div className="mt-16 rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Questions?</span>{" "}
            <span className="text-muted">
              Reach us at{" "}
              <a
                href="mailto:support@gomarketi.com"
                className="text-primary underline underline-offset-2"
              >
                support@gomarketi.com
              </a>{" "}
              — we typically reply within 24 hours.
            </span>
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
            <Link href="/legal/shipping" className="hover:text-primary">
              Shipping
            </Link>
            <Link href="/legal/returns" className="hover:text-primary">
              Returns & Refunds
            </Link>
            <Link href="/legal/privacy" className="hover:text-primary">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PolicySection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted">
        {children}
      </div>
    </section>
  );
}
