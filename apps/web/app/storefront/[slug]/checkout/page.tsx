import Checkout from "@/components/storefront/Checkout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Checkout",
};
const page = () => {
  return <Checkout />;
};

export default page;
