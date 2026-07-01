const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://prenatal-slather-explicit.ngrok-free.dev";

// ── Request types ──────────────────────────────────────────────────────────────

export interface RegisterReq {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  terms_accepted: boolean;
  marketing_consent: boolean;
}

export interface LoginReq {
  email: string;
  password: string;
}

export interface OTPVerifyReq {
  session_token: string;
  otp: string;
  device_id?: string;
}

export interface CreateStoreReq {
  name: string;
  slug: string;
  category: string;
  currency: string;
  team_size?: string;
  support_phone?: string;
}

export interface UpdateStoreReq {
  name?: string;
  tagline?: string;
  logo_url?: string;
  support_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  theme_config?: string; // raw JSON string stored as JSONB
}

export interface CreateProductReq {
  name: string;
  description?: string;
  category_id?: string;
  price_kobo: number;
  stock: number;
  sku?: string;
  images: string[];
  tags: string[];
  is_digital: boolean;
}

export interface UpdateProductReq {
  name?: string;
  description?: string;
  category_id?: string;
  price_kobo?: number;
  stock?: number;
  sku?: string;
  images?: string[];
  tags?: string[];
}

export interface CategoryReq {
  name: string;
  parent_id?: string;
}

// ── Response types ─────────────────────────────────────────────────────────────

export interface UserDTO {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  is_email_verified: boolean;
  profile_completed: boolean;
  is_buyer: boolean;
  is_vendor: boolean;
}

export interface AuthResp {
  access_token: string;
  user: UserDTO;
}

export interface OTPRequestResp {
  session_token: string;
  expires_in: number;
}

export interface StoreResp {
  id: string;
  vendor_id: string;
  name: string;
  slug: string;
  category: string;
  currency: string;
  team_size?: string;
  staff_range?: string;
  tagline?: string;
  logo_url?: string;
  support_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  theme_config?: string; // raw JSON string
  is_active: boolean;
  created_at: string;
}

export interface SlugCheckResp {
  slug: string;
  available: boolean;
}

