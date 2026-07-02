import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import EkoShop from '@/components/storefront/eko/EkoShop';
import LagosShop from '@/components/storefront/lagos/LagosShop';
import type { ThemeConfig } from '@/app/storefront/[slug]/page';
import type { StorefrontProduct } from '@/app/storefront/[slug]/page';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

async function getStoreData(slug: string) {
  try {
    const res = await fetch(`${API_URL}/v1/storefront/public/stores/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as { id: string; name: string; theme_config?: string };
  } catch {
    return null;
  }
}

async function getProducts(
  storeId: string,
  params: { category_id?: string; q?: string; page?: number },
): Promise<StorefrontProduct[]> {
  try {
    const qs = new URLSearchParams({ per_page: '24' });
    if (params.category_id) qs.set('category_id', params.category_id);
    if (params.q) qs.set('q', params.q);
    if (params.page) qs.set('page', String(params.page));
    const res = await fetch(
      `${API_URL}/v1/catalogue/public/stores/${storeId}/products?${qs}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return [];
    const d = (await res.json()) as { products?: StorefrontProduct[] };
    return d.products ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Products — ${slug}` };
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const store = await getStoreData(slug);
  if (!store) notFound();

  const products = await getProducts(store.id, {
    category_id: sp.category,
    q: sp.q,
    page: sp.page ? Number(sp.page) : undefined,
  });

  let template: 'eko' | 'lagos' | 'abuja' = 'eko';
  if (store.theme_config) {
    try {
      const cfg = JSON.parse(store.theme_config) as ThemeConfig;
      template = cfg.template ?? 'eko';
    } catch {
      /* use default */
    }
  }

  switch (template) {
    case 'lagos':
    case 'abuja':
      return <LagosShop products={products} />;
    default:
      return <EkoShop products={products} />;
  }
}
