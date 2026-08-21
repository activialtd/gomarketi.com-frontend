"use client";

import Link from "next/link";
import {
  ChevronLeft,
  Lock,
  ShoppingBag,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { PaystackModal } from "@/components/storefront/PaystackModal";
import {
  useCheckout,
  fmtNaira,
  NIGERIAN_STATES,
  FREE_SHIPPING_THRESHOLD_KOBO,
  type CheckoutProps,
} from "../checkout/useCheckout";

export default function EkoCheckout(props: CheckoutProps) {
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
  const inputCls = (err?: boolean) =>
    `w-full h-11 px-3.5 rounded-[10px] border-[1.5px] text-[13px] outline-none text-neutral-900 bg-neutral-50 transition-colors focus:border-[var(--store-primary,#1A7A42)] ${
      err ? "border-red-300" : "border-neutral-200"
    }`;

  if (orderPlaced) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--store-bg,#F0FAF3)] flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="var(--store-primary,#1A7A42)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-neutral-900 mb-2">
          Order placed!
        </h1>
        <p className="text-sm text-neutral-500 mb-1">
          Your order <strong className="text-neutral-900">{orderNumber}</strong>{" "}
          has been received.
        </p>
        <p className="text-xs text-neutral-500 mb-7">
          A confirmation is on its way to your email.
        </p>
        <Link
          href={shopUrl}
          className="inline-flex items-center gap-2 bg-[var(--store-primary,#1A7A42)] text-white rounded-xl px-6 py-3 text-sm font-extrabold"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <ShoppingBag className="w-10 h-10 mx-auto mb-4 text-neutral-300" />
        <p className="text-base font-bold text-neutral-900 mb-2">
          Your cart is empty
        </p>
        <p className="text-sm text-neutral-500 mb-5">
          Add some products before checking out.
        </p>
        <Link
          href={shopUrl}
          className="text-[var(--store-primary,#1A7A42)] font-bold text-sm"
        >
          Browse products →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-5 pt-6 pb-16">
      <Link
        href={shopUrl}
        className="inline-flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-neutral-900 mb-5"
      >
        <ChevronLeft className="w-4 h-4" /> Continue shopping
      </Link>

      {orderError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-[10px] px-4 py-3 mb-5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <p className="text-xs text-red-800">{orderError}</p>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight mb-6">
            Checkout
          </h1>

          <Section step={1} title="Contact information">
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
            <p className="text-[11px] text-neutral-400 mt-1">
              We&apos;ll use this to send order updates and coordinate delivery.
            </p>
          </Section>

          <Section step={2} title="Delivery address">
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
                  <option value="" disabled>
                    Select state
                  </option>
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Section>

          <Section
            step={3}
            title={
              <>
                Order note{" "}
                <span className="font-medium text-neutral-400">(optional)</span>
              </>
            }
          >
            <textarea
              rows={3}
              className="w-full rounded-[10px] border-[1.5px] border-neutral-200 bg-neutral-50 text-[13px] p-3.5 outline-none text-neutral-900 resize-none leading-relaxed focus:border-[var(--store-primary,#1A7A42)]"
              placeholder="Delivery instructions, gift message, etc."
              {...register("note")}
            />
          </Section>

          <button
            type="submit"
            disabled={isPlacing}
            className="lg:hidden w-full h-12 rounded-xl bg-[var(--store-primary,#1A7A42)] text-white text-sm font-extrabold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isPlacing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            {isPlacing ? "Placing order…" : `Place order · ${fmtNaira(total)}`}
          </button>
        </form>

        {/* Summary */}
        <aside>
          <div className="rounded-2xl border border-neutral-100 p-5 lg:sticky lg:top-6">
            <p className="text-sm font-extrabold text-neutral-900 mb-4">
              Order summary
            </p>

            <div className="flex flex-col gap-3 mb-4 max-h-[260px] overflow-y-auto">
              {lines.map((line) => (
                <div key={line.lineId} className="flex gap-2.5">
                  <div className="relative w-[52px] h-[52px] rounded-lg overflow-hidden shrink-0 bg-[var(--store-bg,#F0FAF3)]">
                    {line.productImage && (
                      <img
                        src={line.productImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-[var(--store-primary,#1A7A42)] text-white text-[10px] font-extrabold flex items-center justify-center">
                      {line.quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-neutral-900 leading-tight">
                      {line.productName}
                    </p>
                    {line.isDigital && (
                      <p className="text-[10px] text-neutral-400">
                        Digital download
                      </p>
                    )}
                  </div>
                  <p className="text-xs font-bold text-neutral-900 shrink-0">
                    {fmtNaira(line.unitPrice * line.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-100 pt-3 flex flex-col gap-2">
              <Row label="Subtotal" value={fmtNaira(subtotal)} />
              <Row
                label="Shipping"
                value={shipping === 0 ? "Free" : fmtNaira(shipping)}
              />
              {shipping > 0 && (
                <p className="text-[10px] text-[var(--store-primary,#1A7A42)] font-semibold">
                  Add {fmtNaira(FREE_SHIPPING_THRESHOLD_KOBO - subtotal)} more
                  for free shipping
                </p>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <span className="text-sm font-extrabold text-neutral-900">
                  Total
                </span>
                <span className="text-base font-black text-[var(--store-primary,#1A7A42)]">
                  {fmtNaira(total)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isPlacing}
              className="hidden lg:flex mt-5 w-full h-12 rounded-xl bg-[var(--store-primary,#1A7A42)] text-white text-sm font-extrabold items-center justify-center gap-2 disabled:opacity-60 shadow-[0_4px_14px_rgba(26,122,66,0.25)]"
            >
              {isPlacing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {isPlacing ? "Placing order…" : "Place order"}
            </button>

            <p className="text-[10px] text-neutral-400 text-center mt-3 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> Secure checkout via Paystack
            </p>
          </div>
        </aside>
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
  children,
}: {
  step: number;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-7">
      <p className="text-[13px] font-extrabold text-neutral-900 mb-3.5 flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-[var(--store-primary,#1A7A42)] text-white text-[11px] font-extrabold flex items-center justify-center">
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
      <label className="text-[11px] font-bold text-neutral-700 block mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <div className="flex items-center gap-1 mt-1.5">
          <AlertCircle className="w-3 h-3 shrink-0 text-red-600" />
          <p className="text-[11px] text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs text-neutral-500">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
