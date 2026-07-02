import { type AbandonedCartResp } from "@gomarket/api-client";
import { fmtNaira } from "@gomarket/shared-utils";
import { Mail, Package } from "lucide-react";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function AbandonedRow({ cart }: { cart: AbandonedCartResp }) {
  const email = cart.customer_email ?? "Unknown shopper";
  return (
    <div
      className="grid items-center px-4 py-3.5 border-b last:border-0"
      style={{
        gridTemplateColumns: "1fr 100px 90px 140px",
        gap: "12px",
        borderColor: "#f1f5f9",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white shrink-0"
          style={{ background: "#94a3b8" }}
        >
          {email.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold truncate" style={{ color: "#1C1C1C" }}>
            {email}
          </p>
          <p className="text-[11px]" style={{ color: "#6b7280" }}>
            {cart.items.length} item{cart.items.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <p className="text-[13px] font-bold tabular-nums" style={{ color: "#1A7A42" }}>
        {fmtNaira(cart.total_kobo)}
      </p>

      <p className="text-[11px]" style={{ color: "#6b7280" }}>
        {timeAgo(cart.abandoned_at)}
      </p>

      {cart.customer_email ? (
        <a
          href={`mailto:${cart.customer_email}?subject=Did you forget something?`}
          className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-[7px] border text-[11px] font-semibold transition-colors"
          style={{ borderColor: "#e2e8f0", background: "#fff", color: "#374151" }}
        >
          <Mail className="w-3.5 h-3.5" /> Email
        </a>
      ) : (
        <span />
      )}
    </div>
  );
}

export function AbandonedEmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div
        className="w-12 h-12 rounded-[12px] flex items-center justify-center"
        style={{ background: "#F0FAF3" }}
      >
        <Package className="w-5 h-5" style={{ color: "#1A7A42" }} />
      </div>
      <p className="text-[13px] font-semibold" style={{ color: "#374151" }}>
        {hasFilter ? "No matching carts" : "No abandoned carts yet"}
      </p>
      <p className="text-[11px] text-center max-w-[280px]" style={{ color: "#94a3b8" }}>
        Carts customers leave at checkout without completing payment will show up here.
      </p>
    </div>
  );
}
