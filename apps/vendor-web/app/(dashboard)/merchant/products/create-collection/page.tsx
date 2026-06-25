import { Suspense } from "react";
import { Metadata } from "next";
import CreateCollection from "@/components/merchant/products/collections/CreateCollection";
import CreateCollectionSkeleton from "@/components/skeletons/CreateCollectionSkeleton";

export const metadata: Metadata = {
  title: "Create Collection | GoMarketi Vendor",
  description: "Create a new collection for your store.",
};

const page = () => (
  <Suspense fallback={<CreateCollectionSkeleton />}>
    <CreateCollection />
  </Suspense>
);

export default page;
