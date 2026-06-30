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

export interface OrderResp {
  id: string;
  store_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
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
    if (params.q) qs.set("q", params.q);
    return request<OrderListResp>(`/v1/orders?${qs}`, {}, token);
  },

  updateOrderStatus: (id: string, status: string, token: string) =>
    request<OrderResp>(
      `/v1/orders/${id}/status`,
      { method: "PATCH", body: JSON.stringify({ status }) },
      token,
    ),
};

// ── Analytics API ──────────────────────────────────────────────────────────────

export const analyticsApi = {
  getOverview: (token: string) =>
    request<AnalyticsOverviewResp>("/v1/analytics/overview", {}, token),
};
