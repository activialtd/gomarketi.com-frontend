import { Role } from "@/components/merchant/staffs/helpers";
import { Crown, Users } from "lucide-react";

export const ROLE_CONFIG: Record<
  Role,
  {
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
    bg: string;
  }
> = {
  admin: {
    label: "Admin",
    description: "Super admin with full access to everything",
    icon: Crown,
    color: "#7c3aed",
    bg: "#faf5ff",
  },
  staff: {
    label: "Staff",
    description: "Standard access for all team members",
    icon: Users,
    color: "#0A2E1A",
    bg: "#F0FAF3",
  },
};
