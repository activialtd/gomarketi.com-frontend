"use client";

import { nairaWhole } from "@/lib/api/offers";

/**
 * Offers under half the list price are refused by the orders service before
 * they ever reach the vendor ("too low to send"), so that slice of the bar is
 * drawn as blocked rather than as something the vendor will be asked about.
 */
const BUYER_MIN_FRACTION = 0.5;

/** Floor presets, as a share of the list price. */
const FLOOR_PRESETS = [0.95, 0.9, 0.85, 0.8];

/**
 * A live picture of the price range a vendor is agreeing to: what buyers see,
 * which offers close themselves, and which ones land in the Offers inbox.
 * Takes naira, because that is what the form fields hold.
 */
export function NegotiableRange({
  price,
  floor,
  onPickFloor,
}: {
  price: number;
  floor: number;
  onPickFloor: (naira: number) => void;
}) {
  const priceKobo = Math.round(price * 100);
  const floorKobo = Math.round(floor * 100);

  if (!priceKobo || priceKobo <= 0) {
    return (
      <p className="text-[11px]" style={{ color: "#94a3b8" }}>
        Set a price above to see how offers will be handled.
      </p>
    );
  }

  const valid = floorKobo > 0 && floorKobo < priceKobo;
  const blockedPct = BUYER_MIN_FRACTION * 100;
  const floorPct = valid ? Math.max((floorKobo / priceKobo) * 100, blockedPct) : null;
  const lowestOffer = Math.ceil(priceKobo * BUYER_MIN_FRACTION);
  // A floor at or under half the price means every offer a buyer is allowed
  // to send clears it — the vendor would never get a say.
  const everythingInstant = valid && floorKobo <= lowestOffer;

  return (
    <div
      className="rounded-[10px] border p-3.5 space-y-3"
      style={{ borderColor: "#e2e8f0", background: "#fafafa" }}
    >
      {/* Bar: blocked | comes to you | instant deal */}
      <div>
        <div
          className="relative h-3 rounded-full overflow-hidden flex"
          style={{ background: "#f1f5f9" }}
          aria-hidden
        >
          <div
            style={{
              width: `${blockedPct}%`,
              background:
                "repeating-linear-gradient(135deg, #e2e8f0 0 4px, #f1f5f9 4px 8px)",
            }}
          />
          {floorPct !== null ? (
            <>
              <div
                className="transition-all duration-300"
                style={{ width: `${floorPct - blockedPct}%`, background: "#fcd34d" }}
              />
              <div
                className="transition-all duration-300"
                style={{ width: `${100 - floorPct}%`, background: "#1A7A42" }}
              />
            </>
          ) : (
            <div style={{ width: `${100 - blockedPct}%`, background: "#e2e8f0" }} />
          )}
        </div>
        <div className="relative h-4 mt-1 text-[10px] font-semibold tabular-nums">
          <span className="absolute left-0" style={{ color: "#94a3b8" }}>
            ₦0
          </span>
          <span
            className="absolute -translate-x-1/2"
            style={{ left: `${blockedPct}%`, color: "#94a3b8" }}
          >
            {nairaWhole(lowestOffer)}
          </span>
          {floorPct !== null && floorPct - blockedPct > 12 && (
            <span
              className="absolute -translate-x-1/2 transition-all duration-300"
              style={{ left: `${floorPct}%`, color: "#1A7A42" }}
            >
              {nairaWhole(floorKobo)}
            </span>
          )}
          <span className="absolute right-0" style={{ color: "#1C1C1C" }}>
            {nairaWhole(priceKobo)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px]" style={{ color: "#6b7280" }}>
        <LegendDot color="#1A7A42" label="Accepted instantly" />
        <LegendDot color="#fcd34d" label="Comes to you to answer" />
        <LegendDot color="#cbd5e1" label="Too low — buyers can't send" />
      </div>

      {/* Plain-language summary */}
      <p className="text-[12px] leading-relaxed" style={{ color: "#374151" }}>
        Buyers see{" "}
        <strong style={{ color: "#1C1C1C" }}>{nairaWhole(priceKobo)} · Negotiable</strong>.{" "}
        {!valid ? (
          <span style={{ color: "#94a3b8" }}>
            Pick the lowest price you&apos;ll accept to finish the picture.
          </span>
        ) : everythingInstant ? (
          <>
            Every offer a buyer can send (from {nairaWhole(lowestOffer)}) would be accepted
            instantly — raise your lowest price if you want to counter some of them.
          </>
        ) : (
          <>
            Offers from <strong style={{ color: "#1A7A42" }}>{nairaWhole(floorKobo)}</strong>{" "}
            are accepted instantly; lower ones come to you to accept, counter or decline.
          </>
        )}
      </p>

      <p className="text-[11px]" style={{ color: "#94a3b8" }}>
        Your lowest price is private — buyers never see it.
      </p>

      {/* Quick floor presets */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#94a3b8" }}>
          Quick pick
        </span>
        {FLOOR_PRESETS.map((f) => {
          const naira = Math.round(price * f);
          const active = valid && Math.round(floor) === naira;
          return (
            <button
              key={f}
              type="button"
              onClick={() => onPickFloor(naira)}
              className="h-6 px-2 rounded-full border text-[11px] font-semibold transition-colors"
              style={{
                borderColor: active ? "#1A7A42" : "#e2e8f0",
                background: active ? "#F0FAF3" : "#fff",
                color: active ? "#1A7A42" : "#374151",
              }}
            >
              {Math.round((1 - f) * 100)}% off · {nairaWhole(naira * 100)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
