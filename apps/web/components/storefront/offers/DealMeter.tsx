import { DEAL_TONE_COLOR, dealMeter } from "@/lib/offers";

// Bands of the meter, in % below the list price. The last one runs to 50%,
// the lowest offer the server will take.
const BANDS = [
  { upTo: 5, tone: "great" },
  { upTo: 15, tone: "fair" },
  { upTo: 30, tone: "bold" },
  { upTo: 50, tone: "longshot" },
] as const;

/**
 * How an offer reads against the list price: Very likely → Long shot.
 *
 * Deliberately computed from the list price alone. The vendor's floor never
 * reaches the storefront, and this must not be mistaken for knowing it — so
 * the caption says as much.
 */
export function DealMeter({
  listKobo,
  offerKobo,
}: {
  listKobo: number;
  offerKobo: number | null;
}) {
  const valid = offerKobo != null && Number.isFinite(offerKobo) && offerKobo > 0;
  const meter = valid ? dealMeter(listKobo, offerKobo) : null;
  // Marker position along 0–50% off.
  const pos = meter ? Math.min(100, Math.max(0, (meter.pctOff / 50) * 100)) : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-neutral-500">
          Deal meter
        </span>
        {meter ? (
          <span className="text-[13px] font-extrabold" style={{ color: DEAL_TONE_COLOR[meter.tone] }}>
            {meter.label}
            <span className="ml-1.5 text-[11px] font-semibold text-neutral-400">
              {meter.pctOff < 0.5 ? "at list price" : `${Math.round(meter.pctOff)}% below list`}
            </span>
          </span>
        ) : (
          <span className="text-[12px] text-neutral-400">Enter an amount</span>
        )}
      </div>
      <div className="relative h-2">
        <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
          {BANDS.map((b, i) => {
            const from = i === 0 ? 0 : BANDS[i - 1].upTo;
            return (
              <div
                key={b.tone}
                className="h-full transition-opacity"
                style={{
                  width: `${((b.upTo - from) / 50) * 100}%`,
                  background: DEAL_TONE_COLOR[b.tone],
                  opacity: meter && meter.tone === b.tone ? 1 : 0.22,
                }}
              />
            );
          })}
        </div>
        {meter && (
          <div
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow transition-[left] duration-300"
            style={{ left: `${pos}%`, background: DEAL_TONE_COLOR[meter.tone] }}
            aria-hidden
          />
        )}
      </div>
      <p className="mt-1.5 text-[10.5px] leading-snug text-neutral-400">
        A guide based on the listed price only — the seller decides.
      </p>
    </div>
  );
}
