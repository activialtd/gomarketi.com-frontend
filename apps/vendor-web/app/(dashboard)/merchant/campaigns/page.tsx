import { Metadata } from "next";
import Campaigns from "@/components/merchant/campaigns/Campaigns";

export const metadata: Metadata = {
  title: "Email Campaigns",
  description: "Send newsletters and campaigns to your subscribers",
};

export default function CampaignsPage() {
  return <Campaigns />;
}
