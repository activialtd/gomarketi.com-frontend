import type { Metadata } from "next";
import { OfferThread } from "@/components/storefront/offers/OfferThread";

export const metadata: Metadata = {
  title: "Your offer",
  // The email link carries the buyer's token; keep these pages out of indexes.
  robots: { index: false },
  referrer: "no-referrer",
};

// The backend emails buyers https://<slug>.<root>/offers/<id>?token=<token>;
// proxy.ts rewrites that here with the query intact.
export default async function OfferPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const [{ slug, id }, sp] = await Promise.all([params, searchParams]);
  const token = Array.isArray(sp.token) ? sp.token[0] : sp.token;
  return <OfferThread slug={slug} id={id} tokenFromUrl={token || undefined} />;
}
