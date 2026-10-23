import type { Metadata } from "next";
import { OffersList } from "@/components/storefront/offers/OffersList";

export const metadata: Metadata = {
  title: "My offers",
  // Per-device list, nothing for a search engine.
  robots: { index: false },
};

export default async function OffersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <OffersList slug={slug} />;
}
