import React from "react";
import { Metadata } from "next";
import Wallet from "@/components/merchant/wallet/Wallet";

export const metadata: Metadata = {
  title: "Wallet",
  description: "Wallet",
};
const page = () => {
  return <Wallet />;
};

export default page;
