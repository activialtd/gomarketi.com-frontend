import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const API_URL = (Constants.expoConfig?.extra?.apiUrl as string) ??
  "https://api-staging.gomarketi.com";

const ACCESS_TOKEN_KEY = "gomarketi_access_token";
const REFRESH_TOKEN_KEY = "gomarketi_refresh_token";

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
  constructor(status: number, message: string, fields?: { field: string; message: string }[]) {
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
    throw new ApiError(res.status, data.error ?? "something went wrong", data.fields);
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
        const resp = await request<AuthResp>("/v1/auth/token/refresh", { refresh_token: refreshToken });
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
    throw new ApiError(res.status, data.error ?? "something went wrong", data.fields);
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

export async function login(email: string, password: string): Promise<AuthResp> {
  const resp = await request<AuthResp>("/v1/auth/login", { email, password });
  await storeTokens(resp);
  return resp;
}

export async function requestOtp(email: string): Promise<{ session_token: string; expires_in: number }> {
  return request("/v1/auth/otp/request", { email });
}

export async function verifyOtp(sessionToken: string, otp: string): Promise<AuthResp> {
  const resp = await request<AuthResp>("/v1/auth/otp/verify", { session_token: sessionToken, otp });
  await storeTokens(resp);
  return resp;
}

export async function forgotPassword(email: string): Promise<{ session_token: string; expires_in: number }> {
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
  const resp = await request<AuthResp>("/v1/auth/oauth/google", { id_token: idToken });
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
    await request("/v1/auth/logout", refreshToken ? { refresh_token: refreshToken } : undefined);
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

async function getPublic<T>(path: string, params: Record<string, string | number | undefined>): Promise<T> {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
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
  }>(
    "/v1/storefront/public/stores/search",
    {
      q: params.q,
      category: params.category,
      lat: params.lat,
      lng: params.lng,
      radius_km: params.radiusKm,
      market_id: params.marketId,
      limit: params.limit,
      offset: params.offset,
    },
  );
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
export async function getMarkets(params: { state?: string; city?: string } = {}): Promise<Market[]> {
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
  const resp = await getPublic<{ products: CatalogueProduct[]; total: number; page: number; per_page: number }>(
    "/v1/catalogue/public/products",
    { store_id: storeId, page, per_page: perPage },
  );
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
  const resp = await getPublic<{ products: CatalogueProduct[]; total: number; page: number; per_page: number }>(
    "/v1/catalogue/public/products/search",
    { store_ids: storeIds.join(","), q, page, per_page: perPage },
  );
  return {
    products: resp.products,
    hasMore: resp.page * resp.per_page < resp.total,
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

export type OrderResp = {
  id: string;
  store_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  status: string;
  items: CheckoutOrderItem[];
  total_kobo: number;
  delivery_address: string;
  payment_reference?: string;
  created_at: string;
  updated_at: string;
};

// createCheckout creates one order per vendor store from a single payment —
// POST /v1/orders/public/checkout, no auth (same public model as login/register
// above: no vendor session exists at checkout time, only the buyer's details
// and a verified Paystack reference).
export async function createCheckout(input: {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  delivery_address?: string;
  payment_reference: string;
  stores: CheckoutStoreOrder[];
}): Promise<{ orders: OrderResp[] }> {
  return request<{ orders: OrderResp[] }>("/v1/orders/public/checkout", input);
}