export interface ProductResp {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  category_id?: string;
  price_kobo: number;
  stock: number;
  sku?: string;
  images: string[];
  tags: string[];
  is_digital: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductListResp {
  products: ProductResp[];
  total: number;
  page: number;
  per_page: number;
}

export interface CategoryResp {
  id: string;
  store_id: string;
  name: string;
  parent_id?: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  image_url?: string;
  quantity: number;
  price_kobo: number;
}

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface OrderResp {
  id: string;
  store_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  status: OrderStatus;
  items: OrderItem[];
  total_kobo: number;
  delivery_address: string;
  created_at: string;
  updated_at: string;
}

export interface OrderListResp {
  orders: OrderResp[];
  total: number;
  page: number;
  per_page: number;
}

export interface AnalyticsOverviewResp {
  total_revenue_kobo: number;
  total_orders: number;
  total_customers: number;
  pending_orders: number;
  low_stock_products: number;
}

export interface CreateOrderItem {
  product_id: string;
  name: string;
  image_url?: string;
  quantity: number;
  price_kobo: number;
}

export interface CreateOrderReq {
  store_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  delivery_address?: string;
  items: CreateOrderItem[];
  payment_reference: string;
}

export interface AbandonedCartResp {
  id: string;
  store_id: string;
  customer_id?: string;
  customer_email?: string;
  items: OrderItem[];
  total_kobo: number;
  abandoned_at: string;
}

export interface CustomerResp {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  total_orders: number;
  total_spent_kobo: number;
  last_order_at?: string;
}

export interface CustomerListResp {
  customers: CustomerResp[];
  total: number;
  page: number;
  per_page: number;
}

export interface WalletTransactionResp {
  id: string;
  type: "credit" | "debit";
  amount_kobo: number;
  description: string;
  reference?: string;
  status: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  created_at: string;
}

export interface WalletResp {
  balance_kobo: number;
  total_earned_kobo: number;
  transactions: WalletTransactionResp[];
}

export interface WithdrawReq {
  amount_kobo: number;
  bank_name: string;
  account_number: string;
  account_name: string;
}

export interface TopProductResp {
  product_id: string;
  name: string;
  image_url?: string;
  units_sold: number;
  revenue_kobo: number;
}

// ── Error class ────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fields?: Array<{ field: string; message: string }>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Token refresh callback ─────────────────────────────────────────────────────
// Components can register a callback that the request() wrapper calls when it
// gets a 401, so the token is refreshed transparently and the call is retried.

type RefreshCallback = () => Promise<string | null>;
let _onTokenExpired: RefreshCallback | null = null;

export function setTokenRefreshCallback(cb: RefreshCallback) {
  _onTokenExpired = cb;
}

// ── Fetch wrapper ──────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  init?: RequestInit,
  accessToken?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  // Auto-refresh: if 401 and a refresh callback is registered, retry once
  if (res.status === 401 && _onTokenExpired) {
    const newToken = await _onTokenExpired().catch(() => null);
    if (newToken) {
      const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
      const retry = await fetch(`${API_BASE}${path}`, {
        ...init,
        credentials: "include",
        headers: retryHeaders,
      });
      if (retry.ok) {
        if (retry.status === 204) return undefined as T;
        return retry.json() as Promise<T>;
      }
      const retryBody = (await retry.json().catch(() => ({}))) as { error?: string; fields?: Array<{ field: string; message: string }> };
      throw new ApiError(retry.status, retryBody.error ?? retry.statusText, retryBody.fields);
    }
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      fields?: Array<{ field: string; message: string }>;
    };
    throw new ApiError(res.status, body.error ?? res.statusText, body.fields);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Auth API ───────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: RegisterReq) =>
    request<AuthResp>("/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: LoginReq) =>
    request<AuthResp>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  requestOTP: (email: string) =>
    request<OTPRequestResp>("/v1/auth/otp/request", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  verifyOTP: (data: OTPVerifyReq) =>
    request<AuthResp>("/v1/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  refreshTokens: () =>
    request<AuthResp>("/v1/auth/token/refresh", { method: "POST" }),

  logout: () => request<void>("/v1/auth/logout", { method: "POST" }),

  // OAuth — backend validates the id_token against Google/Apple JWKS
  googleAuth: (id_token: string) =>
    request<AuthResp>("/v1/auth/oauth/google", {
      method: "POST",
      body: JSON.stringify({ id_token }),
    }),

  appleAuth: (id_token: string, first_name?: string, last_name?: string) =>
    request<AuthResp>("/v1/auth/oauth/apple", {
      method: "POST",
      body: JSON.stringify({ id_token, first_name, last_name }),
    }),
};

// ── Upload API ─────────────────────────────────────────────────────────────────

export interface PresignResp {
  upload_url: string;
  public_url: string;
  key: string;
  expires_in: number;
}

export interface CollectionResp {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_published: boolean;
  product_ids: string[];
  created_at: string;
}

export interface CreateCollectionReq {
  name: string;
  description?: string;
  image_url?: string;
  product_ids?: string[];
}

export interface UpdateCollectionReq {
  name?: string;
  description?: string;
  image_url?: string;
  product_ids?: string[];
}

export const uploadApi = {
  presign: (data: { filename: string; content_type: string; size: number; purpose?: string }, token: string) =>
    request<PresignResp>("/v1/storefront/uploads/presign", {
      method: "POST", body: JSON.stringify(data),
    }, token),
};

// ── Storefront API ─────────────────────────────────────────────────────────────

export const storefrontApi = {
  createStore: (data: CreateStoreReq, token: string) =>
    request<StoreResp>(
      "/v1/storefront/stores",
      { method: "POST", body: JSON.stringify(data) },
      token,
    ),

  getMyStore: (token: string) =>
    request<StoreResp>("/v1/storefront/stores/mine", {}, token),

  updateStore: (id: string, data: UpdateStoreReq, token: string) =>
    request<StoreResp>(
      `/v1/storefront/stores/${id}`,
      { method: "PATCH", body: JSON.stringify(data) },
      token,
    ),

  checkSlug: (slug: string, token: string) =>
    request<SlugCheckResp>(
      `/v1/storefront/slugs/check?slug=${encodeURIComponent(slug)}`,
      {},
      token,
    ),
};

// ── Catalogue API ──────────────────────────────────────────────────────────────

export const catalogueApi = {
  listProducts: (
    params: {
      page?: number;
      per_page?: number;
      category_id?: string;
      q?: string;
      published_only?: boolean;
    },
    token: string,
  ) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.per_page) qs.set("per_page", String(params.per_page));
    if (params.category_id) qs.set("category_id", params.category_id);
    if (params.q) qs.set("q", params.q);
    if (params.published_only) qs.set("published_only", "true");
    return request<ProductListResp>(`/v1/catalogue/products?${qs}`, {}, token);
  },

  createProduct: (data: CreateProductReq, token: string) =>
    request<ProductResp>(
      "/v1/catalogue/products",
      { method: "POST", body: JSON.stringify(data) },
      token,
    ),

  getProduct: (id: string, token: string) =>
    request<ProductResp>(`/v1/catalogue/products/${id}`, {}, token),

  updateProduct: (id: string, data: UpdateProductReq, token: string) =>
    request<ProductResp>(
      `/v1/catalogue/products/${id}`,
      { method: "PATCH", body: JSON.stringify(data) },
      token,
    ),

  deleteProduct: (id: string, token: string) =>
    request<void>(`/v1/catalogue/products/${id}`, { method: "DELETE" }, token),

  publishProduct: (id: string, token: string) =>
    request<ProductResp>(
      `/v1/catalogue/products/${id}/publish`,
      { method: "POST" },
      token,
    ),

  unpublishProduct: (id: string, token: string) =>
    request<ProductResp>(
      `/v1/catalogue/products/${id}/unpublish`,
      { method: "POST" },
      token,
    ),

  listCategories: (token: string) =>
    request<{ categories: CategoryResp[] }>("/v1/catalogue/categories", {}, token)
      .then((r) => r.categories),

  createCategory: (data: CategoryReq, token: string) =>
    request<CategoryResp>(
      "/v1/catalogue/categories",
      { method: "POST", body: JSON.stringify(data) },
      token,
    ),

  updateCategory: (id: string, data: CategoryReq, token: string) =>
    request<CategoryResp>(
      `/v1/catalogue/categories/${id}`,
      { method: "PATCH", body: JSON.stringify(data) },
      token,
    ),

  deleteCategory: (id: string, token: string) =>
    request<void>(
      `/v1/catalogue/categories/${id}`,
      { method: "DELETE" },
      token,
    ),

  listCollections: (token: string) =>
    request<{ collections: CollectionResp[] }>("/v1/catalogue/collections", {}, token),

  createCollection: (data: CreateCollectionReq, token: string) =>
    request<CollectionResp>("/v1/catalogue/collections", { method: "POST", body: JSON.stringify(data) }, token),

  updateCollection: (id: string, data: UpdateCollectionReq, token: string) =>
    request<CollectionResp>(`/v1/catalogue/collections/${id}`, { method: "PATCH", body: JSON.stringify(data) }, token),

  deleteCollection: (id: string, token: string) =>
    request<void>(`/v1/catalogue/collections/${id}`, { method: "DELETE" }, token),

  publishCollection: (id: string, token: string) =>
    request<CollectionResp>(`/v1/catalogue/collections/${id}/publish`, { method: "POST" }, token),

  unpublishCollection: (id: string, token: string) =>
    request<CollectionResp>(`/v1/catalogue/collections/${id}/unpublish`, { method: "POST" }, token),
};

