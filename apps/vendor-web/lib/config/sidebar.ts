import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Wallet,
  Tag,
  RotateCcw,
  UserCheck,
  Globe,
  Receipt,
  Building2,
  Layers,
  Plus,
  Mail,
} from "lucide-react";
import { ROUTES } from "./routes";
import type { StaffRole } from "@/store/useAuthStore";

export type NavItem = {
  label: string;
  href?: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: "green" | "red" | "gray";
  exact?: boolean;
  children?: NavItem[];
  /** Staff roles that may see this item. Omit = vendor-only (hidden from all staff). */
  allowedRoles?: StaffRole[];
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

export const NAV: NavSection[] = [
  {
    title: "Quick Access",
    items: [
      {
        label: "Dashboard",
        href: ROUTES.MERCHANT.OVERVIEW,
        icon: LayoutDashboard,
        exact: true,
        allowedRoles: ["manager", "fulfillment", "support", "analytics_only"],
      },
      {
        label: "Products",
        icon: Package,
        allowedRoles: ["manager"],
        children: [
          {
            label: "All Products",
            href: ROUTES.MERCHANT.PRODUCTS,
            icon: Layers,
            exact: true,
          },
          {
            label: "Add Product",
            href: ROUTES.MERCHANT.PRODUCTS_NEW,
            icon: Plus,
          },
          {
            label: "Categories",
            href: ROUTES.MERCHANT.CATEGORIES,
            icon: Tag,
          },
          {
            label: "Collections",
            href: ROUTES.MERCHANT.COLLECTIONS_NEW,
            icon: Layers,
          },
        ],
      },
      {
        label: "Orders",
        icon: ShoppingCart,
        allowedRoles: ["manager", "fulfillment", "support"],
        children: [
          {
            label: "All Orders",
            href: ROUTES.MERCHANT.ORDERS,
            icon: Receipt,
            exact: true,
          },
          {
            label: "Abandoned",
            href: ROUTES.MERCHANT.ABANDONED,
            icon: RotateCcw,
          },
        ],
      },
      {
        label: "Customers",
        href: ROUTES.MERCHANT.CUSTOMERS,
        icon: Users,
        allowedRoles: ["manager", "support"],
      },
      {
        label: "Analytics",
        href: ROUTES.MERCHANT.ANALYTICS,
        icon: BarChart3,
        allowedRoles: ["manager", "analytics_only"],
      },
      {
        label: "Campaigns",
        href: ROUTES.MERCHANT.CAMPAIGNS,
        icon: Mail,
        allowedRoles: ["manager"],
      },
      {
        label: "GoMarket Wallet",
        href: ROUTES.MERCHANT.WALLET,
        icon: Wallet,
        allowedRoles: ["manager"],
      },
    ],
  },
  {
    title: "Store Setup",
    items: [
      {
        label: "Store Information",
        href: ROUTES.MERCHANT.STORE_INFO,
        icon: Building2,
        // vendor-only: staff cannot edit store information
      },
      {
        label: "Customisation",
        href: ROUTES.MERCHANT.CUSTOMISE,
        icon: Globe,
        allowedRoles: ["manager"],
      },
      {
        label: "Staff & Roles",
        href: ROUTES.MERCHANT.STAFF,
        icon: UserCheck,
        // vendor-only: staff cannot manage other staff
      },
    ],
  },
];
