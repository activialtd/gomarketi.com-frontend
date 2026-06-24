import { Order } from "@/lib/data/orders";
import { OrderStatus, PaymentStatus } from "@gomarket/shared-types";
import { fmtNaira, PAYMENT_CFG } from "@gomarket/shared-utils";
import {
  Clock,
  RefreshCw,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronDown,
  MoreHorizontal,
  AlertCircle,
  Check,
  Copy,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Printer,
  Send,
  Star,
} from "lucide-react";
import { useState } from "react";

export const STATUS_CFG: Record<
  OrderStatus,
  { label: string; bg: string; color: string; icon: React.ElementType }
> = {
  pending: { label: "Pending", bg: "#fef3c7", color: "#92400e", icon: Clock },
  processing: {
    label: "Processing",
    bg: "#dbeafe",
    color: "#1e40af",
    icon: RefreshCw,
  },
  shipped: { label: "Shipped", bg: "#e0f2fe", color: "#0369a1", icon: Truck },
  delivered: {
    label: "Delivered",
    bg: "#dcfce7",
    color: "#15803d",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    bg: "#fee2e2",
    color: "#991b1b",
    icon: XCircle,
  },
  refunded: {
    label: "Refunded",
    bg: "#f3f4f6",
    color: "#374151",
    icon: RotateCcw,
  },
};

const METHOD_LABEL: Record<string, string> = {
  card: "Card",
  transfer: "Bank transfer",
  paystack: "Paystack",
  cash: "Cash on delivery",
  ussd: "USSD",
};

const SHIPPING_LABEL: Record<string, string> = {
  pickup: "Store pickup",
  delivery: "Standard delivery",
  express: "Express delivery",
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, bg, color } = STATUS_CFG[status];
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  );
}

function PayBadge({ status }: { status: PaymentStatus }) {
  const { label, bg, color } = PAYMENT_CFG[status];
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
  active,
  onClick,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3.5 rounded-[12px] border flex-1 min-w-0 text-left transition-all"
      style={{
        background: active ? "rgba(26,122,66,0.04)" : "#fff",
        borderColor: active ? "#1A7A42" : "#e2e8f0",
        outline: active ? "2px solid rgba(26,122,66,0.15)" : "none",
      }}
    >
      <div
        className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0"
        style={{ background: iconBg }}
      >
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
      </div>
      <div className="min-w-0">
        <p
          className="text-[20px] font-extrabold leading-tight"
          style={{ color: "#1C1C1C", letterSpacing: "-0.4px" }}
        >
          {value}
        </p>
        <p
          className="text-[10px] font-semibold uppercase tracking-wide truncate"
          style={{ color: "#94a3b8" }}
        >
          {label}
        </p>
        {sub && (
          <p
            className="text-[10px] mt-0.5 truncate"
            style={{ color: "#6b7280" }}
          >
            {sub}
          </p>
        )}
      </div>
    </button>
  );
}

