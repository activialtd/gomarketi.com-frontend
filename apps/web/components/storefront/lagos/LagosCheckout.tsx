"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Lock,
  ShoppingBag,
  Loader2,
  AlertCircle,
  X as XIcon,
} from "lucide-react";
import { PaystackModal } from "@/components/storefront/PaystackModal";
import {
  useCheckout,
  fmtNaira,
  NIGERIAN_STATES,
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
    allDigital,
    deliveryPaidLater,
    deliveryZone,
    setDeliveryZone,
    deliveryZones,
    storeReady,
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

  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const shopUrl = "/shop";
  const accent = "var(--store-primary, #22C55E)";
  const inputCls = (err?: boolean) =>
    `w-full h-12 px-4 rounded-[10px] border text-[13px] outline-none text-white bg-white/[0.03] placeholder:text-white/30 transition-colors focus:bg-white/[0.06] focus:border-white/30 ${
      err ? "border-red-500/50" : "border-white/10"
    }`;

  const filteredZones = deliveryZones.filter((z) =>
    z.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const shippingLabel =
    shipping === 0
      ? "Free"
      : deliveryPaidLater
        ? `${fmtNaira(shipping)} on delivery`
        : fmtNaira(shipping);

  const placeDisabled = isPlacing || !storeReady;
  const submit = handleSubmit(onSubmit);

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-md mx-auto px-5 py-24 text-center">
          <div className="w-16 h-16 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center mx-auto mb-6">
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
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="max-w-md w-full px-5 py-24 text-center">
          <ShoppingBag className="w-10 h-10 mx-auto mb-4 text-white/20" />
          <p className="text-base font-bold mb-2">Your cart is empty</p>
          <p className="text-sm text-white/50 mb-5">
            Add some products before checking out.
          </p>
          <Link
            href={shopUrl}
            className="text-white font-bold text-sm border-b border-white/40 pb-0.5"
          >
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-24 lg:pb-20">
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

        <div className="grid gap-8 lg:gap-10 lg:grid-cols-[1fr_400px]">
          {/* Form */}
          <form onSubmit={submit} className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Checkout
              </h1>
              <span className="text-[11px] font-semibold text-white/40">
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
              <p className="text-[11px] font-medium text-amber-400 mt-1.5 flex items-center gap-1.5 bg-amber-400/10 p-2.5 rounded-lg border border-amber-400/20">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Please enter a valid email and phone number so the vendor can
                contact you regarding your order.
              </p>
            </Section>

            <Section step={2} title="Delivery details" accent={accent}>
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

            {!allDigital && (
              <Section step={3} title="Shipping method" accent={accent}>
                <button
                  type="button"
                  onClick={() => setIsShippingModalOpen(true)}
                  className="w-full text-left rounded-[10px] border border-white/20 bg-white/[0.05] p-4 hover:bg-white/[0.08] transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="text-[13px] font-semibold text-white">
                      {deliveryZone.name}
                    </p>
                    <p className="text-[11px] text-white/60 mt-0.5 line-clamp-1">
                      {deliveryZone.note}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-bold text-white">
                      {fmtNaira(deliveryZone.feeKobo)}
                    </span>
                    <ChevronLeft className="w-4 h-4 text-white/40 rotate-180" />
                  </div>
                </button>
                {deliveryPaidLater && (
                  <p className="text-[11px] text-white/50">
                    You pay the delivery fee to the dispatch rider when your
                    order arrives.
                  </p>
                )}
              </Section>
            )}

            <Section
              step={allDigital ? 3 : 4}
              accent={accent}
              title={
                <>
                  Order note{" "}
                  <span className="font-medium text-white/40">(optional)</span>
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
          </form>

          {/* Summary */}
          <aside className="w-full">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 lg:sticky lg:top-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[13px] font-extrabold">Order summary</p>
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
                <Row label="Delivery" value={shippingLabel} />
                <div className="flex items-baseline justify-between pt-3 mt-1 border-t border-white/10">
                  <span className="text-[13px] font-extrabold">
                    {deliveryPaidLater ? "Pay now" : "Total"}
                  </span>
                  <span className="text-xl font-black text-white">
                    {fmtNaira(total)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={submit}
                disabled={placeDisabled}
                className="mt-6 w-full h-12 rounded-xl bg-white text-black text-sm font-extrabold flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-white/90 active:scale-[0.99] transition-all"
              >
                {isPlacing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                {isPlacing ? "Placing order…" : `Pay ${fmtNaira(total)}`}
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

      {isShippingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white text-black w-full max-w-[420px] rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
              <h2 className="text-[17px] font-bold text-gray-900">
                Select delivery area
              </h2>
              <button
                type="button"
                onClick={() => setIsShippingModalOpen(false)}
                aria-label="Close"
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <input
                type="text"
                placeholder="Search areas"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-[14px] outline-none placeholder:text-gray-400 focus:border-green-500 transition-colors"
              />
            </div>

            <div className="flex-1 overflow-y-auto max-h-[50vh] sm:max-h-[400px]">
              {filteredZones.map((zone) => {
                const isSelected = deliveryZone.id === zone.id;
                return (
                  <button
                    type="button"
                    key={zone.id}
                    className={`w-full text-left flex items-start gap-3 p-5 border-b border-gray-100 transition-colors hover:bg-gray-50 ${
                      isSelected ? "bg-green-50/30" : ""
                    }`}
                    onClick={() => {
                      setDeliveryZone(zone);
                      setSearchQuery("");
                      setIsShippingModalOpen(false);
                    }}
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? "border-green-600" : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 bg-green-600 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-[14px] font-bold text-gray-900">
                          {zone.name}
                        </p>
                        <p className="text-[14px] font-extrabold text-gray-900 shrink-0">
                          {fmtNaira(zone.feeKobo)}
                        </p>
                      </div>
                      <p className="text-[12px] text-gray-500 mt-1 leading-snug pr-4">
                        {zone.note}
                      </p>
                    </div>
                  </button>
                );
              })}
              {filteredZones.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No delivery areas found.
                </div>
              )}
            </div>
          </div>
        </div>
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
    <div className="mb-6 sm:mb-8">
      <p className="text-[13px] font-extrabold text-white/90 mb-4 flex items-center gap-2.5">
        <span
          className="w-5 h-5 rounded-full text-white text-[10px] font-extrabold flex items-center justify-center shrink-0"
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
      <label className="text-[11px] font-semibold text-white/50 block mb-1.5">
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
