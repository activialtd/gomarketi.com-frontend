import { Customer } from "@/lib/data/customers";
import { fmtNaira, timeAgo } from "@gomarket/shared-utils";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  MessageSquare,
  ShoppingBag,
  Edit3,
  Star,
  ChevronDown,
} from "lucide-react";

export const TAG_CFG = {
  vip: { label: "VIP", bg: "#fef3c7", color: "#92400e" },
  repeat: { label: "Repeat", bg: "#dbeafe", color: "#1e40af" },
  new: { label: "New", bg: "#dcfce7", color: "#15803d" },
  "at-risk": { label: "At risk", bg: "#fee2e2", color: "#991b1b" },
} as const;

export function CustomerDrawer({
  customer,
  onClose,
}: {
  customer: Customer;
  onClose: () => void;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.3)" }}
        onClick={onClose}
      />
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col overflow-hidden"
        style={{
          width: "min(420px, 100vw)",
          background: "#fff",
          borderLeft: "1px solid #e2e8f0",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.10)",
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: "#f1f5f9" }}
        >
          <p
            className="text-[14px] font-extrabold"
            style={{ color: "#1C1C1C" }}
          >
            Customer profile
          </p>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-[6px] flex items-center justify-center hover:bg-[#f1f5f9] transition-colors"
          >
            <X className="w-4 h-4" style={{ color: "#94a3b8" }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Avatar + name */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-[16px] font-extrabold text-white shrink-0"
              style={{ background: "#1A7A42" }}
            >
              {customer.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <p
                className="text-[16px] font-extrabold"
                style={{ color: "#1C1C1C" }}
              >
                {customer.name}
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {customer.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: TAG_CFG[t].bg,
                      color: TAG_CFG[t].color,
                    }}
                  >
                    {TAG_CFG[t].label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div
            className="rounded-[10px] border p-4 space-y-2.5"
            style={{ borderColor: "#f1f5f9" }}
          >
            <p
              className="text-[10px] font-extrabold uppercase tracking-wide"
              style={{ color: "#94a3b8" }}
            >
              Contact
            </p>
            {[
              { icon: Mail, text: customer.email },
              { icon: Phone, text: customer.phone },
              {
                icon: MapPin,
                text: `${customer.location.city}, ${customer.location.state}`,
              },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2.5 text-[12px]"
                style={{ color: "#374151" }}
              >
                <Icon
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: "#94a3b8" }}
                />{" "}
                {text}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Orders", value: customer.totalOrders },
              { label: "Total spent", value: fmtNaira(customer.totalSpent) },
              {
                label: "Avg order",
                value: fmtNaira(customer.averageOrderValue),
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-[10px] border p-3 text-center"
                style={{ borderColor: "#f1f5f9", background: "#fafafa" }}
              >
                <p
                  className="text-[14px] font-extrabold"
                  style={{ color: "#1C1C1C" }}
                >
                  {s.value}
                </p>
                <p
                  className="text-[9px] font-semibold uppercase tracking-wide mt-0.5"
                  style={{ color: "#94a3b8" }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div
            className="rounded-[10px] border p-4 space-y-2.5"
            style={{ borderColor: "#f1f5f9" }}
          >
            <p
              className="text-[10px] font-extrabold uppercase tracking-wide"
              style={{ color: "#94a3b8" }}
            >
              Activity
            </p>
            <div
              className="flex items-center gap-2 text-[12px]"
              style={{ color: "#374151" }}
            >
              <Calendar
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: "#94a3b8" }}
              />
              First order:{" "}
              {new Date(customer.firstOrderAt).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            <div
              className="flex items-center gap-2 text-[12px]"
              style={{ color: "#374151" }}
            >
              <Clock
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: "#94a3b8" }}
              />
              Last order: {timeAgo(customer.lastOrderAt)}
            </div>
          </div>

          {/* Notes */}
          {customer.notes && (
            <div
              className="rounded-[10px] p-3.5 text-[12px] leading-relaxed"
              style={{
                background: "#fffbeb",
                border: "1px solid rgba(245,158,11,0.2)",
                color: "#92400e",
              }}
            >
              📝 {customer.notes}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-1">
            <button
              className="w-full flex items-center justify-center gap-2 h-10 rounded-[10px] text-white text-[13px] font-bold transition-all"
              style={{ background: "#1A7A42" }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#239452")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#1A7A42")}
            >
              <MessageSquare className="w-4 h-4" /> Send message
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                className="flex items-center justify-center gap-2 h-9 rounded-[9px] border text-[12px] font-semibold transition-colors"
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
                <ShoppingBag className="w-3.5 h-3.5" /> Orders
              </button>
              <button
                className="flex items-center justify-center gap-2 h-9 rounded-[9px] border text-[12px] font-semibold transition-colors"
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
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Customer row ─────────────────────────────────────────────────────────────
export function CustomerRow({
  customer,
  onClick,
}: {
  customer: Customer;
  onClick: () => void;
}) {
  return (
    <div
      className="grid items-center px-4 py-3.5 border-b transition-colors cursor-pointer hover:bg-[#fafafa] group"
      style={{
        gridTemplateColumns: "44px 1fr 130px 130px 100px 80px 40px",
        gap: "12px",
        borderColor: "#f1f5f9",
      }}
      onClick={onClick}
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white shrink-0"
        style={{ background: "#1A7A42" }}
      >
        {customer.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)}
      </div>

      {/* Name + email */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p
            className="text-[13px] font-semibold truncate"
            style={{ color: "#1C1C1C" }}
          >
            {customer.name}
          </p>
          {customer.tags.includes("vip") && (
            <Star
              className="w-3 h-3 shrink-0"
              style={{ color: "#f59e0b" }}
              fill="#f59e0b"
            />
          )}
        </div>
        <p className="text-[11px] truncate" style={{ color: "#6b7280" }}>
          {customer.email}
        </p>
      </div>

      {/* Location */}
      <p
        className="text-[12px] truncate hidden lg:block"
        style={{ color: "#6b7280" }}
      >
        {customer.location.city}, {customer.location.state}
      </p>

      {/* Spent */}
      <div className="hidden md:block">
        <p className="text-[13px] font-bold" style={{ color: "#1A7A42" }}>
          {fmtNaira(customer.totalSpent)}
        </p>
        <p className="text-[10px]" style={{ color: "#94a3b8" }}>
          {customer.totalOrders} order{customer.totalOrders !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Last order */}
      <p className="text-[11px] hidden md:block" style={{ color: "#6b7280" }}>
        {timeAgo(customer.lastOrderAt)}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 hidden sm:flex">
        {customer.tags.slice(0, 2).map((t) => (
          <span
            key={t}
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: TAG_CFG[t].bg, color: TAG_CFG[t].color }}
          >
            {TAG_CFG[t].label}
          </span>
        ))}
      </div>

      {/* Arrow */}
      <ChevronDown
        className="w-4 h-4 -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: "#94a3b8" }}
      />
    </div>
  );
}
