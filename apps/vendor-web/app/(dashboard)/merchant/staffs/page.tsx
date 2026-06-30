import React from "react";
import StaffPage from "@/components/merchant/staffs/Staffs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staffs | GoMarketi",
  description: "Staffs | GoMarketi",
};

const page = () => {
  return <StaffPage />;
};

export default page;
