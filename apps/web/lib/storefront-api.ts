const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

async function get<T>(path: string, revalidate = 60): Promise<T> {
  const res = await fetch(`${API}${path}`, { next: { revalidate } });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const storefrontAPI = {
  getStore: (slug: string) =>
    get<StoreData>(`/v1/storefront/public/stores/${slug}`),

  getProducts: (
    storeId: string,
    params?: { category_id?: string; page?: number; per_page?: number; search?: string },
  ) => {
    const qs = new URLSearchParams({
      store_id: storeId,
      per_page: String(params?.per_page ?? 24),
    });
    if (params?.category_id) qs.set('category_id', params.category_id);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.search) qs.set('q', params.search);
    return get<ProductList>(`/v1/catalogue/public/products?${qs}`);
  },

  getProduct: (productId: string) =>
    get<SFProduct>(`/v1/catalogue/public/products/${productId}`),

  getCategories: (storeId: string) =>
    get<CategoryList>(`/v1/catalogue/public/categories?store_id=${storeId}`),

  getCollections: (storeId: string) =>
    get<CollectionList>(`/v1/catalogue/public/collections?store_id=${storeId}`),

  createOrder: (order: CreateOrderPayload) =>
    post<OrderResp>('/v1/orders/public', order),

  getOrder: (orderId: string, email: string) =>
    get<OrderResp>(`/v1/orders/public/${orderId}?email=${encodeURIComponent(email)}`, 0),
};

// ── Types ──────────────────────────────────────────────────────────────────────

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
  hero_style: 'full' | 'split' | 'minimal' | 'none';
  products_per_row: 2 | 3 | 4;
  button_style: 'rounded' | 'sharp' | 'pill';
  show_hero: boolean;
  show_featured: boolean;
  show_categories: boolean;
}

export const DEFAULT_THEME: ThemeConfig = {
  primary_color: '#1A7A42',
  secondary_color: '#0A2E1A',
  accent_color: '#F0FAF3',
  background_color: '#ffffff',
  text_color: '#1C1C1C',
  font_heading: 'Inter',
  font_body: 'Inter',
  hero_style: 'full',
  products_per_row: 3,
  button_style: 'rounded',
  show_hero: true,
  show_featured: true,
  show_categories: true,
};

export interface StoreData {
  id: string;
  slug: string;
  name: string;
  description?: string;
  tagline?: string;
  logo_url?: string;
  hero_image_url?: string;
  social_links?: SocialLinks;
  theme_config?: Partial<ThemeConfig>;
  support_phone?: string;
  support_email?: string;
}

export interface SFProduct {
  id: string;
  name: string;
  description?: string;
  price_kobo: number;
  compare_price_kobo?: number;
  images: string[];
  category_id?: string;
  collection_id?: string;
  is_published: boolean;
  stock_quantity?: number;
  slug?: string;
  tags?: string[];
  is_digital?: boolean;
}

export interface ProductList {
  products: SFProduct[];
  total: number;
  page: number;
  per_page: number;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  image_url?: string;
  description?: string;
}

export interface CategoryList {
  categories: Category[];
}

export interface Collection {
  id: string;
  name: string;
  slug?: string;
  image_url?: string;
}

export interface CollectionList {
  collections: Collection[];
}

export interface CartItem {
  product_id: string;
  name: string;
  price_kobo: number;
  image_url: string;
  quantity: number;
  slug?: string;
}

export interface CreateOrderPayload {
  store_id: string;
  store_slug: string;
  store_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  delivery_address: string;
  items: Array<{
    product_id: string;
    name: string;
    image_url: string;
    quantity: number;
    price_kobo: number;
  }>;
  total_kobo: number;
  paystack_reference: string;
}

export interface OrderResp {
  id: string;
  status: string;
  total_kobo: number;
  created_at: string;
  customer_name: string;
  customer_email: string;
  delivery_address: string;
  items: Array<{
    name: string;
    quantity: number;
    price_kobo: number;
    image_url: string;
  }>;
}
