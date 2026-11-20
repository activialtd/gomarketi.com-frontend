import AllOrders from "@/components/merchant/orders/AllOrders";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders - Vendor Dashboard",
  description: "Manage your orders on Wojalo",
};

export default function Page() {
  return (
    <main>
      <AllOrders />
    </main>
  );
}
