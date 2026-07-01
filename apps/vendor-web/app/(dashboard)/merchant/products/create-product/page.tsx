import { Suspense } from "react";
import CreateProductForm from "@/components/merchant/products/create/CreateProduct";
import CreateProductSkeleton from "@/components/skeletons/CreateProductSkeleton";

const page = () => (
  <Suspense fallback={<CreateProductSkeleton />}>
    <CreateProductForm />
  </Suspense>
);

export default page;
