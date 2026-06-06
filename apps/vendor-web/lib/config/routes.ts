export const ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    FORGOT: "/auth/forgot-password",
    CALLBACK: "/auth/callback",
  },

  ONBOARDING: {
    SETUP: "/merchant/store-setup",
  },

  MERCHANT: {
    OVERVIEW: "/merchant",

    // Products
    PRODUCTS: "/merchant/products",
    PRODUCT_FILTER: "/merchant/products/filter",
    CATEGORIES: "/merchant/products/categories",

    // Orders
    ORDERS: "/merchant/orders",
    ABANDONED: "/merchant/orders/abandoned",

    // CRM
    CUSTOMERS: "/merchant/customers",
    ANALYTICS: "/merchant/analytics",

    // Finance
    WALLET: "/merchant/wallet",
    PAYOUTS: "/merchant/finance/payouts",
    INVOICES: "/merchant/finance/invoices",

    // Growth
    MARKETING: "/merchant/marketing",
    EXTENSIONS: "/merchant/extensions",

    // Store setup
    STORE_INFO: "/merchant/store/information",
    CUSTOMISE: "/merchant/store/customise",
    STAFF: "/merchant/store/staff",
    MORE: "/merchant/store/more",

    // Account
    SETTINGS: "/merchant/settings",
    HELP: "/merchant/help",
  },
} as const;

export type AppRoute = typeof ROUTES;
