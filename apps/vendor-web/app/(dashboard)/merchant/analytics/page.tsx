import Analytics from "@/components/merchant/analytics/Analytics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Analytics",
};

const page = () => {
  return <Analytics />;
};

export default page;
