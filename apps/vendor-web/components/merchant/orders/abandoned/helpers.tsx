import { AbandonedOrder } from "@/lib/data/orders";
import { fmtNaira } from "@gomarket/shared-utils";
import {
  XCircle,
  CheckCircle2,
  Mail,
  MessageSquare,
  Phone,
  Check,
  Send,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

export const EMAIL_TEMPLATES = [
  {
    id: "gentle",
    label: "Gentle reminder",
    subject: "You left something behind 👀",
    preview:
      "Hi [Name], looks like you were interested in some of our pieces. They're still waiting for you…",
  },
  {
    id: "discount",
    label: "Offer a discount",
    subject: "Here's 10% off your cart 🎁",
    preview:
      "Hi [Name], we noticed you couldn't complete your order. Use code COMEBACK10 for 10% off — expires in 24hrs…",
  },
  {
    id: "urgency",
    label: "Create urgency",
    subject: "Stock is running low ⚠️",
    preview:
      "Hi [Name], items in your cart are selling fast. Secure yours before they're gone…",
  },
];

export function OutreachModal({
  targets,
  onClose,
}: {
  targets: AbandonedOrder[];
  onClose: () => void;
}) {
  const [channel, setChannel] = useState<"email" | "sms" | "whatsapp">("email");
  const [template, setTemplate] = useState(EMAIL_TEMPLATES[0].id);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const selectedTemplate = EMAIL_TEMPLATES.find((t) => t.id === template)!;
  const isSingle = targets.length === 1;

  async function handleSend() {
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
    setTimeout(onClose, 1500);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-[16px] border shadow-xl overflow-hidden"
        style={{ background: "#fff", borderColor: "#e2e8f0" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b" style={{ borderColor: "#f1f5f9" }}>
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-[14px] font-extrabold"
                style={{ color: "#1C1C1C" }}
              >
                Send recovery outreach
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "#6b7280" }}>
                {isSingle
                  ? `To: ${targets[0].customer.name}`
                  : `Sending to ${targets.length} customers`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#f1f5f9] transition-colors"
            >
              <XCircle className="w-4 h-4" style={{ color: "#94a3b8" }} />
            </button>
          </div>
        </div>

        {sent ? (
          <div className="px-5 py-10 flex flex-col items-center gap-3">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "#F0FAF3" }}
            >
              <CheckCircle2 className="w-7 h-7" style={{ color: "#1A7A42" }} />
            </div>
            <p
              className="text-[15px] font-extrabold"
              style={{ color: "#1C1C1C" }}
            >
              Sent successfully!
            </p>
            <p className="text-[12px] text-center" style={{ color: "#6b7280" }}>
              Recovery message sent to {targets.length} customer
              {targets.length !== 1 ? "s" : ""} via {channel}.
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Channel selector */}
            <div className="space-y-1.5">
              <label
                className="text-[10px] font-extrabold uppercase block"
                style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}
              >
                Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    {
                      id: "email",
                      label: "Email",
                      icon: Mail,
                      available: true,
                    },
                    {
                      id: "sms",
                      label: "SMS",
                      icon: MessageSquare,
                      available: true,
                    },
                    {
                      id: "whatsapp",
                      label: "WhatsApp",
                      icon: Phone,
                      available: false,
                    },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => opt.available && setChannel(opt.id)}
                    disabled={!opt.available}
                    className="relative flex flex-col items-center gap-1.5 py-3 rounded-[10px] border text-[12px] font-semibold transition-all"
                    style={{
                      borderColor: channel === opt.id ? "#1A7A42" : "#e2e8f0",
                      background:
                        channel === opt.id ? "rgba(26,122,66,0.05)" : "#fafafa",
                      color:
                        channel === opt.id
                          ? "#1A7A42"
                          : opt.available
                            ? "#374151"
                            : "#d1d5db",
                      opacity: opt.available ? 1 : 0.5,
                    }}
                  >
                    <opt.icon className="w-4 h-4" />
                    {opt.label}
                    {!opt.available && (
                      <span
                        className="absolute -top-2 -right-1 text-[8px] font-bold px-1 py-0.5 rounded-full"
                        style={{ background: "#f1f5f9", color: "#94a3b8" }}
                      >
                        Soon
                      </span>
                    )}
                    {channel === opt.id && (
                      <div
                        className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                        style={{ background: "#1A7A42" }}
                      >
                        <Check className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Template selector (email only) */}
            {channel === "email" && (
              <div className="space-y-1.5">
                <label
                  className="text-[10px] font-extrabold uppercase block"
                  style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}
                >
                  Message template
                </label>
                <div className="space-y-2">
                  {EMAIL_TEMPLATES.map((t) => (
                    <label
                      key={t.id}
                      className="flex items-start gap-3 p-3 rounded-[10px] border cursor-pointer transition-all"
                      style={{
                        borderColor: template === t.id ? "#1A7A42" : "#e2e8f0",
                        background:
                          template === t.id
                            ? "rgba(26,122,66,0.04)"
                            : "#fafafa",
                      }}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        checked={template === t.id}
                        onChange={() => setTemplate(t.id)}
                      />
                      <div
                        className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          borderColor:
                            template === t.id ? "#1A7A42" : "#d1d5db",
                          background:
                            template === t.id ? "#1A7A42" : "transparent",
                        }}
                      >
                        {template === t.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <p
                          className="text-[12px] font-bold"
                          style={{ color: "#1C1C1C" }}
                        >
                          {t.label}
                        </p>
                        <p
                          className="text-[11px] mt-0.5"
                          style={{ color: "#6b7280" }}
                        >
                          "{t.subject}"
                        </p>
                        <p
                          className="text-[11px] mt-0.5 line-clamp-1"
                          style={{ color: "#94a3b8" }}
                        >
                          {t.preview}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* SMS preview */}
            {channel === "sms" && (
              <div
                className="rounded-[10px] p-3.5 space-y-1.5"
                style={{
                  background: "#F0FAF3",
                  border: "1px solid rgba(26,122,66,0.15)",
                }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-wide"
                  style={{ color: "#3D6B4F" }}
                >
                  Message preview
                </p>
                <p
                  className="text-[12px] leading-relaxed"
                  style={{ color: "#374151" }}
                >
                  Hi{" "}
                  {isSingle ? targets[0].customer.name.split(" ")[0] : "[Name]"}
                  , you left items worth{" "}
                  {isSingle ? fmtNaira(targets[0].subtotal) : "₦X,XXX"} in your
                  cart. Complete your order here: gomarketi.com/cart/resume —
                  GoMarket Store
                </p>
              </div>
            )}

            {/* Recipient list */}
            {targets.length <= 3 ? (
              <div className="space-y-1.5">
                <p
                  className="text-[10px] font-extrabold uppercase tracking-wide"
                  style={{ color: "#94a3b8" }}
                >
                  Sending to
                </p>
                {targets.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-[8px]"
                    style={{
                      background: "#fafafa",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shrink-0"
                      style={{ background: "#1A7A42" }}
                    >
                      {t.customer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[12px] font-semibold truncate"
                        style={{ color: "#1C1C1C" }}
                      >
                        {t.customer.name}
                      </p>
                      <p
                        className="text-[10px] truncate"
                        style={{ color: "#6b7280" }}
                      >
                        {channel === "email"
                          ? t.customer.email
                          : t.customer.phone}
                      </p>
                    </div>
                    <p
                      className="text-[11px] font-semibold shrink-0"
                      style={{ color: "#1A7A42" }}
                    >
                      {fmtNaira(t.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="px-3 py-2.5 rounded-[8px] text-[12px]"
                style={{ background: "#F0FAF3", color: "#3D6B4F" }}
              >
                <strong>{targets.length} customers</strong> will receive this
                message · total cart value{" "}
                <strong>
                  {fmtNaira(targets.reduce((s, t) => s + t.subtotal, 0))}
                </strong>
              </div>
            )}

            {/* Send */}
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-[10px] text-white text-[13px] font-bold transition-all active:scale-[0.98] disabled:opacity-60"
              style={{
                background: "#1A7A42",
                boxShadow: "0 4px 14px rgba(26,122,66,0.25)",
              }}
              onMouseOver={(e) =>
                !sending && (e.currentTarget.style.background = "#239452")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#1A7A42")}
            >
              {sending ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send {channel} now
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function AbandonedRow({
  order,
  selected,
  onSelect,
  onOutreach,
}: {
  order: AbandonedOrder;
  selected: boolean;
  onSelect: () => void;
  onOutreach: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hoursAgo = Math.round(
    (Date.now() - new Date(order.lastActivity).getTime()) / 3600000,
  );

  const sourceLabel: Record<string, string> = {
    storefront: "Storefront",
    whatsapp: "WhatsApp",
    direct: "Direct",
  };
  const sourceBg: Record<string, string> = {
    storefront: "#F0FAF3",
    whatsapp: "#dcfce7",
    direct: "#f1f5f9",
  };
  const sourceColor: Record<string, string> = {
    storefront: "#1A7A42",
    whatsapp: "#15803d",
    direct: "#374151",
  };

  return (
    <>
      {/* Row */}
      <div
        className="border-b transition-colors"
        style={{
          borderColor: "#f1f5f9",
          background: selected
            ? "rgba(240,250,243,0.5)"
            : order.recovered
              ? "rgba(220,252,231,0.15)"
              : undefined,
        }}
      >
        <div
          className="hidden sm:grid items-center px-4 py-3.5"
          style={{
            gridTemplateColumns: "20px 32px 1fr 100px 110px 130px 120px 36px",
            gap: "12px",
          }}
        >
          {/* Checkbox */}
          <button
            type="button"
            onClick={onSelect}
            className="flex items-center justify-center"
          >
            <div
              className="w-4 h-4 rounded-[4px] flex items-center justify-center"
              style={{
                background: selected ? "#1A7A42" : "transparent",
                border: `1.5px solid ${selected ? "#1A7A42" : "#d1d5db"}`,
              }}
            >
              {selected && (
                <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
                  <path
                    d="M1 3.5l2 2L7 1"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </button>

          {/* Expand */}
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

          {/* Customer */}
          <div
            onClick={() => setExpanded((v) => !v)}
            className="cursor-pointer"
          >
            <p
              className="text-[13px] font-semibold"
              style={{ color: "#1C1C1C" }}
            >
              {order.customer.name}
            </p>
            <p className="text-[11px]" style={{ color: "#6b7280" }}>
              {order.customer.email}
            </p>
          </div>

          {/* Value */}
          <div
            onClick={() => setExpanded((v) => !v)}
            className="cursor-pointer"
          >
            <p
              className="text-[13px] font-bold tabular-nums"
              style={{ color: "#1A7A42" }}
            >
              {fmtNaira(order.subtotal)}
            </p>
            <p className="text-[10px]" style={{ color: "#94a3b8" }}>
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Source */}
          <div
            onClick={() => setExpanded((v) => !v)}
            className="cursor-pointer"
          >
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: sourceBg[order.source],
                color: sourceColor[order.source],
              }}
            >
              {sourceLabel[order.source]}
            </span>
          </div>

          {/* Last activity */}
          <div
            onClick={() => setExpanded((v) => !v)}
            className="cursor-pointer"
          >
            <p
              className="text-[11px] font-medium"
              style={{ color: hoursAgo > 24 ? "#dc2626" : "#f59e0b" }}
            >
              {hoursAgo < 1
                ? "Just now"
                : hoursAgo < 24
                  ? `${hoursAgo}h ago`
                  : `${Math.floor(hoursAgo / 24)}d ago`}
            </p>
          </div>

          {/* Recovery status */}
          <div className="flex items-center gap-1.5">
            {order.recovered ? (
              <span
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "#dcfce7", color: "#15803d" }}
              >
                <CheckCircle2 className="w-2.5 h-2.5" /> Recovered
              </span>
            ) : (
              <div className="flex items-center gap-1">
                {order.recoveryEmailSent && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "#dbeafe" }}
                    title="Email sent"
                  >
                    <Mail
                      className="w-2.5 h-2.5"
                      style={{ color: "#3b82f6" }}
                    />
                  </div>
                )}
                {order.recoverySMSSent && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "#F0FAF3" }}
                    title="SMS sent"
                  >
                    <MessageSquare
                      className="w-2.5 h-2.5"
                      style={{ color: "#1A7A42" }}
                    />
                  </div>
                )}
                {!order.recoveryEmailSent && !order.recoverySMSSent && (
                  <span className="text-[10px]" style={{ color: "#94a3b8" }}>
                    No outreach
                  </span>
                )}
              </div>
            )}
          </div>

          {/* CTA */}
          {!order.recovered && (
            <button
              type="button"
              onClick={onOutreach}
              className="w-7 h-7 rounded-[6px] flex items-center justify-center transition-colors hover:bg-[#F0FAF3]"
              title="Send recovery message"
            >
              <Send className="w-3.5 h-3.5" style={{ color: "#1A7A42" }} />
            </button>
          )}
        </div>

        {/* Mobile */}
        <div
          className="sm:hidden px-4 py-3.5"
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-[13px] font-bold" style={{ color: "#1C1C1C" }}>
              {order.customer.name}
            </p>
            <div className="flex items-center gap-2">
              {order.recovered ? (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "#dcfce7", color: "#15803d" }}
                >
                  Recovered
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOutreach();
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full text-white"
                  style={{ background: "#1A7A42" }}
                >
                  <Send className="w-3 h-3" /> Send
                </button>
              )}
              <ChevronDown
                className="w-4 h-4"
                style={{
                  color: "#94a3b8",
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[12px]" style={{ color: "#6b7280" }}>
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </p>
            <p className="text-[13px] font-bold" style={{ color: "#1A7A42" }}>
              {fmtNaira(order.subtotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div
          className="border-b px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-200"
          style={{
            borderColor: "#f1f5f9",
            background: "rgba(240,250,243,0.1)",
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-3">
            {/* Items */}
            <div className="space-y-2 lg:col-span-2">
              <p
                className="text-[10px] font-extrabold uppercase tracking-wide"
                style={{ color: "#94a3b8" }}
              >
                Cart items
              </p>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] border"
                  style={{ borderColor: "#f1f5f9", background: "#fff" }}
                >
                  <div
                    className="w-9 h-9 rounded-[6px] overflow-hidden shrink-0"
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
                      className="text-[12px] font-semibold truncate"
                      style={{ color: "#1C1C1C" }}
                    >
                      {item.productName}
                    </p>
                    {item.variantLabel && (
                      <p className="text-[10px]" style={{ color: "#6b7280" }}>
                        {item.variantLabel}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p
                      className="text-[12px] font-bold"
                      style={{ color: "#1C1C1C" }}
                    >
                      {fmtNaira(item.totalPrice)}
                    </p>
                    <p className="text-[10px]" style={{ color: "#94a3b8" }}>
                      × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
              <div
                className="flex items-center justify-between px-3.5 py-2 rounded-[8px]"
                style={{ background: "#F0FAF3" }}
              >
                <span
                  className="text-[12px] font-semibold"
                  style={{ color: "#3D6B4F" }}
                >
                  Cart total
                </span>
                <span
                  className="text-[14px] font-extrabold"
                  style={{ color: "#1A7A42" }}
                >
                  {fmtNaira(order.subtotal)}
                </span>
              </div>
            </div>

            {/* Contact + recovery */}
            <div className="space-y-3">
              <div
                className="rounded-[10px] border p-3.5 space-y-2"
                style={{ borderColor: "#f1f5f9" }}
              >
                <p
                  className="text-[10px] font-extrabold uppercase tracking-wide"
                  style={{ color: "#94a3b8" }}
                >
                  Customer
                </p>
                <p
                  className="text-[13px] font-semibold"
                  style={{ color: "#1C1C1C" }}
                >
                  {order.customer.name}
                </p>
                <div className="space-y-1">
                  <div
                    className="flex items-center gap-1.5 text-[11px]"
                    style={{ color: "#6b7280" }}
                  >
                    <Mail
                      className="w-3 h-3 shrink-0"
                      style={{ color: "#94a3b8" }}
                    />{" "}
                    {order.customer.email}
                  </div>
                  <div
                    className="flex items-center gap-1.5 text-[11px]"
                    style={{ color: "#6b7280" }}
                  >
                    <MessageSquare
                      className="w-3 h-3 shrink-0"
                      style={{ color: "#94a3b8" }}
                    />{" "}
                    {order.customer.phone}
                  </div>
                </div>
              </div>

              {/* Outreach history */}
              <div
                className="rounded-[10px] border p-3.5 space-y-2"
                style={{ borderColor: "#f1f5f9" }}
              >
                <p
                  className="text-[10px] font-extrabold uppercase tracking-wide"
                  style={{ color: "#94a3b8" }}
                >
                  Outreach history
                </p>
                {!order.recoveryEmailSent && !order.recoverySMSSent ? (
                  <p className="text-[11px]" style={{ color: "#94a3b8" }}>
                    No messages sent yet
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {order.recoveryEmailSent && (
                      <div
                        className="flex items-center gap-2 text-[11px]"
                        style={{ color: "#374151" }}
                      >
                        <Check
                          className="w-3 h-3"
                          style={{ color: "#22c55e" }}
                        />
                        Email sent{" "}
                        {order.recoveryEmailSentAt
                          ? new Date(
                              order.recoveryEmailSentAt,
                            ).toLocaleDateString("en-NG", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </div>
                    )}
                    {order.recoverySMSSent && (
                      <div
                        className="flex items-center gap-2 text-[11px]"
                        style={{ color: "#374151" }}
                      >
                        <Check
                          className="w-3 h-3"
                          style={{ color: "#22c55e" }}
                        />{" "}
                        SMS sent
                      </div>
                    )}
                    {order.recovered && (
                      <div
                        className="flex items-center gap-2 text-[11px] font-semibold"
                        style={{ color: "#15803d" }}
                      >
                        <CheckCircle2 className="w-3 h-3" /> Converted to order!
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!order.recovered && (
                <button
                  type="button"
                  onClick={onOutreach}
                  className="w-full flex items-center justify-center gap-2 h-9 rounded-[8px] text-white text-[12px] font-bold transition-all"
                  style={{
                    background: "#0A2E1A",
                    boxShadow: "0 2px 8px rgba(26,122,66,0.2)",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "#239452")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "#0A2E1A")
                  }
                >
                  <Send className="w-3.5 h-3.5" /> Send recovery message
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
