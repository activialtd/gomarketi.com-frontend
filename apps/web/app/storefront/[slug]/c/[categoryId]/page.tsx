import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductCard } from '@/components/storefront/eko/EkoProductCard';
import type { StorefrontProduct } from '@/app/storefront/[slug]/page';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

interface CategoryData {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
}

async function getStoreId(slug: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/v1/storefront/public/stores/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const d = (await res.json()) as { id: string };
    return d.id ?? null;
  } catch {
    return null;
  }
}

async function getCategory(
  storeId: string,
  categoryId: string,
): Promise<CategoryData | null> {
  try {
    const res = await fetch(
      `${API_URL}/v1/catalogue/public/categories?store_id=${storeId}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    const d = (await res.json()) as { categories?: CategoryData[] };
    return d.categories?.find((c) => c.id === categoryId) ?? null;
  } catch {
    return null;
  }
}

async function getProductsByCategory(
  storeId: string,
  categoryId: string,
): Promise<StorefrontProduct[]> {
  try {
    const res = await fetch(
      `${API_URL}/v1/catalogue/public/stores/${storeId}/products?category_id=${categoryId}&per_page=48`,
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
  params: Promise<{ slug: string; categoryId: string }>;
}): Promise<Metadata> {
  const { slug, categoryId } = await params;
  const storeId = await getStoreId(slug);
  if (!storeId) return { title: 'Category' };
  const category = await getCategory(storeId, categoryId);
  return { title: category?.name ?? 'Category' };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string; categoryId: string }>;
}) {
  const { slug, categoryId } = await params;
  const storeId = await getStoreId(slug);
  if (!storeId) notFound();

  const [category, products] = await Promise.all([
    getCategory(storeId!, categoryId),
    getProductsByCategory(storeId!, categoryId),
  ]);

  const shopUrl = "/shop";

  return (
    <div style={{ minHeight: '60vh', background: '#fff' }}>
      {/* Category header */}
      <div
        style={{
          background: category?.image_url ? 'transparent' : '#f8fafc',
          borderBottom: '1px solid #f1f5f9',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {category?.image_url && (
          <>
            <img
              src={category.image_url}
              alt={category.name ?? ''}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.45)',
              }}
            />
          </>
        )}
        <div
          style={{
            position: 'relative',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '60px 24px 48px',
            textAlign: 'center',
          }}
        >
          <Link
            href={shopUrl}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: category?.image_url ? 'rgba(255,255,255,0.75)' : '#6b7280',
              textDecoration: 'none',
              marginBottom: '12px',
            }}
          >
            ← All products
          </Link>
          <h1
            style={{
              fontSize: 'clamp(22px, 4vw, 36px)',
              fontWeight: 900,
              letterSpacing: '-0.4px',
              color: category?.image_url ? '#fff' : '#1C1C1C',
              marginBottom: '8px',
            }}
          >
            {category?.name ?? 'Category'}
          </h1>
          {category?.description && (
            <p
              style={{
                fontSize: '14px',
                color: category?.image_url ? 'rgba(255,255,255,0.7)' : '#6b7280',
                maxWidth: '480px',
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Products grid */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 24px 80px',
        }}
      >
        <p
          style={{
            fontSize: '13px',
            color: '#6b7280',
            marginBottom: '24px',
          }}
        >
          <strong style={{ color: '#1C1C1C' }}>{products.length}</strong>{' '}
          product{products.length !== 1 ? 's' : ''}
        </p>

        {products.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              border: '2px dashed #e2e8f0',
              borderRadius: '16px',
            }}
          >
            <p
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              No products in this category
            </p>
            <p
              style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '20px' }}
            >
              Check back soon or explore more products.
            </p>
            <Link
              href={shopUrl}
              style={{
                color: 'var(--store-primary, #1A7A42)',
                fontWeight: 700,
                fontSize: '13px',
                textDecoration: 'none',
              }}
            >
              Browse all products →
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '20px',
            }}
          >
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
