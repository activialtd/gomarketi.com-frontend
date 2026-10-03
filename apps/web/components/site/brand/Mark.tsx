// The symbol itself lives in @gomarket/ui so the dashboard and the marketing
// site cannot drift apart. Re-exported here because the site imports it by
// this path in a dozen places, and the lockup below is site-specific.
export { Mark, BRAND_GREEN, BRAND_ORANGE } from "@gomarket/ui";
import { Mark } from "@gomarket/ui";

/**
 * Full lockup: the symbol beside the GoMarket wordmark, which is how the
 * brand sets it horizontally. `tone` picks the treatment for the ground it
 * sits on.
 */
export function Wordmark({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  const textColor = tone === "light" ? "text-white" : "text-primary";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      {/* On a dark ground the mark goes solid white — the two-tone version
          loses the orange against most brand backgrounds. */}
      <Mark
        className={tone === "light" ? "h-8 w-auto shrink-0 text-white" : "h-8 w-auto shrink-0"}
        monochrome={tone === "light"}
      />
      <span
        className={`font-[family-name:var(--font-display)] text-[20px] font-extrabold leading-none tracking-tight ${textColor}`}
      >
        GoMarket
      </span>
    </span>
  );
}
