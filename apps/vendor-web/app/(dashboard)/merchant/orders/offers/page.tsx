import Offers from "@/components/merchant/orders/offers/Offers";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offers",
  description: "Answer buyers' offers on your negotiable products",
};

export default function page() {
  return <Offers />;
}
