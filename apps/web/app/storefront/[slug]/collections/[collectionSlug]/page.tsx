import Collection from "@/components/storefront/Collection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collection",
  description: "Collection",
};

export default async function CollectionPage({
  params,
}: {
  params: Promise<{
    collectionSlug: string;
  }>;
}) {
  const { collectionSlug } = await params;

  return (
    <Collection
      params={{
        collectionSlug,
      }}
    />
  );
}
