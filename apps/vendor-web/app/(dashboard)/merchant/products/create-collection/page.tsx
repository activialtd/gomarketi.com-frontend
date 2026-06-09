import CreateCollection from "@/components/merchant/products/collections/CreateCollection";
import { Metadata } from "next";
import { Suspense } from "react";
import OverviewSkeleton from "@/components/skeletons/OverviewSkeleton";

export const metadata: Metadata = {
  title: "Create Collection | GoMarket Vendor",
  description: "Create a new collection for your store.",
};

const page = () => {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <CreateCollection />
    </Suspense>
  );
};

export default page;
