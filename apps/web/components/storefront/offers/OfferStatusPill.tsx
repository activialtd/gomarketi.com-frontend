import { STATUS_COPY, type OfferStatus } from "@/lib/offers";

const TONE_CLASS = {
  action: "bg-amber-50 text-amber-800 ring-amber-200",
  good: "bg-[var(--store-bg,#F0FAF3)] text-[var(--store-primary,#1A7A42)] ring-[var(--store-primary,#1A7A42)]/25",
  wait: "bg-neutral-100 text-neutral-600 ring-neutral-200",
  closed: "bg-neutral-50 text-neutral-400 ring-neutral-200",
} as const;

export function OfferStatusPill({ status }: { status: OfferStatus }) {
  const copy = STATUS_COPY[status] ?? { label: status, tone: "wait" as const };
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${TONE_CLASS[copy.tone]}`}
    >
      {copy.label}
    </span>
  );
}
