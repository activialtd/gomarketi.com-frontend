import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

// Resolution order, most explicit first:
//   EXPO_PUBLIC_API_URL  — .env.local, survives manifest caching
//   extra.apiUrl         — app.json, baked into the manifest
//   staging              — last resort
//
// The middle one comes from a cached manifest in Expo Go, so it can silently
// go missing after a config change and fall through to staging. The log below
// makes whichever won visible on boot.
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra?.apiUrl as string) ??
  "";

if (__DEV__) {
  console.log(`[api] talking to ${API_URL}`);
}

const ACCESS_TOKEN_KEY = "gomarketi_access_token";
const REFRESH_TOKEN_KEY = "gomarketi_refresh_token";

export interface ReportClientErrorInput {
  service: string;
  message: string;
  level?: "error" | "warning";
  stack?: string;
  context?: unknown;
  request_path?: string;
  user_id?: string;
}

// Self-built crash capture — POSTs to admin-api's unauthenticated
// /v1/admin/errors/report, reached through the same gateway (API_URL above)
// as every other request here; the gateway passes /v1/admin/ through
// unconditionally (see services/gateway/cmd/server/main.go). Deliberately
// fire-and-forget: a crash handler that can itself throw or block defeats
// the point, so failures here are swallowed, not surfaced.
export function reportClientError(input: ReportClientErrorInput): void {
  try {
    fetch(`${API_URL}/v1/admin/errors/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).catch(() => {});
  } catch {
    // ignore
  }
}

export type UserDTO = {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  is_email_verified: boolean;
  profile_completed: boolean;
  is_buyer: boolean;
  is_vendor: boolean;
};

export type AuthResp = {
  access_token: string;
  refresh_token?: string;
  user: UserDTO;
};

export class ApiError extends Error {
  status: number;
  fields?: { field: string; message: string }[];
  constructor(
    status: number,
    message: string,
    fields?: { field: string; message: string }[],
  ) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

async function storeTokens(resp: AuthResp) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, resp.access_token);
  if (resp.refresh_token) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, resp.refresh_token);
  }
}

async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

// request performs a single HTTP call against the API, unauthenticated.
// Used for auth endpoints, which never need a Bearer token.
async function request<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Platform": "mobile",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data.error ?? "something went wrong",
      data.fields,
    );
  }
  return data as T;
}

// Single-flight guard so concurrent 401s (or an app-launch restore racing a
// 401 retry) only trigger one refresh call.
let refreshInFlight: Promise<AuthResp | null> | null = null;

async function doRefresh(): Promise<AuthResp | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) return null;
      try {
        const resp = await request<AuthResp>("/v1/auth/token/refresh", {
          refresh_token: refreshToken,
        });
        await storeTokens(resp);
        return resp;
      } catch {
        await clearTokens();
        return null;
      }
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function refreshOnce(): Promise<string | null> {
  const resp = await doRefresh();
  return resp?.access_token ?? null;
}

// authorizedRequest attaches the access token and retries once via refreshOnce on a 401.
export async function authorizedRequest<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const call = async (token: string | null) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: init.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Client-Platform": "mobile",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
    return res;
  };

  let token = await getAccessToken();
  let res = await call(token);

  if (res.status === 401) {
    token = await refreshOnce();
    res = await call(token);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new ApiError(
      res.status,
      data.error ?? "something went wrong",
      data.fields,
    );
  }
  return data as T;
}

// ── Auth endpoints ────────────────────────────────────────────────────────────

export async function register(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<AuthResp> {
  const resp = await request<AuthResp>("/v1/auth/register", {
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    password: input.password,
    confirm_password: input.password,
    terms_accepted: true,
  });
  await storeTokens(resp);
  return resp;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResp> {
  const resp = await request<AuthResp>("/v1/auth/login", { email, password });
  await storeTokens(resp);
  return resp;
}

export async function requestOtp(
  email: string,
): Promise<{ session_token: string; expires_in: number }> {
  return request("/v1/auth/otp/request", { email });
}

export async function verifyOtp(
  sessionToken: string,
  otp: string,
): Promise<AuthResp> {
  const resp = await request<AuthResp>("/v1/auth/otp/verify", {
    session_token: sessionToken,
    otp,
  });
  await storeTokens(resp);
  return resp;
}

export async function forgotPassword(
  email: string,
): Promise<{ session_token: string; expires_in: number }> {
  return request("/v1/auth/password/forgot", { email });
}

export async function resetPassword(input: {
  sessionToken: string;
  otp: string;
  newPassword: string;
}): Promise<void> {
  await request("/v1/auth/password/reset", {
    session_token: input.sessionToken,
    otp: input.otp,
    new_password: input.newPassword,
    confirm_new_password: input.newPassword,
  });
}

export async function googleAuth(idToken: string): Promise<AuthResp> {
  const resp = await request<AuthResp>("/v1/auth/oauth/google", {
    id_token: idToken,
  });
  await storeTokens(resp);
  return resp;
}

export async function appleAuth(input: {
  identityToken: string;
  authorizationCode: string;
  email?: string;
  fullName?: string;
}): Promise<AuthResp> {
  const resp = await request<AuthResp>("/v1/auth/oauth/apple", {
    identity_token: input.identityToken,
    authorization_code: input.authorizationCode,
    email: input.email,
    full_name: input.fullName,
  });
  await storeTokens(resp);
  return resp;
}

export async function logout(): Promise<void> {
  const refreshToken = await getRefreshToken();
  try {
    await request(
      "/v1/auth/logout",
      refreshToken ? { refresh_token: refreshToken } : undefined,
    );
  } finally {
    await clearTokens();
  }
}

// restoreSession re-establishes a session on app launch. There's no
// standalone "/v1/auth/me" endpoint, but /v1/auth/token/refresh already
// returns the full user object alongside a fresh access token, so it doubles
// as the restore call. Returns null if there's no stored (or still-valid)
// refresh token.
export async function restoreSession(): Promise<UserDTO | null> {
  const refresh = await getRefreshToken();
  if (!refresh) return null;

  const resp = await doRefresh();
  return resp?.user ?? null;
}

// ── Store / product search (public, unauthenticated) ────────────────────────

async function getPublic<T>(
  path: string,
  params: Record<string, string | number | undefined>,
): Promise<T> {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
    )
    .join("&");
  const res = await fetch(`${API_URL}${path}${qs ? `?${qs}` : ""}`, {
    headers: { "X-Client-Platform": "mobile" },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;
  if (!res.ok) {
    throw new ApiError(res.status, data?.error ?? "something went wrong");
  }
  return data as T;
}

export type StoreResult = {
  id: string;
  name: string;
  slug: string;
  category: string;
  tagline?: string;
  logo_url?: string;
  hero_image_url?: string;
  address?: string;
  city?: string;
  state?: string;
  market_id?: string;
  market_name?: string;
  distance_km?: number;
};

// MatchType tells the caller which tier resolved the query: a named vendor,
// a named market, a general area/city, nearest-by-distance, or no match at
// all (bare keyword, no location). Cross-vendor product search uses this to
// decide whether to show the vendor carousel and what the results header
// should say — see resolveSearchScope in search-orchestrator.ts.
export type MatchType = "vendor" | "market" | "city" | "distance" | "none";

export type StoreSearchPage = {
  stores: StoreResult[];
  hasMore: boolean;
  matchType: MatchType;
  matchedStoreId?: string;
  matchedMarketId?: string;
  // remainingQuery is the query with the matched vendor/market/city phrase
  // stripped out — the leftover product term(s), safe to pass to product search.
  remainingQuery: string;
};

// searchStores finds stores by free-text query and/or category, optionally
// sorted by distance from the buyer's location (or scoped to a specific
// market via marketId). Backs text/voice search on Home and market browsing.
// offset/limit support prefetch-ahead pagination — see usePaginatedList.
export async function searchStores(params: {
  q?: string;
  category?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  marketId?: string;
  limit?: number;
  offset?: number;
}): Promise<StoreSearchPage> {
  const resp = await getPublic<{
    stores: StoreResult[];
    has_more: boolean;
    match_type: MatchType;
    matched_store_id?: string;
    matched_market_id?: string;
    remaining_query: string;
  }>("/v1/storefront/public/stores/search", {
    q: params.q,
    category: params.category,
    lat: params.lat,
    lng: params.lng,
    radius_km: params.radiusKm,
    market_id: params.marketId,
    limit: params.limit,
    offset: params.offset,
  });
  return {
    stores: resp.stores,
    hasMore: resp.has_more,
    matchType: resp.match_type,
    matchedStoreId: resp.matched_store_id,
    matchedMarketId: resp.matched_market_id,
    remainingQuery: resp.remaining_query,
  };
}

export type Market = {
  id: string;
  name: string;
  city: string;
  state: string;
};

// getMarkets lists major markets, e.g. for the consumer-app "Popular
// Markets" browse tab.
export async function getMarkets(
  params: { state?: string; city?: string } = {},
): Promise<Market[]> {
  return getPublic<Market[]>("/v1/storefront/public/markets", {
    state: params.state,
    city: params.city,
  });
}

export type CatalogueProduct = {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  price_kobo: number;
  stock: number;
  images: string[];
  tags: string[];
  canonical_product_id?: string;
};

export type ProductPage = {
  products: CatalogueProduct[];
  hasMore: boolean;
};

// getStoreProducts lists a single store's published products — what a buyer
// sees after tapping into a store from search results. Paginated (page is
// 1-based, matching the backend) for prefetch-ahead lazy loading.
export async function getStoreProducts(
  storeId: string,
  page = 1,
  perPage = 10,
): Promise<ProductPage> {
  const resp = await getPublic<{
    products: CatalogueProduct[];
    total: number;
    page: number;
    per_page: number;
  }>("/v1/catalogue/public/products", {
    store_id: storeId,
    page,
    per_page: perPage,
  });
  return {
    products: resp.products,
    hasMore: resp.page * resp.per_page < resp.total,
  };
}

// searchProducts finds published products by name across a caller-resolved
// set of stores — the cross-vendor half of search. storeIds is always
// resolved first via searchStores/resolveSearchScope; an empty list here
// returns an empty page rather than scanning the whole platform.
export async function searchProducts(
  storeIds: string[],
  q: string,
  page = 1,
  perPage = 24,
): Promise<ProductPage> {
  if (storeIds.length === 0) return { products: [], hasMore: false };
  const resp = await getPublic<{
    products: CatalogueProduct[];
    total: number;
    page: number;
    per_page: number;
  }>("/v1/catalogue/public/products/search", {
    store_ids: storeIds.join(","),
    q,
    page,
    per_page: perPage,
  });
  return {
    products: resp.products,
    hasMore: resp.page * resp.per_page < resp.total,
  };
}

// ── Unified search ──────────────────────────────────────────────────────────
// One query, both kinds of result. The backend does the matching (trigram +
// full-text), so a misspelling like "jollof ric" still finds Jollof Rice and
// the caller does not have to resolve a store scope first.

export type VendorResult = {
  id: string;
  name: string;
  slug: string;
  category: string;
  tagline?: string;
  logo_url?: string;
  city?: string;
  state?: string;
  market_id?: string;
  market_name?: string;
  product_count: number;
};

export type SearchAllResult = {
  query: string;
  products: CatalogueProduct[];
  productsHasMore: boolean;
  vendors: VendorResult[];
  vendorsHasMore: boolean;
  /** Same category or tag as the top matches — the "you might also like" rail. */
  relatedProducts: CatalogueProduct[];
  /** Query completions from product names and tags. */
  suggestions: string[];
};

// searchAll returns products and vendors for one query. `type` narrows it to
// a single section — "vendors" is the explicit vendor search.
export async function searchAll(params: {
  q?: string;
  type?: "all" | "products" | "vendors";
  categoryId?: string;
  storeIds?: string[];
  limit?: number;
  offset?: number;
}): Promise<SearchAllResult> {
  const resp = await getPublic<{
    query: string;
    products: CatalogueProduct[];
    products_has_more: boolean;
    vendors: VendorResult[];
    vendors_has_more: boolean;
    related_products: CatalogueProduct[];
    suggestions: string[];
  }>("/v1/catalogue/public/search", {
    q: params.q,
    type: params.type,
    category_id: params.categoryId,
    store_ids: params.storeIds?.length ? params.storeIds.join(",") : undefined,
    limit: params.limit,
    offset: params.offset,
  });
  return {
    query: resp.query,
    products: resp.products ?? [],
    productsHasMore: resp.products_has_more,
    vendors: resp.vendors ?? [],
    vendorsHasMore: resp.vendors_has_more,
    relatedProducts: resp.related_products ?? [],
    suggestions: resp.suggestions ?? [],
  };
}

// ── Checkout ────────────────────────────────────────────────────────────────

export type CheckoutOrderItem = {
  product_id: string;
  name: string;
  image_url?: string;
  quantity: number;
  price_kobo: number;
};

export type CheckoutStoreOrder = {
  store_id: string;
  store_slug?: string;
  store_name?: string;
  items: CheckoutOrderItem[];
};

// OrderStatus mirrors the backend's real lifecycle (see
// services/orders/internal/dto/orders.go) — a vendor delivers to the
// GoMarketi hub (at_hub), GoMarketi dispatches the consolidated batch
// (shipped), the buyer confirms receipt (delivered).
export type OrderStatus =
  "pending" | "confirmed" | "at_hub" | "shipped" | "delivered" | "cancelled";
export type EscrowStatus = "held" | "released" | "reversed";
// A dispute is orthogonal to status — "reported" means the buyer says this
// specific order never arrived, even though it was checked in and
// dispatched; status stays 'shipped'/'delivered' for fulfillment tracking.
export type DisputeStatus = "reported" | "refunded" | "dismissed";

export type OrderResp = {
  id: string;
  store_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  status: OrderStatus;
  items: CheckoutOrderItem[];
  total_kobo: number;
  delivery_address: string;
  payment_reference?: string;
  hub_received_at?: string;
  dispatched_at?: string;
  delivered_at?: string;
  delivery_confirmed_at?: string;
  cancelled_reason?: string;
  escrow_status: EscrowStatus;
  dispute_status?: DisputeStatus;
  dispute_reason?: string;
  disputed_at?: string;
  created_at: string;
  updated_at: string;
};

// DeliveryOption is one of a vendor's own delivery choices — a title, a note
// and a price the vendor set in their dashboard.
export type DeliveryOption = {
  id: string;
  store_id: string;
  title: string;
  description: string;
  price_kobo: number;
  position: number;
  is_active: boolean;
};

// getDeliveryOptions returns a store's delivery choices. Public, no auth.
export async function getDeliveryOptions(
  slug: string,
): Promise<DeliveryOption[]> {
  return getPublic<DeliveryOption[]>(
    `/v1/storefront/public/stores/${encodeURIComponent(slug)}/delivery-options`,
    {},
  );
}

export type CheckoutResult = {
  checkout_id: string;
  orders: OrderResp[];
  items_kobo: number;
  delivery_fee_kobo: number;
  delivery_option_title?: string;
  total_kobo: number;
};

// createCheckout creates one order per vendor store from a single payment —
// POST /v1/orders/public/checkout, no auth (same public model as login/register
// above: no vendor session exists at checkout time, only the buyer's details
// and a verified Paystack reference).
//
// Delivery is charged ONCE for the whole basket however many vendors are in
// it, because the hub sends one consolidated delivery. delivery_option_id may
// name an option belonging to any store in the basket; the backend reads the
// price from that row, so the fee cannot be set by the client.
export async function createCheckout(input: {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  delivery_address?: string;
  payment_reference: string;
  stores: CheckoutStoreOrder[];
  delivery_option_id?: string;
  delivery_fee_kobo?: number;
}): Promise<CheckoutResult> {
  return request<CheckoutResult>("/v1/orders/public/checkout", input);
}

// getMyOrders returns every order the authenticated buyer has ever placed —
// the real order history behind OrdersScreen, replacing what used to be
// purely in-memory state from registerOrders alone.
export async function getMyOrders(): Promise<{ orders: OrderResp[] }> {
  return authorizedRequest<{ orders: OrderResp[] }>("/v1/orders/mine");
}

export async function getMyOrder(orderId: string): Promise<OrderResp> {
  return authorizedRequest<OrderResp>(`/v1/orders/mine/${orderId}`);
}

// confirmDelivery is the real "I've received this" action — releases the
// vendor's held escrow. Public/email-gated on the backend (see
// services/orders/internal/service/orders.go's ConfirmDelivery), matching
// the existing public-checkout trust model rather than needing a buyer JWT.
export async function confirmDelivery(
  orderId: string,
  email: string,
): Promise<OrderResp> {
  return request<OrderResp>(`/v1/orders/public/${orderId}/confirm-delivery`, {
    email,
  });
}

// reportMissing flags one order within a batch as never having arrived,
// even though it was dispatched — the gap ConfirmDelivery alone doesn't
// cover, since that's the "everything showed up" path. Same email-gated
// trust model (see services/orders/internal/service/orders.go's
// ReportMissing). Does not change order status — a parallel dispute flag
// admin resolves separately.
export async function reportMissing(
  orderId: string,
  email: string,
  reason?: string,
): Promise<OrderResp> {
  return request<OrderResp>(`/v1/orders/public/${orderId}/report-missing`, {
    email,
    reason,
  });
}
