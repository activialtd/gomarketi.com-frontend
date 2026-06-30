import { Suspense } from "react";
import CreateProductForm from "@/components/merchant/products/create/CreateProduct";
import CreateProductSkeleton from "@/components/skeletons/CreateProductSkeleton";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<CreateProductSkeleton />}>
      <CreateProductForm productId={id} />
    </Suspense>
  );
}
