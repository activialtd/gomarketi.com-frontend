import { type CustomerResp } from "@gomarket/api-client";
import { fmtNaira } from "@gomarket/shared-utils";
import { Mail, Phone, X, ShoppingBag } from "lucide-react";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CustomerRow({
  customer,
  onClick,
}: {
  customer: CustomerResp;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="grid items-center px-4 py-3 border-b last:border-0 cursor-pointer transition-colors"
      style={{
        gridTemplateColumns: "44px 1fr 130px 130px",
        gap: "12px",
        borderColor: "#f1f5f9",
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = "#fafafa")}
      onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white shrink-0"
        style={{ background: "#1A7A42" }}
      >
        {initials(customer.full_name || customer.email)}
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold truncate" style={{ color: "#1C1C1C" }}>
          {customer.full_name || "Unnamed customer"}
        </p>
        <p className="text-[11px] truncate" style={{ color: "#6b7280" }}>
          {customer.email}
        </p>
      </div>
      <div>
        <p className="text-[13px] font-bold tabular-nums" style={{ color: "#1A7A42" }}>
          {fmtNaira(customer.total_spent_kobo)}
        </p>
        <p className="text-[11px]" style={{ color: "#6b7280" }}>
          {customer.total_orders} order{customer.total_orders !== 1 ? "s" : ""}
        </p>
      </div>
      <p className="text-[11px]" style={{ color: "#6b7280" }}>
        {customer.last_order_at
          ? new Date(customer.last_order_at).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "—"}
      </p>
    </div>
  );
}

export function CustomerDrawer({
  customer,
  onClose,
}: {
  customer: CustomerResp;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm h-full bg-white overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-5 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-10"
          style={{ borderColor: "#f1f5f9" }}
        >
          <p className="text-[14px] font-extrabold" style={{ color: "#1C1C1C" }}>
            Customer details
          </p>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#f1f5f9] transition-colors"
          >
            <X className="w-4 h-4" style={{ color: "#94a3b8" }} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-[14px] font-extrabold text-white shrink-0"
              style={{ background: "#1A7A42" }}
            >
              {initials(customer.full_name || customer.email)}
            </div>
            <div>
              <p className="text-[15px] font-bold" style={{ color: "#1C1C1C" }}>
                {customer.full_name || "Unnamed customer"}
              </p>
              <p className="text-[12px]" style={{ color: "#6b7280" }}>
                {customer.total_orders} order{customer.total_orders !== 1 ? "s" : ""} ·{" "}
                {fmtNaira(customer.total_spent_kobo)} spent
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div
              className="flex items-center gap-2.5 text-[12px]"
              style={{ color: "#374151" }}
            >
              <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: "#94a3b8" }} />
              {customer.email}
            </div>
            {customer.phone && (
              <div
                className="flex items-center gap-2.5 text-[12px]"
                style={{ color: "#374151" }}
              >
                <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: "#94a3b8" }} />
                {customer.phone}
              </div>
            )}
          </div>

          <div
            className="rounded-[10px] border p-3.5 flex items-center gap-3"
            style={{ borderColor: "#f1f5f9" }}
          >
            <div
              className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0"
              style={{ background: "#F0FAF3" }}
            >
              <ShoppingBag className="w-4 h-4" style={{ color: "#1A7A42" }} />
            </div>
            <div>
              <p className="text-[13px] font-bold" style={{ color: "#1C1C1C" }}>
                {fmtNaira(customer.total_spent_kobo)}
              </p>
              <p className="text-[11px]" style={{ color: "#6b7280" }}>
                Lifetime value
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
