import { Mark } from "./brand/Mark";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type MarketResp = { id: string; name: string; city: string; state: string };

/**
 * Two rows of market names drifting in opposite directions.
 *
 * The list comes from the storefront service, so the site always shows the
 * markets that are genuinely live rather than a hardcoded copy that drifts.
 * If the API is unreachable at build time the fallback below keeps the
 * section intact — this is marketing copy, not data the visitor acts on.
 */

const FALLBACK: Pick<MarketResp, "name" | "city">[] = [
  { name: "Balogun Market", city: "Lagos Island" },
  { name: "Computer Village", city: "Ikeja" },
  { name: "Mile 12 Market", city: "Kosofe" },
  { name: "Agege Market", city: "Agege" },
  { name: "Ladipo Market", city: "Mushin" },
  { name: "Oyingbo Market", city: "Ebute Metta" },
  { name: "Tejuosho Market", city: "Yaba" },
  { name: "Alaba International Market", city: "Ojo" },
  { name: "Lagos International Trade Fair", city: "Ojo" },
  { name: "Onitsha Main Market", city: "Onitsha" },
];

async function getMarkets() {
  try {
    const res = await fetch(`${API_URL}/v1/storefront/public/markets`, {
      // Markets change rarely; an hour keeps the page fast without going stale.
      next: { revalidate: 3600 },
    });
    if (!res.ok) return FALLBACK;
    const markets = (await res.json()) as MarketResp[];
    // "General Market" is the catch-all a vendor picks when their market is
    // not listed — it is not a place, so it does not belong on this wall.
    const real = markets.filter((m) => m.state?.toLowerCase() !== "any");
    return real.length ? real : FALLBACK;
  } catch {
    return FALLBACK;
  }
}

function Row({
  markets,
  duration,
  reverse,
}: {
  markets: Pick<MarketResp, "name" | "city">[];
  duration: string;
  reverse?: boolean;
}) {
  // The track holds the list twice so the loop has no visible seam.
  const doubled = [...markets, ...markets];

  return (
    <div className="flex overflow-hidden" aria-hidden={reverse ? "true" : undefined}>
      <div
        className="marquee-track flex shrink-0 items-center gap-6 pr-6"
        style={
          {
            "--marquee-duration": duration,
            animationDirection: reverse ? "reverse" : undefined,
          } as React.CSSProperties
        }
      >
        {doubled.map((market, i) => (
          <span
            key={`${market.name}-${i}`}
            className="flex shrink-0 items-center gap-4 rounded-full border border-border bg-background px-7 py-4"
          >
            <Mark className="w-5 shrink-0 text-primary-accent" />
            <span className="font-[family-name:var(--font-display)] text-lg font-bold whitespace-nowrap text-foreground">
              {market.name}
            </span>
            <span className="text-sm whitespace-nowrap text-muted">
              {market.city}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export async function MarketMarquee() {
  const markets = await getMarkets();
  const half = Math.ceil(markets.length / 2);

  return (
    <div className="space-y-5">
      <Row markets={markets.slice(0, half)} duration="52s" />
      <Row markets={markets.slice(half)} duration="64s" reverse />
    </div>
  );
}
