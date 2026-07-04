import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Layers } from "lucide-react";
import { ProductCard } from "@/components/storefront/eko/EkoProductCard";
import type { ThemeConfig, StorefrontProduct } from "@/app/storefront/[slug]/page";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

interface Collection {
  id: string;
  name: string;
  slug?: string;
  image_url?: string;
  description?: string;
}

async function getStore(slug: string) {
  try {
    const res = await fetch(`${API_URL}/v1/storefront/public/stores/${slug}`,
      { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json() as { id: string; name: string; theme_config?: string };
  } catch { return null; }
}

async function getCollections(storeId: string): Promise<Collection[]> {
  try {
    const res = await fetch(
      `${API_URL}/v1/catalogue/public/collections?store_id=${storeId}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return [];
    const data = await res.json() as { collections?: Collection[] };
    return data.collections ?? [];
  } catch { return []; }
}

async function getProductsByCollection(storeId: string, collectionId: string): Promise<StorefrontProduct[]> {
  try {
    const res = await fetch(
      `${API_URL}/v1/catalogue/public/products?store_id=${storeId}&collection_id=${collectionId}&per_page=50`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return [];
    const data = await res.json() as { products?: StorefrontProduct[] };
    return data.products ?? [];
  } catch { return []; }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; collectionSlug: string }>;
}): Promise<Metadata> {
  const { slug, collectionSlug } = await params;
  const store = await getStore(slug);
  if (!store) return { title: "Collection" };
  const collections = await getCollections(store.id);
  const col = collections.find(
    (c) => c.slug === collectionSlug || c.id === collectionSlug,
  );
  return { title: col?.name ?? "Collection" };
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string; collectionSlug: string }>;
}) {
  const { slug, collectionSlug } = await params;
  const store = await getStore(slug);
  if (!store) notFound();

  const collections = await getCollections(store.id);
  const collection = collections.find(
    (c) => c.slug === collectionSlug || c.id === collectionSlug,
  );
  if (!collection) notFound();

  let template: "eko" | "lagos" | "abuja" = "eko";
  if (store.theme_config) {
    try {
      const cfg = JSON.parse(store.theme_config) as ThemeConfig;
      template = cfg.template ?? "eko";
    } catch { /* use default */ }
  }
  const isLagos = template === "lagos" || template === "abuja";

  const products = await getProductsByCollection(store.id, collection.id);

  return (
    <div>
      {/* ── Collection hero ─────────────────────────────── */}
      <section style={{
        position: "relative",
        height: "260px",
        overflow: "hidden",
        background: collection.image_url
          ? undefined
          : isLagos ? "#1A1A1A" : "var(--store-bg, #F0FAF3)",
      }}>
        {collection.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={collection.image_url}
            alt={collection.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}

        {!collection.image_url && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Layers style={{ width: "64px", height: "64px", color: "var(--store-primary, #1A7A42)", opacity: 0.15 }} />
          </div>
        )}

        <div style={{
          position: "absolute", inset: 0,
          background: collection.image_url
            ? "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)"
            : undefined,
        }} />

        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "flex-end",
          padding: "32px 24px",
          textAlign: "center",
        }}>
          <Link href="/collections" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            borderRadius: "999px",
            background: collection.image_url ? "rgba(255,255,255,0.15)" : isLagos ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            backdropFilter: "blur(8px)",
            padding: "6px 14px",
            fontSize: "11px", fontWeight: 600,
            color: collection.image_url ? "#fff" : isLagos ? "rgba(247,244,238,0.7)" : "#374151",
            textDecoration: "none",
            marginBottom: "12px",
          }}>
            <ArrowLeft style={{ width: "12px", height: "12px" }} /> All collections
          </Link>

          <h1 style={{
            fontSize: "clamp(1.75rem, 5vw, 2.75rem)",
            fontWeight: 900,
            letterSpacing: isLagos ? "-0.2px" : "-0.5px",
            color: collection.image_url ? "#fff" : isLagos ? "#F7F4EE" : "var(--store-text, #1C1C1C)",
            fontFamily: isLagos ? "'Playfair Display', Georgia, serif" : undefined,
            marginBottom: "6px",
          }}>
            {collection.name}
          </h1>

          {collection.description && (
            <p style={{
              fontSize: "13px",
              color: collection.image_url ? "rgba(255,255,255,0.8)" : isLagos ? "rgba(247,244,238,0.55)" : "#6b7280",
              maxWidth: "480px",
            }}>
              {collection.description}
            </p>
          )}
        </div>
      </section>

      {/* ── Products ────────────────────────────────────── */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 80px" }}>
        <p style={{ fontSize: "13px", color: isLagos ? "rgba(247,244,238,0.45)" : "#9ca3af", marginBottom: "28px" }}>
          <span style={{ fontWeight: 700, color: isLagos ? "rgba(247,244,238,0.8)" : "#374151" }}>
            {products.length}
          </span>{" "}
          product{products.length !== 1 ? "s" : ""}
        </p>

        {products.length === 0 ? (
          <div style={{
            border: `1.5px dashed ${isLagos ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`,
            borderRadius: isLagos ? "0" : "16px",
            padding: "64px 24px",
            textAlign: "center",
          }}>
            <p style={{ fontSize: "15px", fontWeight: 700, color: isLagos ? "rgba(247,244,238,0.6)" : "#6b7280", marginBottom: "6px" }}>
              No products in this collection yet
            </p>
            <p style={{ fontSize: "12px", color: isLagos ? "rgba(247,244,238,0.35)" : "#9ca3af", marginBottom: "16px" }}>
              Check back soon, or explore the full catalogue.
            </p>
            <Link href="/shop" style={{
              fontSize: "13px", fontWeight: 700,
              color: "var(--store-primary, #1A7A42)",
              textDecoration: "none",
            }}>
              Shop all products →
            </Link>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "24px 16px",
          }}>
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