// ── Orders API ─────────────────────────────────────────────────────────────────

export const ordersApi = {
  listOrders: (
    params: { page?: number; per_page?: number; status?: string; q?: string },
    token: string,
  ) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.per_page) qs.set("per_page", String(params.per_page));
    if (params.status) qs.set("status", params.status);
    if (params.q) qs.set("search", params.q); // backend query param is `search`, not `q`
    return request<OrderListResp>(`/v1/orders?${qs}`, {}, token);
  },

  getOrder: (id: string, token: string) =>
    request<OrderResp>(`/v1/orders/${id}`, {}, token),

  updateOrderStatus: (id: string, status: OrderStatus, token: string) =>
    request<OrderResp>(
      `/v1/orders/${id}/status`,
      { method: "PATCH", body: JSON.stringify({ status }) },
      token,
    ),

  // No auth — called directly from the storefront checkout after payment succeeds.
  createOrder: (data: CreateOrderReq) =>
    request<OrderResp>("/v1/orders/public", { method: "POST", body: JSON.stringify(data) }),

  listAbandonedCarts: (params: { page?: number; per_page?: number }, token: string) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.per_page) qs.set("per_page", String(params.per_page));
    return request<{ carts: AbandonedCartResp[] }>(`/v1/orders/abandoned?${qs}`, {}, token);
  },
};

