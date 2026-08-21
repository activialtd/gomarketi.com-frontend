"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  CreditCard,
  Truck,
  Store,
  User,
  Shield,
  Mail,
} from "lucide-react";

type FAQ = { q: string; a: string };
type Category = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  faqs: FAQ[];
};

const CATEGORIES: Category[] = [
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingBag,
    faqs: [
      {
        q: "How do I place an order?",
        a: "Search or ask for what you want on the home screen, tap a product, choose any variants and quantity, then Add to cart. From your cart tap Checkout, confirm your delivery address and phone, then pay. You'll be taken to a live tracking screen automatically.",
      },
      {
        q: "Can I cancel an order after placing it?",
        a: "If the vendor hasn't accepted your order yet, you can cancel it from the order screen for a full refund. Once preparation starts, cancellation isn't automatic — contact support through the app and we'll do our best to help.",
      },
      {
        q: "Can I edit an order I've already placed?",
        a: "You can't edit an order once it's placed, but you can cancel (if the vendor hasn't accepted yet) and start a new one with the corrected items.",
      },
      {
        q: "How do I reorder something?",
        a: "Open Orders, find the past order you want to repeat, and tap Reorder. Every item lands back in your cart at the current price — adjust quantities or remove things you don't need before checking out.",
      },
    ],
  },
  {
    id: "delivery",
    label: "Delivery",
    icon: Truck,
    faqs: [
      {
        q: "How long does delivery take?",
        a: "It depends on the vendor and your distance. Most food, grocery, and pharmacy orders arrive within 0–4 hours. Larger items or inter-city deliveries can take 2–5 business days. The exact window is shown at checkout before you pay.",
      },
      {
        q: "How much does delivery cost?",
        a: "Delivery fees are set by each vendor based on distance and order size. The final fee is shown at checkout — no hidden charges. Some vendors offer free delivery above a minimum order value.",
      },
      {
        q: "My order is late — what do I do?",
        a: "First check the tracking screen — the courier's live location and updated ETA are there. If the courier is more than 30 minutes past ETA, tap Help → Report a problem in the app with your order number and we'll investigate.",
      },
      {
        q: "How do I track my order?",
        a: "From Orders tab, tap your active order. You'll see the courier's live position on the map, their ETA, and a timeline showing which stage you're at: Confirmed → Preparing → On the way → Delivered.",
      },
    ],
  },
  {
    id: "payments",
    label: "Payments & refunds",
    icon: CreditCard,
    faqs: [
      {
        q: "What payment methods do you accept?",
        a: "Card (debit or credit), bank transfer, and mobile wallet — all handled securely by Paystack. Card details are entered on Paystack's secure page and never touch GoMarketi's servers.",
      },
      {
        q: "I was charged but no order appeared.",
        a: "Payments occasionally take a minute to reflect. Wait 5 minutes and refresh your Orders tab. If it still hasn't appeared, contact support with the payment reference from your bank SMS and we'll trace it immediately.",
      },
      {
        q: "How do I request a refund?",
        a: "Open Orders, tap the affected order, then Report a problem. Choose what went wrong, add a photo if you can, and submit. Straightforward cases (missing item, damaged product) are usually approved the same day. See our Returns & Refunds policy for full details.",
      },
      {
        q: "How long do refunds take?",
        a: "Once approved: 3–7 business days back to a card, 1–3 days to a bank account, or instant if you choose GoMarketi wallet credit instead.",
      },
    ],
  },
  {
    id: "account",
    label: "Your account",
    icon: User,
    faqs: [
      {
        q: "How do I create an account?",
        a: "Open the app and choose Continue with Google, Continue with Apple, or Sign up with email. If you use email you'll verify with a 6-digit code sent to your inbox.",
      },
      {
        q: "I forgot my password.",
        a: "On the sign-in screen, tap Forgot password. A reset link is sent to your registered email. If you signed up with Google or Apple, use that button — there's no password to reset.",
      },
      {
        q: "How do I change my delivery address?",
        a: "Profile → Addresses. You can save multiple addresses (home, work, family) and switch between them at checkout.",
      },
      {
        q: "How do I delete my account?",
        a: "Settings → Privacy → Delete account. Deletion is permanent. If you have pending orders or unresolved refunds, you'll need to resolve those first — the app will show a message explaining why.",
      },
    ],
  },
  {
    id: "vendors",
    label: "Selling on GoMarketi",
    icon: Store,
    faqs: [
      {
        q: "How do I sign up as a vendor?",
        a: "Go to vendor.gomarketi.com and create an account. You'll verify your email, set up your store (name, category, address), pick a plan (or start free), and can begin adding products immediately. To receive payouts you'll need to complete KYC — you can do this at signup or later.",
      },
      {
        q: "What does it cost to sell?",
        a: "Free to start — no credit card required, up to 20 products. Paid plans (Starter ₦5,000/mo, Growth ₦15,000/mo, Scale ₦35,000/mo) unlock more products, custom domains, team members, and advanced features. Full comparison on our pricing page.",
      },
      {
        q: "When do I get paid?",
        a: "Payouts settle to your linked bank account daily by default. You can switch to weekly or on-demand in Settings → Payouts. Withdrawals require completed KYC.",
      },
      {
        q: "How do I add products?",
        a: "From the dashboard, tap Add Product. Upload up to 5 photos, enter name, price, category, and description. If your product comes in variants (sizes, colours), add each with its own price and stock level. Save and it goes live on your storefront immediately.",
      },
    ],
  },
  {
    id: "safety",
    label: "Safety & privacy",
    icon: Shield,
    faqs: [
      {
        q: "Is my payment information secure?",
        a: "Yes. All payments are processed by Paystack, a licensed and PCI-compliant payment processor. Card details are entered on their secure page and never stored on GoMarketi's servers — we only see the last four digits for your reference.",
      },
      {
        q: "What data does GoMarketi collect about me?",
        a: "Only what's needed to run your account and process orders — name, contact details, delivery addresses, order history, and (with permission) approximate location. See our Privacy Policy for the full breakdown.",
      },
      {
        q: "Can I opt out of promotional messages?",
        a: "Yes. Settings → Notifications, then toggle off Promotional offers. You'll still receive essential order updates.",
      },
      {
        q: "Someone is claiming to be from GoMarketi and asking for my PIN.",
        a: "Never share your PIN, full card number, or password with anyone — including someone claiming to be from GoMarketi. We will never ask for these. If someone contacts you asking for this information, report it to support@gomarketi.com immediately.",
      },
    ],
  },
];

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Filter FAQs by search query and category, preserving category structure
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATEGORIES.filter(
      (c) => activeCategory === "all" || c.id === activeCategory,
    )
      .map((cat) => ({
        ...cat,
        faqs: q
          ? cat.faqs.filter(
              (f) =>
                f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q),
            )
          : cat.faqs,
      }))
      .filter((cat) => cat.faqs.length > 0);
  }, [query, activeCategory]);

  const totalResults = filtered.reduce((n, c) => n + c.faqs.length, 0);
  const searching = query.trim().length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Hero band ── */}
      <header className="border-b border-border bg-primary text-white">
        <div className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
          <p className="text-xs font-semibold tracking-[0.2em] text-white/60">
            HELP CENTER
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            How can we help?
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80">
            Search our answers, or browse by category below. Can't find what you
            need? Reach out — we usually reply within 24 hours.
          </p>

          {/* Search */}
          <div className="mt-8 flex items-center gap-3 rounded-full bg-white px-5 py-3 shadow-lg">
            <Search className="h-5 w-5 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search help articles…"
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
              aria-label="Search help articles"
            />
            {query.length > 0 && (
              <button
                onClick={() => setQuery("")}
                className="text-xs font-medium text-muted hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
        {/* Category chips */}
        <div className="mb-10 flex flex-wrap gap-2">
          <CategoryChip
            label="All topics"
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
          />
          {CATEGORIES.map((c) => (
            <CategoryChip
              key={c.id}
              label={c.label}
              active={activeCategory === c.id}
              onClick={() => setActiveCategory(c.id)}
            />
          ))}
        </div>

        {/* Results summary */}
        {searching && (
          <p className="mb-6 text-sm text-muted">
            {totalResults === 0
              ? `No matches for "${query}"`
              : `${totalResults} result${totalResults > 1 ? "s" : ""} for "${query}"`}
          </p>
        )}

        {/* FAQ groups */}
        {filtered.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          <div className="space-y-12">
            {filtered.map((cat) => {
              const Icon = cat.icon;
              return (
                <section key={cat.id}>
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {cat.label}
                    </h2>
                  </div>

                  <div className="divide-y divide-border rounded-2xl border border-border bg-white">
                    {cat.faqs.map((f, i) => (
                      <FAQItem
                        key={`${cat.id}-${i}`}
                        question={f.q}
                        answer={f.a}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* ── Contact block ── */}
        <div className="mt-16 rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Still need help?
              </h3>
              <p className="mt-1 text-sm text-muted">
                Our team responds to every message — usually within 24 hours.
              </p>
            </div>

            <a
              href="mailto:support@gomarketi.com"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-soft"
            >
              <Mail className="h-4 w-4" />
              Contact support
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 border-t border-border pt-6 text-xs text-muted">
            <Link href="/legal/shipping" className="hover:text-primary">
              Shipping
            </Link>
            <Link href="/legal/returns" className="hover:text-primary">
              Returns & Refunds
            </Link>
            <Link href="/legal/privacy" className="hover:text-primary">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:text-primary">
              Terms
            </Link>
            <Link href="/legal/cookies" className="hover:text-primary">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────── UI bits ────────────────────── */

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-primary bg-primary text-white"
          : "border-border bg-white text-foreground hover:border-primary-soft hover:text-primary"
      }`}
    >
      {label}
    </button>
  );
}

/**
 * Accordion FAQ item. Uses <details>/<summary> — accessible by default,
 * no state needed, keyboard-friendly out of the box.
 */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer items-start justify-between gap-4 px-5 py-4 text-sm font-medium text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
        <span className="flex-1">{question}</span>
        <svg
          className="mt-0.5 h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-45"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </summary>
      <div className="px-5 pb-5 text-sm leading-relaxed text-muted">
        {answer}
      </div>
    </details>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white">
        <Search className="h-5 w-5 text-muted" />
      </div>
      <h3 className="text-base font-semibold text-foreground">
        No matches for "{query}"
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
        Try a different keyword, or reach out and we'll help directly.
      </p>

      <a
        href="mailto:support@gomarketi.com"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-soft"
      >
        <Mail className="h-4 w-4" />
        Email support
      </a>
    </div>
  );
}
