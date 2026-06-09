import CreateProductForm from "@/components/merchant/products/create/CreateProduct";
import { Suspense } from "react";
import OverviewSkeleton from "@/components/skeletons/OverviewSkeleton";

const page = () => {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <CreateProductForm />
    </Suspense>
  );
};

export default page;
