import { Metadata } from "next";
import { WelcomeTour } from "@/components/merchant/welcome/WelcomeTour";

export const metadata: Metadata = { title: "Welcome | GoMarket" };

export default function WelcomePage() {
  return <WelcomeTour />;
}
