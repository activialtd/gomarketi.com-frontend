import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Wallet,
  Settings,
  Shield,
} from "lucide-react";

export const PERMISSIONS: {
  label: string;
  icon: React.ElementType;
  admin: boolean;
  staff: boolean;
}[] = [
  {
    label: "Manage products",
    icon: Package,
    admin: true,
    staff: true,
  },
  {
    label: "Process orders",
    icon: ShoppingCart,
    admin: true,
    staff: true,
  },
  {
    label: "View customers",
    icon: Users,
    admin: true,
    staff: true,
  },
  {
    label: "View analytics",
    icon: BarChart3,
    admin: true,
    staff: true,
  },
  {
    label: "Access wallet",
    icon: Wallet,
    admin: true,
    staff: false,
  },
  {
    label: "Edit store settings",
    icon: Settings,
    admin: true,
    staff: false,
  },
  {
    label: "Manage staff",
    icon: Shield,
    admin: true,
    staff: false,
  },
];
