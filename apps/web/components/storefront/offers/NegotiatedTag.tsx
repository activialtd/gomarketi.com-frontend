import { Handshake } from "lucide-react";

/** Marks a cart line priced by an agreed offer rather than the list price. */
export function NegotiatedTag({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.06em] ${
        tone === "dark"
          ? "bg-white/10 text-white/80"
          : "bg-[var(--store-bg,#F0FAF3)] text-[var(--store-primary,#1A7A42)]"
      }`}
    >
      <Handshake className="h-2.5 w-2.5" aria-hidden />
      Negotiated
    </span>
  );
}
