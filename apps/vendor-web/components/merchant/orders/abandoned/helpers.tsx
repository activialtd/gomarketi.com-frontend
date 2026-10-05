"use client";

import { useState } from "react";
import { type AbandonedCartResp } from "@gomarket/api-client";
import { fmtNaira } from "@gomarket/shared-utils";
import { ChevronDown, Mail, MessageCircle, Package } from "lucide-react";

/**
 * A wa.me link with the message already written, or null when the buyer left
 * no number.
 *
 * Numbers arrive in whatever shape the buyer typed — "0801 234 5678",
 * "+234 801...", or the "234..." the storefront normalises to — and a local
 * one passed through unchanged produces a link that opens to nothing.
 */
function whatsappLink(phone: string | undefined, firstItem?: string): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return null;
  let intl = digits;
  if (digits.startsWith("0")) intl = "234" + digits.slice(1);
  else if (!digits.startsWith("234") && digits.length === 10) intl = "234" + digits;
  if (intl.length < 11) return null;

  const about = firstItem ? ` about the ${firstItem}` : "";
  const text = `Hi! I saw you were checking out${about} but didn't finish. Can I help with anything?`;
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}

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
  // Collapsed by default so the list still scans, but a vendor deciding
  // whether to chase someone needs to know what they were buying — a count
  // and a total does not tell them whether it was worth a phone call.
  const [open, setOpen] = useState(false);
  const itemCount = cart.items.reduce((n, i) => n + i.quantity, 0);
  const wa = whatsappLink(cart.customer_phone, cart.items[0]?.name);

  return (
    <div className="border-b last:border-0" style={{ borderColor: "#f1f5f9" }}>
      <div
        className="grid items-center px-4 py-3.5"
        style={{
          gridTemplateColumns: "1fr 100px 90px 210px",
          gap: "12px",
        }}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-3 min-w-0 text-left"
        >
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
            <p className="text-[11px] flex items-center gap-1" style={{ color: "#6b7280" }}>
              {itemCount} item{itemCount !== 1 ? "s" : ""}
              <ChevronDown
                className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </p>
          </div>
        </button>

        <p className="text-[13px] font-bold tabular-nums" style={{ color: "#1A7A42" }}>
          {fmtNaira(cart.total_kobo)}
        </p>

        <p className="text-[11px]" style={{ color: "#6b7280" }}>
          {timeAgo(cart.abandoned_at)}
        </p>

        <div className="flex items-center gap-1.5 justify-end">
          {/* WhatsApp first: it is how these conversations actually happen
              here, and a message lands where an email to a shopper rarely
              does. Falls back to email when no number was given. */}
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-[7px] text-[11px] font-semibold transition-colors"
              style={{ background: "#25D366", color: "#fff" }}
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
          )}
          {cart.customer_email && (
            <a
              href={`mailto:${cart.customer_email}?subject=${encodeURIComponent("You left something in your cart")}`}
              className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-[7px] border text-[11px] font-semibold transition-colors"
              style={{ borderColor: "#e2e8f0", background: "#fff", color: "#374151" }}
            >
              <Mail className="w-3.5 h-3.5" /> Email
            </a>
          )}
        </div>
      </div>

      {/* Same shape as the order detail's item list, so a vendor reads the two
          the same way. */}
      {open && (
        <div className="px-4 pb-3.5">
          <div
            className="rounded-[10px] border overflow-hidden"
            style={{ borderColor: "#f1f5f9", background: "#fafafa" }}
          >
            {cart.items.length === 0 ? (
              <p className="px-4 py-3 text-[12px]" style={{ color: "#6b7280" }}>
                No items recorded for this cart.
              </p>
            ) : (
              cart.items.map((item, i) => (
                <div
                  key={item.id ?? i}
                  className="flex items-center gap-3 px-4 py-3 border-b last:border-0"
                  style={{ borderColor: "#f1f5f9" }}
                >
                  <div
                    className="w-10 h-10 rounded-[7px] overflow-hidden shrink-0 flex items-center justify-center"
                    style={{ background: "#F0FAF3" }}
                  >
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-4 h-4" style={{ color: "#94a3b8" }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: "#1C1C1C" }}>
                      {item.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-bold" style={{ color: "#1C1C1C" }}>
                      {fmtNaira(item.price_kobo * item.quantity)}
                    </p>
                    <p className="text-[11px]" style={{ color: "#6b7280" }}>
                      × {item.quantity} @ {fmtNaira(item.price_kobo)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
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
