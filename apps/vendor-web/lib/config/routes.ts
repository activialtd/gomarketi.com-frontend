export const ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/sign-up",
    FORGOT: "/auth/forgot-password",
    CALLBACK: "/auth/callback",
  },

  ONBOARDING: {
    WELCOME: "/merchant/welcome",
    SETUP: "/merchant/store-setup",
  },

  MERCHANT: {
    OVERVIEW: "/merchant",

    // Products
    PRODUCTS: "/merchant/products",
    PRODUCTS_NEW: "/merchant/products/create-product",
    CATEGORIES: "/merchant/products/categories",
    COLLECTIONS_NEW: "/merchant/products/create-collection",

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
