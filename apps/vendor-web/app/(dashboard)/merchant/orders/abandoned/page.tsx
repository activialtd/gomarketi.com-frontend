import Abandoned from "@/components/merchant/orders/abandoned/Abandoned";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Abandoned Orders",
  description: "Recover abandoned orders",
};

export default function page() {
  return <Abandoned />;
}
