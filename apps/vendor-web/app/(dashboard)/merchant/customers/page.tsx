import Customers from "@/components/merchant/customers/AllCustomers";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customers",
  description: "Customers",
};

const page = () => {
  return <Customers />;
};

export default page;
