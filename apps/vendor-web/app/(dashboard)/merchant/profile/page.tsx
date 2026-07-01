import ProfilePage from "@/components/merchant/Profile/Profile";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "Profile",
};

const page = () => {
  return <ProfilePage />;
};

export default page;
