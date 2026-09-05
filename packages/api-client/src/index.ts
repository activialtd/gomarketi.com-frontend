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
  market_id?: string;
  theme_config?: string; // raw JSON string stored as JSONB
}

export interface MarketResp {
  id: string;
  name: string;
  city: string;
  state: string;
}

// ── Store customization types ──────────────────────────────────────────────────

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  tiktok?: string;
  whatsapp?: string;
  youtube?: string;
}

export interface ThemeConfig {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_heading: string;
  font_body: string;
  hero_style: "full" | "split" | "minimal" | "none";
  products_per_row: 2 | 3 | 4;
  button_style: "rounded" | "sharp" | "pill";
  show_hero: boolean;
  show_featured: boolean;
  show_categories: boolean;
}

export interface StoreUpdatePayload {
  name?: string;
  description?: string;
  tagline?: string;
  site_description?: string;
  logo_url?: string;
  hero_image_url?: string;
  social_links?: SocialLinks;
  theme_config?: Partial<ThemeConfig>;
}

export interface StoreAssetResp {
  url: string;
  type: string;
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
  canonical_product_id?: string;
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
  canonical_product_id?: string;
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
  hero_image_url?: string;
  support_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  market_id?: string;
  market_name?: string;
  description?: string;
  site_description?: string;
  social_links?: SocialLinks;
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
  canonical_product_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductListResp {
  products: ProductResp[];
  total: number;
  page: number;
  per_page: number;
}

export interface CanonicalProductResp {
  id: string;
  name: string;
  representative_image?: string;
}

export interface CanonicalProductSearchResp {
  products: CanonicalProductResp[];
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

// at_hub/shipped/delivered are hub-and-spoke states a vendor can only ever
// read, never set — see VendorSettableOrderStatus below for what a vendor's
// own PATCH /v1/orders/:id/status call may actually request.
export type OrderStatus = "pending" | "confirmed" | "at_hub" | "shipped" | "delivered" | "cancelled";

// The backend restricts a vendor's own status PATCH to these two values —
// at_hub/shipped/delivered are exclusively admin-hub-intake/dispatch/buyer-
// confirmation controlled under the consolidation-hub fulfillment model.
export type VendorSettableOrderStatus = "confirmed" | "cancelled";

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
  total_discounts_kobo: number;
  total_expenses_kobo: number;
  storefront_visits_30d: number;
}

// ── Newsletter / Campaigns ────────────────────────────────────────────────────

export interface SubscriberResp {
  id: string;
  email: string;
  name: string;
  subscribed_at: string;
  unsubscribed: boolean;
}

export interface SubscriberListResp {
  subscribers: SubscriberResp[];
  total: number;
  page: number;
  per_page: number;
}

export interface CreateCampaignReq {
  subject: string;
  body_html: string;
}

export interface CampaignResp {
  id: string;
  subject: string;
  status: string;
  recipients_count: number;
  created_at: string;
  sent_at?: string;
}

// ── Payment gateways ──────────────────────────────────────────────────────────

export interface PaymentGatewayResp {
  gateway: string;
  enabled: boolean;
  config: Record<string, unknown>;
  updated_at?: string;
}

export interface UpsertPaymentGatewayReq {
  enabled: boolean;
  config: Record<string, unknown>;
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
  store_slug?: string;
  store_name?: string;
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
  // "pending" = a credit still held in escrow (order not yet delivered/
  // confirmed) — not withdrawable yet. "failed" = reversed (vendor no-show
  // refund) — never paid. "completed" is the only withdrawable state.
  status: "pending" | "completed" | "failed";
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  created_at: string;
}

export interface WalletResp {
  balance_kobo: number;
  total_earned_kobo: number;
  held_kobo: number; // credits still in escrow — not yet withdrawable
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

// Refresh tokens are single-use with rotation + reuse detection: if two
// requests 401 around the same moment and each independently calls
// /v1/auth/token/refresh, the second one reuses an already-rotated cookie
// and looks like token theft, revoking the whole session. This makes every
// concurrent 401 share one in-flight refresh instead of firing its own.
let _refreshInFlight: Promise<string | null> | null = null;

// Exported so callers OTHER than the request() wrapper (e.g. AuthProvider's
// on-load session restore) can trigger a refresh through the same in-flight
// guard, instead of calling authApi.refreshTokens() directly — two refresh
// paths that don't share this guard can still race each other even though
// each individually de-duplicates its own concurrent callers.
export function refreshOnce(): Promise<string | null> {
  if (!_onTokenExpired) return Promise.resolve(null);
  if (!_refreshInFlight) {
    _refreshInFlight = _onTokenExpired()
      .catch(() => null)
      .finally(() => {
        _refreshInFlight = null;
      });
  }
  return _refreshInFlight;
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

  // Auto-refresh: if 401 and a refresh callback is registered, retry once.
  // The refresh endpoint itself is excluded — otherwise a 401 from a missing
  // or expired refresh token would call refreshOnce() from inside the very
  // refreshOnce() call that's already in flight, awaiting a promise that can
  // only settle once this call returns. That's a permanent deadlock, which
  // left the dashboard's hydration spinner stuck forever on session restore.
  const isRefreshEndpoint = path === "/v1/auth/token/refresh";
  if (res.status === 401 && _onTokenExpired && !isRefreshEndpoint) {
    const newToken = await refreshOnce();
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

// ── Client-side crash capture ─────────────────────────────────────────────────

export interface ReportClientErrorInput {
  service: string;
  message: string;
  level?: "error" | "warning";
  stack?: string;
  context?: unknown;
  request_path?: string;
  user_id?: string;
}

// Self-built crash capture for vendor-web/consumer-app — POSTs to admin-api's
// unauthenticated /v1/admin/errors/report (reached through the gateway, same
// API_BASE every other call in this file uses; the gateway pass-through for
// /v1/admin/ is unconditional, see services/gateway/cmd/server/main.go).
// Deliberately fire-and-forget: a crash handler that can itself throw or
// block defeats the point, so failures here are swallowed, not surfaced.
export function reportClientError(input: ReportClientErrorInput): void {
  try {
    fetch(`${API_BASE}/v1/admin/errors/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).catch(() => {});
  } catch {
    // fetch itself throwing synchronously (e.g. unavailable in this runtime) — ignore.
  }
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

  updateStore: (id: string, data: UpdateStoreReq | StoreUpdatePayload, token: string) =>
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

  // Public, no auth required — used to populate the "major market" dropdown
  // during store setup, filtered by the state/city the vendor just entered.
  getMarkets: (params: { state?: string; city?: string }) => {
    const qs = new URLSearchParams();
    if (params.state) qs.set("state", params.state);
    if (params.city) qs.set("city", params.city);
    return request<MarketResp[]>(`/v1/storefront/public/markets?${qs.toString()}`);
  },

  // Upload store asset (logo or hero image) via multipart form
  uploadStoreAsset: async (token: string, file: File, type: "logo" | "hero"): Promise<StoreAssetResp> => {
    const form = new FormData();
    form.append("file", file);
    form.append("type", type);
    // Don't pass Content-Type header — let the browser set it with the boundary for multipart
    const res = await fetch(`${API_BASE}/v1/storefront/stores/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
      body: form,
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new ApiError(res.status, body.error ?? res.statusText);
    }
    return res.json() as Promise<StoreAssetResp>;
  },
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

  searchCanonicalProducts: (q: string, token: string) =>
    request<CanonicalProductSearchResp>(
      `/v1/catalogue/canonical-products/search?q=${encodeURIComponent(q)}`,
      {},
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

  updateOrderStatus: (id: string, status: VendorSettableOrderStatus, token: string) =>
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

  // No auth — lightweight storefront page-view beacon.
  trackVisit: (data: { store_id: string; session_id: string; page?: string }) =>
    request<{ ok: boolean }>("/v1/orders/public/visit", { method: "POST", body: JSON.stringify(data) }),

  // No auth — storefront checkout fetches enabled payment gateways.
  getPublicGateways: (storeId: string) =>
    request<{ gateways: PaymentGatewayResp[] }>(`/v1/orders/public/gateways/${storeId}`)
      .then((r) => r.gateways),

  // No auth — storefront newsletter subscribe.
  subscribe: (data: { store_id: string; email: string; name?: string }) =>
    request<{ ok: boolean }>("/v1/orders/public/subscribe", { method: "POST", body: JSON.stringify(data) }),

  // No auth — pre-payment cart summary email. Fire-and-forget from storefront checkout.
  sendCartEmail: (data: {
    email: string;
    customer_name: string;
    store_slug: string;
    store_name: string;
    items: Array<{ name: string; image_url?: string; quantity: number; price_kobo: number }>;
    total_kobo: number;
  }) =>
    request<{ ok: boolean }>("/v1/orders/public/cart-email", { method: "POST", body: JSON.stringify(data) }),
};

// ── Analytics API ──────────────────────────────────────────────────────────────

export interface RevenueTrendPoint {
  date: string;
  revenue_kobo: number;
  orders: number;
}

export const analyticsApi = {
  getOverview: (token: string) =>
    request<AnalyticsOverviewResp>("/v1/analytics/overview", {}, token),

  getTopProducts: (limit: number, token: string) =>
    request<{ products: TopProductResp[] }>(`/v1/analytics/top-products?limit=${limit}`, {}, token)
      .then((r) => r.products),

  getRevenueTrend: (days: number, token: string) =>
    request<{ trend: RevenueTrendPoint[] }>(`/v1/analytics/revenue-trend?days=${days}`, {}, token)
      .then((r) => r.trend),
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

  listSubscribers: (params: { page?: number; per_page?: number }, token: string) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.per_page) qs.set("per_page", String(params.per_page));
    return request<SubscriberListResp>(`/v1/crm/subscribers?${qs}`, {}, token);
  },

  unsubscribe: (id: string, token: string) =>
    request<{ ok: boolean }>(`/v1/crm/subscribers/${id}`, { method: "DELETE" }, token),
};

// ── Campaigns API ─────────────────────────────────────────────────────────────

export const campaignsApi = {
  list: (token: string) =>
    request<{ campaigns: CampaignResp[] }>("/v1/campaigns", {}, token)
      .then((r) => r.campaigns),

  create: (data: CreateCampaignReq, token: string) =>
    request<CampaignResp>("/v1/campaigns", { method: "POST", body: JSON.stringify(data) }, token),

  send: (id: string, token: string) =>
    request<CampaignResp>(`/v1/campaigns/${id}/send`, { method: "POST" }, token),
};

// ── Payment Gateways API ──────────────────────────────────────────────────────

export const paymentGatewaysApi = {
  list: (token: string) =>
    request<{ gateways: PaymentGatewayResp[] }>("/v1/store/payment-gateways", {}, token)
      .then((r) => r.gateways),

  upsert: (gateway: string, data: UpsertPaymentGatewayReq, token: string) =>
    request<PaymentGatewayResp>(
      `/v1/store/payment-gateways/${gateway}`,
      { method: "PUT", body: JSON.stringify(data) },
      token,
    ),
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
  paystack_dva_account_number?: string;
  paystack_dva_bank_name?: string;
  paystack_dva_account_name?: string;
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
    // Identity fields for Smile ID name/DOB matching
    first_name?: string;
    last_name?: string;
    dob?: string; // YYYY-MM-DD
    // Tier 1 — one of bvn or nin
    bvn?: string;
    nin?: string;
    // Tier 2 — KYB
    cac_number?: string;
    tin?: string;
    cac_document_url?: string;
    // Optional supporting docs
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

  listVendorBanks: (token: string) =>
    request<Array<{
      id: string;
      bank_name: string;
      bank_code: string;
      account_number_masked: string;
      account_name: string;
      is_primary: boolean;
      is_verified: boolean;
    }>>("/v1/identity/vendor/banks", {}, token),
};

// ── Staff & Roles API ─────────────────────────────────────────────────────────

export interface StaffResp {
  id: string;
  store_id: string;
  full_name: string;
  email: string;
  role: "manager" | "fulfillment" | "support" | "analytics_only";
  is_active: boolean;
  created_at: string;
}

export interface CreateStaffReq {
  full_name: string;
  email: string;
  password: string;
  role: StaffResp["role"];
}

export interface UpdateStaffReq {
  full_name?: string;
  role?: StaffResp["role"];
  is_active?: boolean;
  password?: string;
}

export const staffApi = {
  list: (token: string) =>
    request<{ staff: StaffResp[] }>("/v1/identity/vendor/staff", {}, token)
      .then((r) => r.staff),

  create: (data: CreateStaffReq, token: string) =>
    request<StaffResp>("/v1/identity/vendor/staff", { method: "POST", body: JSON.stringify(data) }, token),

  update: (id: string, data: UpdateStaffReq, token: string) =>
    request<StaffResp>(`/v1/identity/vendor/staff/${id}`, { method: "PATCH", body: JSON.stringify(data) }, token),

  remove: (id: string, token: string) =>
    request<void>(`/v1/identity/vendor/staff/${id}`, { method: "DELETE" }, token),

  staffLogin: (email: string, password: string) =>
    request<{ access_token: string; user: { id: string; email?: string } }>("/v1/auth/staff/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};

// ── Admin Center ─────────────────────────────────────────────────────────────
// Talks to the admin-api service (Node/Fastify) through the same gateway
// origin, under /v1/admin/. Admin tokens are minted/verified independently
// of the buyer/vendor auth flow above — see services/admin-api.

export type AdminRole = "agent" | "supervisor" | "super_admin";

export interface AdminResp {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
}

export interface AdminLoginResp {
  token: string;
  admin: AdminResp;
}

export interface AdminCustomerSummary {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  total_orders: number;
  total_spent: string;
}

export interface AdminOrderItemSummary {
  name: string;
  quantity: number;
  price_kobo: string;
  image_url: string;
}

export interface AdminCustomerOrder {
  id: string;
  store_id: string;
  status: string;
  total_kobo: string;
  created_at: string;
  items: AdminOrderItemSummary[];
}

export interface AdminCustomerDetail {
  profile: AdminCustomerSummary & { avatar_url: string | null };
  orders: AdminCustomerOrder[];
}

export interface AdminVendorSummary {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  business_name: string | null;
  kyc_status: string;
  onboarding_step: string;
  is_active: boolean;
}

export interface AdminVendorStore {
  id: string;
  name: string;
  slug: string;
  category: string;
  currency: string;
  is_active: boolean;
  created_at: string;
}

export interface AdminVendorSale {
  id: string;
  store_id: string;
  store_name: string;
  customer_name: string;
  status: string;
  total_kobo: string;
  created_at: string;
}

export interface AdminVendorDetail {
  profile: AdminVendorSummary & {
    vendor_profile_id: string;
    business_type: string | null;
    paystack_dva_account_number: string | null;
    paystack_dva_bank_name: string | null;
    subscription_status: string | null;
    current_period_end: string | null;
    plan_slug: string | null;
    plan_name: string | null;
  };
  stores: AdminVendorStore[];
  sales: AdminVendorSale[];
}

export interface AdminListParams {
  q?: string;
  page?: number;
  per_page?: number;
}

function toQueryString(params: AdminListParams): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.page) search.set("page", String(params.page));
  if (params.per_page) search.set("per_page", String(params.per_page));
  const s = search.toString();
  return s ? `?${s}` : "";
}

export const adminApi = {
  login: (email: string, password: string) =>
    request<AdminLoginResp>("/v1/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: (token: string) =>
    request<{ admin: AdminResp & { is_admin: true; jti: string; iat: number; exp: number } }>(
      "/v1/admin/auth/me",
      {},
      token,
    ),

  listCustomers: (params: AdminListParams, token: string) =>
    request<{ customers: AdminCustomerSummary[]; total: number; page: number; per_page: number }>(
      `/v1/admin/customers${toQueryString(params)}`,
      {},
      token,
    ),

  getCustomer: (id: string, token: string) =>
    request<AdminCustomerDetail>(`/v1/admin/customers/${id}`, {}, token),

  listVendors: (params: AdminListParams, token: string) =>
    request<{ vendors: AdminVendorSummary[]; total: number; page: number; per_page: number }>(
      `/v1/admin/vendors${toQueryString(params)}`,
      {},
      token,
    ),

  getVendor: (id: string, token: string) =>
    request<AdminVendorDetail>(`/v1/admin/vendors/${id}`, {}, token),

  listBatches: (params: AdminListParams, token: string) =>
    request<{ batches: AdminBatchSummary[]; total: number; page: number; per_page: number }>(
      `/v1/admin/batches${toQueryString(params)}`,
      {},
      token,
    ),

  getBatch: (paymentReference: string, token: string) =>
    request<AdminBatchDetail>(`/v1/admin/batches/${encodeURIComponent(paymentReference)}`, {}, token),

  // Fastify's JSON body parser rejects Content-Type: application/json with a
  // truly empty body (FST_ERR_CTP_EMPTY_JSON_BODY) — request() always sets
  // that header, so these no-payload actions send an explicit "{}".
  hubIntake: (orderId: string, token: string) =>
    request<{ ok: true }>(`/v1/admin/orders/${orderId}/hub-intake`, { method: "POST", body: "{}" }, token),

  dispatchBatch: (paymentReference: string, token: string) =>
    request<AdminDispatchResult>(
      `/v1/admin/batches/${encodeURIComponent(paymentReference)}/dispatch`,
      { method: "POST", body: "{}" },
      token,
    ),

  releaseEscrow: (orderId: string, token: string) =>
    request<{ ok: true }>(`/v1/admin/orders/${orderId}/release-escrow`, { method: "POST", body: "{}" }, token),

  listDisputes: (params: AdminListParams, token: string) =>
    request<{ disputes: AdminDisputeSummary[]; total: number; page: number; per_page: number }>(
      `/v1/admin/disputes${toQueryString(params)}`,
      {},
      token,
    ),

  dismissDispute: (orderId: string, token: string) =>
    request<{ ok: true }>(`/v1/admin/orders/${orderId}/dismiss-dispute`, { method: "POST", body: "{}" }, token),

  refundDispute: (orderId: string, token: string) =>
    request<{ ok: true }>(`/v1/admin/orders/${orderId}/refund-dispute`, { method: "POST", body: "{}" }, token),

  listErrors: (params: AdminErrorListParams, token: string) =>
    request<{ errors: AdminErrorEvent[]; total: number; page: number; per_page: number }>(
      `/v1/admin/errors${toErrorQueryString(params)}`,
      {},
      token,
    ),

  getError: (id: string, token: string) => request<AdminErrorEvent>(`/v1/admin/errors/${id}`, {}, token),

  resolveError: (id: string, token: string) =>
    request<{ ok: true }>(`/v1/admin/errors/${id}/resolve`, { method: "POST", body: "{}" }, token),
};

// ── Batches / hub fulfillment ─────────────────────────────────────────────────

export type AdminOrderStatus = "pending" | "confirmed" | "at_hub" | "shipped" | "delivered" | "cancelled";
export type AdminEscrowStatus = "held" | "released" | "reversed" | null;
export type AdminDisputeStatus = "reported" | "refunded" | "dismissed";

export interface AdminBatchSummary {
  payment_reference: string;
  customer_name: string;
  customer_email: string;
  order_count: number;
  at_hub_count: number;
  shipped_count: number;
  delivered_count: number;
  cancelled_count: number;
  total_kobo: string;
  created_at: string;
}

export interface AdminBatchOrderItem {
  order_id: string;
  name: string;
  quantity: number;
  price_kobo: string;
  image_url: string;
}

export interface AdminBatchOrder {
  id: string;
  store_id: string;
  store_name: string;
  customer_name: string;
  customer_email: string;
  status: AdminOrderStatus;
  total_kobo: string;
  hub_received_at: string | null;
  dispatched_at: string | null;
  delivered_at: string | null;
  delivery_confirmed_at: string | null;
  cancelled_reason: string | null;
  refund_reference: string | null;
  dispute_status: AdminDisputeStatus | null;
  dispute_reason: string | null;
  disputed_at: string | null;
  created_at: string;
  wallet_status: "pending" | "completed" | "failed" | null;
  items: AdminBatchOrderItem[];
}

export interface AdminDisputeSummary {
  id: string;
  payment_reference: string | null;
  store_id: string;
  store_name: string;
  customer_name: string;
  customer_email: string;
  total_kobo: string;
  dispute_reason: string | null;
  disputed_at: string;
}

export interface AdminBatchDetail {
  payment_reference: string;
  customer_name: string;
  customer_email: string;
  orders: AdminBatchOrder[];
}

export interface AdminDispatchResult {
  shipped: string[];
  refunded: string[];
  refund_errors: { order_id: string; error: string }[];
}

// ── Error tracking ────────────────────────────────────────────────────────────

export interface AdminErrorListParams extends AdminListParams {
  service?: string;
  resolved?: boolean;
}

function toErrorQueryString(params: AdminErrorListParams): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.page) search.set("page", String(params.page));
  if (params.per_page) search.set("per_page", String(params.per_page));
  if (params.service) search.set("service", params.service);
  if (params.resolved !== undefined) search.set("resolved", String(params.resolved));
  const s = search.toString();
  return s ? `?${s}` : "";
}

export interface AdminErrorEvent {
  id: string;
  service: string;
  level: "error" | "warning";
  message: string;
  stack: string | null;
  context: unknown;
  request_path: string | null;
  status_code: number | null;
  user_id: string | null;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}