export function UpdateOrderModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [note, setNote] = useState(order.note ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[16px] border shadow-xl overflow-hidden"
        style={{ background: "#fff", borderColor: "#e2e8f0" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: "#f1f5f9" }}
        >
          <div>
            <p
              className="text-[14px] font-extrabold"
              style={{ color: "#1C1C1C" }}
            >
              Update order
            </p>
            <p className="text-[11px]" style={{ color: "#6b7280" }}>
              {order.orderNumber} · {order.customer.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#f1f5f9] transition-colors"
          >
            <XCircle className="w-4 h-4" style={{ color: "#94a3b8" }} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Status */}
          <div className="space-y-1.5">
            <label
              className="text-[10px] font-extrabold uppercase block"
              style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}
            >
              Order status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                Object.entries(STATUS_CFG) as [
                  OrderStatus,
                  (typeof STATUS_CFG)[OrderStatus],
                ][]
              ).map(([val, cfg]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setStatus(val)}
                  className="flex items-center gap-2 px-3 py-2 rounded-[8px] border text-[12px] font-semibold text-left transition-all"
                  style={{
                    borderColor: status === val ? "#1A7A42" : "#e2e8f0",
                    background:
                      status === val ? "rgba(26,122,66,0.05)" : "#fafafa",
                    color: status === val ? "#1A7A42" : "#374151",
                  }}
                >
                  <cfg.icon className="w-3.5 h-3.5 shrink-0" />
                  {cfg.label}
                  {status === val && (
                    <div
                      className="ml-auto w-3.5 h-3.5 rounded-full flex items-center justify-center"
                      style={{ background: "#1A7A42" }}
                    >
                      <Check className="w-2 h-2 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tracking */}
          {(status === "shipped" || status === "delivered") && (
            <div className="space-y-1.5">
              <label
                className="text-[10px] font-extrabold uppercase block"
                style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}
              >
                Tracking number
              </label>
              <input
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="e.g. GIG-00144821"
                className="w-full h-[42px] px-3.5 rounded-[10px] border text-[13px] outline-none transition-all"
                style={{
                  borderColor: "#e2e8f0",
                  background: "#F0FAF3",
                  color: "#1C1C1C",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#1A7A42";
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.outline = "2px solid #1A7A42";
                  e.currentTarget.style.outlineOffset = "-2px";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.background = "#F0FAF3";
                  e.currentTarget.style.outline = "none";
                }}
              />
            </div>
          )}

          {/* Note */}
          <div className="space-y-1.5">
            <label
              className="text-[10px] font-extrabold uppercase block"
              style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}
            >
              Note to self (internal)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note visible only to you…"
              className="w-full px-3.5 py-2.5 rounded-[10px] border text-[13px] resize-none outline-none transition-all"
              style={{
                borderColor: "#e2e8f0",
                background: "#F0FAF3",
                color: "#1C1C1C",
                lineHeight: "1.5",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#1A7A42";
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.outline = "2px solid #1A7A42";
                e.currentTarget.style.outlineOffset = "-2px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.background = "#F0FAF3";
                e.currentTarget.style.outline = "none";
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-[10px] border text-[13px] font-semibold transition-colors"
              style={{
                borderColor: "#e2e8f0",
                background: "#fff",
                color: "#374151",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#F0FAF3")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 h-10 rounded-[10px] text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
              style={{
                background: "#0A2E1A",
                boxShadow: "0 2px 8px rgba(26,122,66,0.25)",
              }}
              onMouseOver={(e) =>
                !saving && (e.currentTarget.style.background = "#239452")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#0A2E1A")}
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" /> Save changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrderExpandedDetail({
  order,
  onUpdate,
}: {
  order: Order;
  onUpdate: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copyRef() {
    if (order.paymentRef) navigator.clipboard.writeText(order.paymentRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="px-4 pb-4 grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
      {/* ── Items ─────────────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-3">
        <p
          className="text-[10px] font-extrabold uppercase tracking-wide"
          style={{ color: "#94a3b8" }}
        >
          Items ordered
        </p>
        <div
          className="rounded-[10px] border divide-y overflow-hidden"
          style={{ borderColor: "#f1f5f9" }}
        >
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3">
              <div
                className="w-10 h-10 rounded-[7px] overflow-hidden shrink-0"
                style={{ background: "#F0FAF3" }}
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[13px] font-semibold truncate"
                  style={{ color: "#1C1C1C" }}
                >
                  {item.productName}
                </p>
                {item.variantLabel && (
                  <p className="text-[11px]" style={{ color: "#6b7280" }}>
                    {item.variantLabel}
                  </p>
                )}
                <p
                  className="text-[10px] font-mono mt-0.5"
                  style={{ color: "#94a3b8" }}
                >
                  SKU: {item.sku}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p
                  className="text-[13px] font-bold"
                  style={{ color: "#1C1C1C" }}
                >
                  {fmtNaira(item.totalPrice)}
                </p>
                <p className="text-[11px]" style={{ color: "#6b7280" }}>
                  × {item.quantity} @ {fmtNaira(item.unitPrice)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div
          className="rounded-[10px] border overflow-hidden"
          style={{ borderColor: "#f1f5f9" }}
        >
          {[
            { label: "Subtotal", value: fmtNaira(order.subtotal) },
            {
              label: "Shipping",
              value: order.shipping === 0 ? "Free" : fmtNaira(order.shipping),
            },
            ...(order.discount > 0
              ? [{ label: "Discount", value: `–${fmtNaira(order.discount)}` }]
              : []),
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between px-4 py-2.5 border-b last:border-0"
              style={{ borderColor: "#f9fafb" }}
            >
              <span className="text-[12px]" style={{ color: "#6b7280" }}>
                {row.label}
              </span>
              <span
                className="text-[12px] font-medium"
                style={{
                  color: row.label === "Discount" ? "#dc2626" : "#374151",
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
          <div
            className="flex items-center justify-between px-4 py-3 border-t"
            style={{ borderColor: "#e2e8f0", background: "#fafafa" }}
          >
            <span
              className="text-[13px] font-bold"
              style={{ color: "#1C1C1C" }}
            >
              Total
            </span>
            <span
              className="text-[15px] font-extrabold"
              style={{ color: "#1A7A42" }}
            >
              {fmtNaira(order.total)}
            </span>
          </div>
        </div>

        {/* Note */}
        {order.note && (
          <div
            className="flex items-start gap-2 px-3.5 py-2.5 rounded-[8px] text-[12px]"
            style={{
              background: "#fffbeb",
              border: "1px solid rgba(245,158,11,0.2)",
              color: "#92400e",
            }}
          >
            <AlertCircle
              className="w-3.5 h-3.5 shrink-0 mt-0.5"
              style={{ color: "#f59e0b" }}
            />
            <span>{order.note}</span>
          </div>
        )}
      </div>

      {/* ── Customer + shipping + payment ─────────────────── */}
      <div className="space-y-3">
        {/* Customer */}
        <div
          className="rounded-[10px] border p-3.5 space-y-2.5"
          style={{ borderColor: "#f1f5f9" }}
        >
          <p
            className="text-[10px] font-extrabold uppercase tracking-wide"
            style={{ color: "#94a3b8" }}
          >
            Customer
          </p>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white shrink-0"
              style={{ background: "#1A7A42" }}
            >
              {order.customer.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <p
                className="text-[13px] font-semibold"
                style={{ color: "#1C1C1C" }}
              >
                {order.customer.name}
              </p>
              {order.customer.isReturning && (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "#F0FAF3", color: "#1A7A42" }}
                >
                  Returning
                </span>
              )}
            </div>
          </div>
          {[
            { icon: Mail, text: order.customer.email },
            { icon: Phone, text: order.customer.phone },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 text-[11px]"
              style={{ color: "#6b7280" }}
            >
              <Icon
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: "#94a3b8" }}
              />
              {text}
            </div>
          ))}
        </div>

        {/* Shipping */}
        <div
          className="rounded-[10px] border p-3.5 space-y-2"
          style={{ borderColor: "#f1f5f9" }}
        >
          <p
            className="text-[10px] font-extrabold uppercase tracking-wide"
            style={{ color: "#94a3b8" }}
          >
            Shipping
          </p>
          <p className="text-[12px] font-semibold" style={{ color: "#374151" }}>
            {SHIPPING_LABEL[order.shippingMethod]}
          </p>
          {order.shippingAddress && (
            <div
              className="flex items-start gap-2 text-[11px]"
              style={{ color: "#6b7280" }}
            >
              <MapPin
                className="w-3.5 h-3.5 shrink-0 mt-0.5"
                style={{ color: "#94a3b8" }}
              />
              <span>
                {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.state}
              </span>
            </div>
          )}
          {order.trackingNumber && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-[11px] font-mono"
              style={{ background: "#F0FAF3", color: "#1A7A42" }}
            >
              <Truck className="w-3 h-3 shrink-0" />
              {order.trackingNumber}
            </div>
          )}
        </div>

        {/* Payment */}
        <div
          className="rounded-[10px] border p-3.5 space-y-2"
          style={{ borderColor: "#f1f5f9" }}
        >
          <p
            className="text-[10px] font-extrabold uppercase tracking-wide"
            style={{ color: "#94a3b8" }}
          >
            Payment
          </p>
          <div className="flex items-center justify-between">
            <p
              className="text-[12px] font-semibold"
              style={{ color: "#374151" }}
            >
              {METHOD_LABEL[order.paymentMethod]}
            </p>
            <PayBadge status={order.paymentStatus} />
          </div>
          {order.paymentRef && (
            <div className="flex items-center gap-1.5">
              <p
                className="text-[10px] font-mono truncate flex-1"
                style={{ color: "#6b7280" }}
              >
                {order.paymentRef}
              </p>
              <button
                type="button"
                onClick={copyRef}
                className="p-1 rounded-[4px] hover:bg-[#F0FAF3] transition-colors"
              >
                {copied ? (
                  <Check className="w-3 h-3" style={{ color: "#1A7A42" }} />
                ) : (
                  <Copy className="w-3 h-3" style={{ color: "#94a3b8" }} />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={onUpdate}
            className="flex items-center gap-2 h-9 px-3.5 rounded-[8px] text-white text-[12px] font-bold transition-all"
            style={{
              background: "#1A7A42",
              boxShadow: "0 2px 8px rgba(26,122,66,0.2)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#239452")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#1A7A42")}
          >
            <Edit3 className="w-3.5 h-3.5" /> Update order status
          </button>
          <div className="flex gap-1.5">
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-1.5 h-9 px-3 rounded-[8px] border text-[12px] font-semibold transition-colors"
              style={{
                borderColor: "#e2e8f0",
                background: "#fff",
                color: "#374151",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#F0FAF3")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
            >
              <Send className="w-3.5 h-3.5" /> Notify
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-1.5 h-9 px-3 rounded-[8px] border text-[12px] font-semibold transition-colors"
              style={{
                borderColor: "#e2e8f0",
                background: "#fff",
                color: "#374151",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#F0FAF3")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
            >
              <Printer className="w-3.5 h-3.5" /> Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrderRow({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);

  return (
    <>
      {/* Summary row */}
      <div
        className="border-b transition-colors cursor-pointer"
        style={{
          borderColor: "#f1f5f9",
          background: expanded ? "rgba(240,250,243,0.4)" : undefined,
        }}
        onMouseOver={(e) => {
          if (!expanded) e.currentTarget.style.background = "#fafafa";
        }}
        onMouseOut={(e) => {
          if (!expanded) e.currentTarget.style.background = "transparent";
        }}
      >
        <div
          className="hidden sm:grid items-center px-4 py-3.5"
          style={{
            gridTemplateColumns: "32px 1fr 120px 110px 110px 100px 36px",
            gap: "12px",
          }}
        >
          {/* Expand toggle */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-7 h-7 rounded-[6px] flex items-center justify-center transition-all"
            style={{
              background: expanded ? "#F0FAF3" : "#f1f5f9",
              color: expanded ? "#1A7A42" : "#94a3b8",
            }}
          >
            <ChevronDown
              className="w-4 h-4 transition-transform duration-200"
              style={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>

          {/* Customer + order no */}
          <div onClick={() => setExpanded((v) => !v)}>
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-bold" style={{ color: "#1C1C1C" }}>
                {order.orderNumber}
              </p>
              {order.customer.isReturning && (
                <Star
                  className="w-3 h-3"
                  style={{ color: "#f59e0b" }}
                  fill="#f59e0b"
                />
              )}
            </div>
            <p className="text-[11px]" style={{ color: "#6b7280" }}>
              {order.customer.name}
              <span className="ml-2" style={{ color: "#94a3b8" }}>
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </span>
            </p>
          </div>

          <div onClick={() => setExpanded((v) => !v)}>
            <p
              className="text-[13px] font-bold tabular-nums"
              style={{ color: "#1A7A42" }}
            >
              {fmtNaira(order.total)}
            </p>
            {order.discount > 0 && (
              <p className="text-[10px]" style={{ color: "#dc2626" }}>
                –{fmtNaira(order.discount)} off
              </p>
            )}
          </div>

          <div onClick={() => setExpanded((v) => !v)}>
            <StatusBadge status={order.status} />
          </div>

          <div onClick={() => setExpanded((v) => !v)}>
            <PayBadge status={order.paymentStatus} />
          </div>

          <div onClick={() => setExpanded((v) => !v)}>
            <p className="text-[11px]" style={{ color: "#6b7280" }}>
              {new Date(order.createdAt).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
              })}
            </p>
            <p className="text-[10px]" style={{ color: "#94a3b8" }}>
              {new Date(order.createdAt).toLocaleTimeString("en-NG", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setUpdateOpen(true)}
            className="w-7 h-7 rounded-[6px] flex items-center justify-center transition-colors hover:bg-[#F0FAF3]"
            title="Update order"
          >
            <MoreHorizontal className="w-4 h-4" style={{ color: "#94a3b8" }} />
          </button>
        </div>

        {/* Mobile row */}
        <div
          className="sm:hidden px-4 py-3.5"
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-[13px] font-bold" style={{ color: "#1C1C1C" }}>
              {order.orderNumber}
            </p>
            <div className="flex items-center gap-2">
              <StatusBadge status={order.status} />
              <ChevronDown
                className="w-4 h-4 transition-transform duration-200"
                style={{
                  color: "#94a3b8",
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[12px]" style={{ color: "#6b7280" }}>
              {order.customer.name}
            </p>
            <p className="text-[13px] font-bold" style={{ color: "#1A7A42" }}>
              {fmtNaira(order.total)}
            </p>
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div
          className="border-b"
          style={{
            borderColor: "#f1f5f9",
            background: "rgba(240,250,243,0.15)",
          }}
        >
          <OrderExpandedDetail
            order={order}
            onUpdate={() => setUpdateOpen(true)}
          />
        </div>
      )}

      {/* Update modal */}
      {updateOpen && (
        <UpdateOrderModal order={order} onClose={() => setUpdateOpen(false)} />
      )}
    </>
  );
}
