"use client";

import Link from "next/link";
import {
  ChevronLeft,
  Lock,
  ShoppingBag,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { PaystackModal } from "@/components/storefront/PaystackModal";
import {
  useCheckout,
  fmtNaira,
  NIGERIAN_STATES,
  FREE_SHIPPING_THRESHOLD_KOBO,
  type CheckoutProps,
} from "../checkout/useCheckout";

export default function LagosCheckout(props: CheckoutProps) {
  const {
    form: {
      register,
      handleSubmit,
      formState: { errors },
    },
    lines,
    subtotal,
    shipping,
    total,
    isPlacing,
    orderPlaced,
    orderNumber,
    orderError,
    showPaystack,
    pendingCustomer,
    setShowPaystack,
    onSubmit,
    handlePaystackSuccess,
  } = useCheckout(props);

  const shopUrl = "/shop";
  const accent = "var(--store-primary, #22C55E)";
  const inputCls = (err?: boolean) =>
    `w-full h-12 px-4 rounded-[10px] border text-[13px] outline-none text-white bg-white/[0.03] placeholder:text-white/30 transition-colors focus:bg-white/[0.06] focus:border-white/30 ${
      err ? "border-red-500/50" : "border-white/10"
    }`;

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-md mx-auto px-5 py-24 text-center">
          <div
            className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke={accent}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2">
            Order placed
          </h1>
          <p className="text-sm text-white/60 mb-1">
            Your order <strong className="text-white">{orderNumber}</strong> has
            been received.
          </p>
          <p className="text-xs text-white/50 mb-8">
            A confirmation is on its way to your inbox.
          </p>
          <Link
            href={shopUrl}
            className="inline-flex items-center gap-2 bg-white text-black rounded-xl px-6 py-3 text-sm font-extrabold hover:bg-white/90 transition-colors"
          >
            Continue shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-md mx-auto px-5 py-24 text-center">
          <ShoppingBag className="w-10 h-10 mx-auto mb-4 text-white/20" />
          <p className="text-base font-bold mb-2">Your cart is empty</p>
          <p className="text-sm text-white/50 mb-5">
            Add some products before checking out.
          </p>
          <Link
            href={shopUrl}
            className="text-white font-bold text-sm border-b border-white/40 pb-0.5"
          >
            Browse products →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-5 pt-6 pb-20">
        <Link
          href={shopUrl}
          className="inline-flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Continue shopping
        </Link>

        {orderError && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-[10px] px-4 py-3 mb-5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <p className="text-xs text-red-300">{orderError}</p>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex items-baseline gap-3 mb-8">
              <h1 className="text-3xl font-black tracking-tight">Checkout</h1>
              <span className="text-[11px] font-semibold text-white/40 uppercase tracking-[0.12em]">
                {lines.length} item{lines.length !== 1 && "s"}
              </span>
            </div>

            <Section step={1} title="Contact information" accent={accent}>
              <Field label="Full name" error={errors.fullName?.message}>
                <input
                  className={inputCls(!!errors.fullName)}
                  placeholder="Your full name"
                  {...register("fullName")}
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Email address" error={errors.email?.message}>
                  <input
                    className={inputCls(!!errors.email)}
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                  />
                </Field>
                <Field label="Phone number" error={errors.phone?.message}>
                  <input
                    className={inputCls(!!errors.phone)}
                    type="tel"
                    placeholder="08031234567"
                    {...register("phone")}
                  />
                </Field>
              </div>
              <p className="text-[11px] text-white/40 mt-1">
                We&apos;ll use this to send order updates and coordinate
                delivery.
              </p>
            </Section>

            <Section step={2} title="Delivery address" accent={accent}>
              <Field label="Street address" error={errors.address?.message}>
                <input
                  className={inputCls(!!errors.address)}
                  placeholder="House number, street name"
                  {...register("address")}
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="City" error={errors.city?.message}>
                  <input
                    className={inputCls(!!errors.city)}
                    placeholder="e.g. Surulere"
                    {...register("city")}
                  />
                </Field>
                <Field label="State" error={errors.state?.message}>
                  <select
                    className={inputCls(!!errors.state)}
                    defaultValue=""
                    {...register("state")}
                  >
                    <option value="" disabled className="bg-neutral-900">
                      Select state
                    </option>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s} className="bg-neutral-900">
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </Section>

            <Section
              step={3}
              accent={accent}
              title={
                <>
                  Order note{" "}
                  <span className="normal-case tracking-normal font-medium text-white/40">
                    (optional)
                  </span>
                </>
              }
            >
              <textarea
                rows={3}
                className="w-full rounded-[10px] border border-white/10 bg-white/[0.03] text-[13px] p-4 outline-none text-white placeholder:text-white/30 resize-none leading-relaxed focus:border-white/30 focus:bg-white/[0.06] transition-colors"
                placeholder="Delivery instructions, gift message, etc."
                {...register("note")}
              />
            </Section>

            <button
              type="submit"
              disabled={isPlacing}
              className="lg:hidden w-full h-12 rounded-xl bg-white text-black text-sm font-extrabold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isPlacing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {isPlacing
                ? "Placing order…"
                : `Place order · ${fmtNaira(total)}`}
            </button>
          </form>

          {/* Summary */}
          <aside>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 lg:sticky lg:top-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[12px] font-extrabold uppercase tracking-[0.12em]">
                  Order summary
                </p>
                <span className="text-[11px] text-white/40">
                  {lines.length} item{lines.length !== 1 && "s"}
                </span>
              </div>

              <div className="flex flex-col gap-3 mb-5 max-h-[260px] overflow-y-auto pr-1">
                {lines.map((line) => (
                  <div key={line.lineId} className="flex gap-3">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-white/5 border border-white/10">
                      {line.productImage && (
                        <img
                          src={line.productImage}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-white text-black text-[10px] font-extrabold flex items-center justify-center">
                        {line.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white leading-tight truncate">
                        {line.productName}
                      </p>
                      {line.isDigital && (
                        <p className="text-[10px] text-white/40 mt-0.5">
                          Digital download
                        </p>
                      )}
                    </div>
                    <p className="text-xs font-bold text-white shrink-0">
                      {fmtNaira(line.unitPrice * line.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 flex flex-col gap-2.5">
                <Row label="Subtotal" value={fmtNaira(subtotal)} />
                <Row
                  label="Shipping"
                  value={shipping === 0 ? "Free" : fmtNaira(shipping)}
                />
                {shipping > 0 && (
                  <p
                    className="text-[10px] font-semibold"
                    style={{ color: accent }}
                  >
                    Add {fmtNaira(FREE_SHIPPING_THRESHOLD_KOBO - subtotal)} more
                    for free shipping
                  </p>
                )}
                <div className="flex items-baseline justify-between pt-3 mt-1 border-t border-white/10">
                  <span className="text-[12px] font-extrabold uppercase tracking-[0.12em]">
                    Total
                  </span>
                  <span className="text-xl font-black text-white">
                    {fmtNaira(total)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isPlacing}
                className="hidden lg:flex mt-6 w-full h-12 rounded-xl bg-white text-black text-sm font-extrabold items-center justify-center gap-2 disabled:opacity-60 hover:bg-white/90 active:scale-[0.99] transition-all"
              >
                {isPlacing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                {isPlacing ? "Placing order…" : "Place order"}
              </button>

              <p className="text-[10px] text-white/40 text-center mt-3 flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3" /> Secure checkout via Paystack
              </p>
            </div>
          </aside>
        </div>
      </div>

      {showPaystack && pendingCustomer && (
        <PaystackModal
          amount={total}
          email={pendingCustomer.email}
          storeName={props.storeName ?? "GoMarketi Store"}
          onSuccess={handlePaystackSuccess}
          onClose={() => setShowPaystack(false)}
        />
      )}
    </div>
  );
}

function Section({
  step,
  title,
  accent,
  children,
}: {
  step: number;
  title: React.ReactNode;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <p className="text-[12px] font-extrabold text-white/90 mb-4 flex items-center gap-2.5 uppercase tracking-[0.1em]">
        <span
          className="w-5 h-5 rounded-full text-white text-[10px] font-extrabold flex items-center justify-center"
          style={{ background: accent }}
        >
          {step}
        </span>
        {title}
      </p>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-white/50 block mb-1.5 uppercase tracking-[0.1em]">
        {label}
      </label>
      {children}
      {error && (
        <div className="flex items-center gap-1 mt-1.5">
          <AlertCircle className="w-3 h-3 shrink-0 text-red-400" />
          <p className="text-[11px] text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs text-white/60">
      <span>{label}</span>
      <span className="text-white/90 font-medium">{value}</span>
    </div>
  );
}
