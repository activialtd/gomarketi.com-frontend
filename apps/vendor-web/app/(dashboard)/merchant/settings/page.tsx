import React, { Suspense } from "react";
import { Metadata } from "next";
import Setting from "@/components/merchant/settings/Settings";

export const metadata: Metadata = {
  title: "Settings",
  description: "Setting",
};

const page = () => {
  return (
    <Suspense fallback={null}>
      <Setting />
    </Suspense>
  );
};

export default page;
