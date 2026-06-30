import { type OrderResp, type OrderStatus as ApiOrderStatus, ordersApi } from "@gomarket/api-client";
import { fmtNaira } from "@gomarket/shared-utils";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Clock,
  RefreshCw,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronDown,
  MoreHorizontal,
  AlertCircle,
  Check,
  Mail,
  MapPin,
  Edit3,
  Loader2,
} from "lucide-react";
import { useState } from "react";

export const STATUS_CFG: Record<
  ApiOrderStatus,
  { label: string; bg: string; color: string; icon: React.ElementType }
> = {
  pending: { label: "Pending", bg: "#fef3c7", color: "#92400e", icon: Clock },
  confirmed: {
    label: "Confirmed",
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
};

function StatusBadge({ status }: { status: ApiOrderStatus }) {
  const cfg = STATUS_CFG[status];
  if (!cfg) return null;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
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
  onUpdated,
}: {
  order: OrderResp;
  onClose: () => void;
  onUpdated: (updated: OrderResp) => void;
}) {
  const [status, setStatus] = useState<ApiOrderStatus>(order.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const accessToken = useAuthStore((s) => s.accessToken);

  async function handleSave() {
    if (!accessToken) return;
    setSaving(true);
    setError("");
    try {
      const updated = await ordersApi.updateOrderStatus(order.id, status, accessToken);
      onUpdated(updated);
      onClose();
    } catch {
      setError("Could not update order status. Please try again.");
    } finally {
      setSaving(false);
    }
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
              #{order.id.slice(0, 8).toUpperCase()} · {order.customer_name}
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
                  ApiOrderStatus,
                  (typeof STATUS_CFG)[ApiOrderStatus],
                ][]
              )
                .filter(([val]) => val !== "pending")
                .map(([val, cfg]) => (
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

          {error && (
            <p className="text-[11px]" style={{ color: "#dc2626" }}>
              {error}
            </p>
          )}

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
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
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
  order: OrderResp;
  onUpdate: () => void;
}) {
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
                {item.image_url && (
                  <img
                    src={item.image_url}
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
                  {item.name}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p
                  className="text-[13px] font-bold"
                  style={{ color: "#1C1C1C" }}
                >
                  {fmtNaira(item.price_kobo * item.quantity)}
                </p>
                <p className="text-[11px]" style={{ color: "#6b7280" }}>
                  × {item.quantity} @ {fmtNaira(item.price_kobo)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="rounded-[10px] border overflow-hidden"
          style={{ borderColor: "#f1f5f9" }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: "#fafafa" }}
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
              {fmtNaira(order.total_kobo)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Customer + delivery ─────────────────────────────── */}
      <div className="space-y-3">
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
              {order.customer_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <p className="text-[13px] font-semibold" style={{ color: "#1C1C1C" }}>
              {order.customer_name}
            </p>
          </div>
          <div
            className="flex items-center gap-2 text-[11px]"
            style={{ color: "#6b7280" }}
          >
            <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: "#94a3b8" }} />
            {order.customer_email}
          </div>
        </div>

        {order.delivery_address && (
          <div
            className="rounded-[10px] border p-3.5 space-y-2"
            style={{ borderColor: "#f1f5f9" }}
          >
            <p
              className="text-[10px] font-extrabold uppercase tracking-wide"
              style={{ color: "#94a3b8" }}
            >
              Delivery address
            </p>
            <div
              className="flex items-start gap-2 text-[11px]"
              style={{ color: "#6b7280" }}
            >
              <MapPin
                className="w-3.5 h-3.5 shrink-0 mt-0.5"
                style={{ color: "#94a3b8" }}
              />
              <span>{order.delivery_address}</span>
            </div>
          </div>
        )}

        <div
          className="rounded-[10px] border p-3.5 flex items-center justify-between"
          style={{ borderColor: "#f1f5f9" }}
        >
          <p className="text-[12px] font-semibold" style={{ color: "#374151" }}>
            Payment
          </p>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "#dcfce7", color: "#15803d" }}
          >
            Paid (Paystack)
          </span>
        </div>

        <button
          type="button"
          onClick={onUpdate}
          className="flex items-center gap-2 h-9 px-3.5 rounded-[8px] text-white text-[12px] font-bold transition-all w-full justify-center"
          style={{
            background: "#1A7A42",
            boxShadow: "0 2px 8px rgba(26,122,66,0.2)",
          }}
        >
          <Edit3 className="w-3.5 h-3.5" /> Update order status
        </button>
      </div>
    </div>
  );
}

export function OrderRow({
  order,
  onUpdated,
}: {
  order: OrderResp;
  onUpdated: (updated: OrderResp) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);

  return (
    <>
      <div
        className="border-b transition-colors cursor-pointer"
        style={{
          borderColor: "#f1f5f9",
          background: expanded ? "rgba(240,250,243,0.4)" : undefined,
        }}
      >
        <div
          className="hidden sm:grid items-center px-4 py-3.5"
          style={{
            gridTemplateColumns: "32px 1fr 120px 110px 110px 36px",
            gap: "12px",
          }}
        >
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

          <div onClick={() => setExpanded((v) => !v)}>
            <p className="text-[13px] font-bold" style={{ color: "#1C1C1C" }}>
              #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-[11px]" style={{ color: "#6b7280" }}>
              {order.customer_name}
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
              {fmtNaira(order.total_kobo)}
            </p>
          </div>

          <div onClick={() => setExpanded((v) => !v)}>
            <StatusBadge status={order.status} />
          </div>

          <div onClick={() => setExpanded((v) => !v)}>
            <p className="text-[11px]" style={{ color: "#6b7280" }}>
              {new Date(order.created_at).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
              })}
            </p>
            <p className="text-[10px]" style={{ color: "#94a3b8" }}>
              {new Date(order.created_at).toLocaleTimeString("en-NG", {
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

        <div
          className="sm:hidden px-4 py-3.5"
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-[13px] font-bold" style={{ color: "#1C1C1C" }}>
              #{order.id.slice(0, 8).toUpperCase()}
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
              {order.customer_name}
            </p>
            <p className="text-[13px] font-bold" style={{ color: "#1A7A42" }}>
              {fmtNaira(order.total_kobo)}
            </p>
          </div>
        </div>
      </div>

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

      {updateOpen && (
        <UpdateOrderModal
          order={order}
          onClose={() => setUpdateOpen(false)}
          onUpdated={onUpdated}
        />
      )}
    </>
  );
}
