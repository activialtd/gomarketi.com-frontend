export const ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/sign-up",
    FORGOT: "/auth/forgot-password",
    FORGOT_PASSWORD: "/auth/forgot-password",
    CALLBACK: "/auth/callback",
  },

  ONBOARDING: {
    WELCOME: "/merchant/welcome",
    PLANS: "/merchant/plans",
    SETUP: "/merchant/store-setup",
    KYC: "/merchant/kyc",
  },

  MERCHANT: {
    OVERVIEW: "/merchant",

    // Products
    PRODUCTS: "/merchant/products",
    PRODUCTS_NEW: "/merchant/products/create-product",
    PRODUCTS_EDIT: (id: string) => `/merchant/products/edit/${id}`,
    CATEGORIES: "/merchant/products/categories",
    COLLECTIONS_NEW: "/merchant/products/create-collection",

    // Orders
    ORDERS: "/merchant/orders",
    ABANDONED: "/merchant/orders/abandoned",

    // CRM
    CUSTOMERS: "/merchant/customers",
    ANALYTICS: "/merchant/analytics",
    CAMPAIGNS: "/merchant/campaigns",

    // Finance
    WALLET: "/merchant/wallet",

    // Store setup
    STORE_INFO: "/merchant/store/information",
    CUSTOMISE: "/merchant/store/customize",
    // The real staff management UI lives in the Settings "Staff & Roles"
    // tab (Settings.tsx reads ?tab= to deep-link straight to it) — there
    // used to be a separate /merchant/staffs page but it only ever rendered
    // hardcoded mock data, never the real store_staff records.
    STAFF: "/merchant/settings?tab=Staff+%26+Roles",

    // Account
    SETTINGS: "/merchant/settings",
    HELP: "https://www.gomarketi.com/help",

    // KYC
    KYC: "/merchant/kyc",
    PROFILE: "/merchant/profile",
  },
} as const;

export type AppRoute = typeof ROUTES;
