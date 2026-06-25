import { Suspense } from "react";
import Categories from "@/components/merchant/products/categories/Categories";
import CategoriesSkeleton from "@/components/skeletons/CategoriesSkeleton";

const page = () => (
  <Suspense fallback={<CategoriesSkeleton />}>
    <Categories />
  </Suspense>
);

export default page;
