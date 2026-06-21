import { STORE_CONFIG } from "@/lib/storeConfig";
import EkoCollection from "@/components/storefront/eko/EkoCollection";
import LagosCollection from "@/components/storefront/lagos/LagosCollection";
import { use } from "react";

export default function CollectionPage({
  params,
}: {
  params: Promise<{ collectionSlug: string }>;
}) {
  const { collectionSlug } = use(params);
  switch (STORE_CONFIG.template) {
    case "lagos":
      return <LagosCollection collectionSlug={collectionSlug} />;
    case "eko":
    default:
      return <EkoCollection collectionSlug={collectionSlug} />;
  }
}