// ── Analytics API ──────────────────────────────────────────────────────────────

export const analyticsApi = {
  getOverview: (token: string) =>
    request<AnalyticsOverviewResp>("/v1/analytics/overview", {}, token),

  getTopProducts: (limit: number, token: string) =>
    request<{ products: TopProductResp[] }>(`/v1/analytics/top-products?limit=${limit}`, {}, token)
      .then((r) => r.products),
};

// ── CRM / Customers API ───────────────────────────────────────────────────────

export const crmApi = {
  listCustomers: (params: { page?: number; per_page?: number; q?: string }, token: string) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.per_page) qs.set("per_page", String(params.per_page));
    if (params.q) qs.set("search", params.q);
    return request<CustomerListResp>(`/v1/crm/customers?${qs}`, {}, token);
  },

  getCustomer: (id: string, token: string) =>
    request<CustomerResp>(`/v1/crm/customers/${id}`, {}, token),
};

// ── Wallet API ─────────────────────────────────────────────────────────────────

export const walletApi = {
  getBalance: (token: string) =>
    request<WalletResp>("/v1/wallet/balance", {}, token),

  withdraw: (data: WithdrawReq, token: string) =>
    request<WalletResp>("/v1/wallet/withdraw", { method: "POST", body: JSON.stringify(data) }, token),
};

// ── Identity / Plans API ───────────────────────────────────────────────────────

export interface PlanResp {
  id: string;
  slug: string;
  display_name: string;
  description: string;
  price_kobo: number;
  billing_cycle: string;
  product_limit: number;
  store_limit: number;
  team_limit: number;
  features: string[];
  sort_order: number;
}

export interface SubscriptionResp {
  id: string;
  plan_id: string;
  plan: PlanResp;
  status: string;
  payment_reference?: string;
  current_period_start: string;
  current_period_end?: string;
}

export const identityApi = {
  listPlans: (token: string) =>
    request<{ plans: PlanResp[] }>("/v1/identity/plans", {}, token)
      .then((r) => r.plans),

  selectPlan: (data: { plan_id: string; payment_reference?: string }, token: string) =>
    request<SubscriptionResp>("/v1/identity/vendor/plan", { method: "POST", body: JSON.stringify(data) }, token),

  getSubscription: (token: string) =>
    request<SubscriptionResp>("/v1/identity/vendor/subscription", {}, token),

  startOnboarding: (token: string) =>
    request<{ id: string; onboarding_step: string }>("/v1/identity/vendor/onboard", { method: "POST" }, token),

  updateBusiness: (data: {
    business_name: string;
    business_type: string;
    employee_range?: string;
    year_established?: number;
    social_url?: string;
  }, token: string) =>
    request<{ onboarding_step: string }>("/v1/identity/vendor/onboard/business", { method: "PATCH", body: JSON.stringify(data) }, token),

  submitKYC: (data: {
    bvn?: string;
    nin?: string;
    cac_number?: string;
    cac_document_url?: string;
    id_type?: string;
    id_number?: string;
    id_document_url?: string;
    selfie_url?: string;
  }, token: string) =>
    request<{ kyc_status: string; onboarding_step: string }>("/v1/identity/vendor/onboard/kyc", { method: "POST", body: JSON.stringify(data) }, token),

  getVendorProfile: (token: string) =>
    request<{
      id: string;
      business_name?: string;
      business_type?: string;
      has_bvn: boolean;
      has_nin: boolean;
      cac_number?: string;
      id_type?: string;
      kyc_status: string;
      onboarding_step: string;
      is_active: boolean;
    }>("/v1/identity/vendor/profile", {}, token),

  getMe: (token: string) =>
    request<{
      id: string;
      email?: string;
      full_name?: string;
      is_email_verified: boolean;
      vendor?: { id: string; onboarding_step: string; kyc_status: string; is_active: boolean };
    }>("/v1/identity/me", {}, token),
};
