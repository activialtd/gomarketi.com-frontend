import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Wallet,
  Megaphone,
  Puzzle,
  Tag,
  RotateCcw,
  UserCheck,
  Globe,
  CreditCard,
  Receipt,
  Building2,
  Layers,
  Plus,
} from "lucide-react";
import { ROUTES } from "./routes";

export type NavItem = {
  label: string;
  href?: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: "green" | "red" | "gray";
  exact?: boolean;
  children?: NavItem[];
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
      },
      {
        label: "Products",
        icon: Package,
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
      },
      {
        label: "Analytics",
        href: ROUTES.MERCHANT.ANALYTICS,
        icon: BarChart3,
      },
      {
        label: "GoMarket Wallet",
        href: ROUTES.MERCHANT.WALLET,
        icon: Wallet,
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        label: "Payouts",
        href: ROUTES.MERCHANT.PAYOUTS,
        icon: CreditCard,
        badge: "New",
        badgeVariant: "green",
      },
      {
        label: "Invoices",
        href: ROUTES.MERCHANT.INVOICES,
        icon: Receipt,
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
      },
      {
        label: "Customisation",
        href: ROUTES.MERCHANT.CUSTOMISE,
        icon: Globe,
      },
      {
        label: "Staff & Roles",
        href: ROUTES.MERCHANT.STAFF,
        icon: UserCheck,
      },
    ],
  },
];
