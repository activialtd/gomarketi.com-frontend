import React from "react";
import { Metadata } from "next";
import Setting from "@/components/merchant/settings/Settings";

export const metadata: Metadata = {
  title: "Settings",
  description: "Setting",
};

const page = () => {
  return <Setting />;
};

export default page;
