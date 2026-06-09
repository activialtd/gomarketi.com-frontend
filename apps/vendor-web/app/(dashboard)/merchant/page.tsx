import OverviewPage from "@/components/merchant/Overview";
import { Suspense } from "react";
import OverviewSkeleton from "@/components/skeletons/OverviewSkeleton";

const page = () => {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <OverviewPage />
    </Suspense>
  );
};

export default page;
