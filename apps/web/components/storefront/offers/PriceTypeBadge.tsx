import { Handshake } from "lucide-react";

/**
 * "Negotiable" or "Fixed price", shown wherever a product's price is.
 *
 * Negotiable is the one worth noticing, so it gets the store's own colour as
 * a pill; Fixed price is a quiet label so a grid of ordinary products does not
 * turn into a wall of badges. `tone` follows the surface it sits on — the
 * light templates (eko), the dark one (lagos), or `overlay` on top of a
 * product photo, where a bare label would vanish into the image. `square`
 * matches lagos's sharp-cornered tags.
 */
export function PriceTypeBadge({
  negotiable,
  tone = "light",
  size = "sm",
  square = false,
  className = "",
}: {
  negotiable?: boolean;
  tone?: "light" | "dark" | "overlay";
  size?: "sm" | "md";
  square?: boolean;
  className?: string;
}) {
  const text = size === "md" ? "text-[11px]" : "text-[9.5px]";
  const pad = size === "md" ? "px-2.5 py-1" : "px-2 py-0.5";
  const corners = square ? "" : "rounded-full";

  if (negotiable) {
    const look =
      tone !== "light"
        ? "bg-[var(--store-primary,#C75D3A)] text-white shadow-sm"
        : "bg-[var(--store-bg,#F0FAF3)] text-[var(--store-primary,#1A7A42)] ring-1 ring-inset ring-[var(--store-primary,#1A7A42)]/25";
    return (
      <span
        className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-bold uppercase tracking-[0.06em] ${corners} ${pad} ${text} ${look} ${className}`}
      >
        <Handshake className={size === "md" ? "h-3 w-3" : "h-2.5 w-2.5"} aria-hidden />
        Negotiable
      </span>
    );
  }

  const quiet =
    tone === "overlay"
      ? `${corners} ${pad} bg-black/55 text-white/85 backdrop-blur-sm`
      : tone === "dark"
        ? "text-white/45"
        : "text-neutral-400";
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap font-semibold uppercase tracking-[0.06em] ${text} ${quiet} ${className}`}
    >
      Fixed price
    </span>
  );
}
