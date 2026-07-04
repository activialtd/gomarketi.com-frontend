import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Layers, ArrowRight, ShoppingBag } from "lucide-react";
import type { ThemeConfig } from "@/app/storefront/[slug]/page";

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

export const metadata: Metadata = { title: "Collections" };

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStore(slug);
  if (!store) notFound();

  const collections = await getCollections(store.id);

  let template: "eko" | "lagos" | "abuja" = "eko";
  if (store.theme_config) {
    try {
      const cfg = JSON.parse(store.theme_config) as ThemeConfig;
      template = cfg.template ?? "eko";
    } catch { /* use default */ }
  }

  const isLagos = template === "lagos" || template === "abuja";

  if (collections.length === 0) {
    return (
      <div style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        textAlign: "center",
      }}>
        <div style={{
          width: "72px", height: "72px",
          borderRadius: isLagos ? "0" : "20px",
          background: isLagos ? "rgba(255,255,255,0.06)" : "var(--store-bg, #F0FAF3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "20px",
        }}>
          <Layers style={{ width: "32px", height: "32px", color: "var(--store-primary, #1A7A42)", opacity: 0.7 }} />
        </div>
        <h1 style={{
          fontSize: "22px", fontWeight: 800,
          color: isLagos ? "#F7F4EE" : "#1C1C1C",
          marginBottom: "8px", letterSpacing: "-0.3px",
        }}>
          No collections yet
        </h1>
        <p style={{ fontSize: "14px", color: isLagos ? "rgba(247,244,238,0.5)" : "#6b7280", marginBottom: "28px", maxWidth: "320px" }}>
          The store hasn&apos;t set up any collections yet. Browse all products instead.
        </p>
        <Link href="/shop" style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "var(--store-primary, #1A7A42)", color: "#fff",
          borderRadius: isLagos ? "0" : "12px",
          padding: "12px 28px", fontWeight: 700, fontSize: "14px",
          textDecoration: "none",
        }}>
          <ShoppingBag style={{ width: "16px", height: "16px" }} />
          Browse all products
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px 80px" }}>

      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{
          fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          color: isLagos ? "#F7F4EE" : "var(--store-text, #1C1C1C)",
          marginBottom: "8px",
          fontFamily: isLagos ? "'Playfair Display', Georgia, serif" : undefined,
        }}>
          Collections
        </h1>
        <p style={{ fontSize: "14px", color: isLagos ? "rgba(247,244,238,0.5)" : "#6b7280" }}>
          {collections.length} collection{collections.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "24px",
      }}>
        {collections.map((col, i) => (
          <CollectionCard
            key={col.id}
            collection={col}
            index={i}
            isLagos={isLagos}
          />
        ))}
      </div>
    </div>
  );
}

function CollectionCard({
  collection,
  index,
  isLagos,
}: {
  collection: Collection;
  index: number;
  isLagos: boolean;
}) {
  const href = `/collections/${collection.slug ?? collection.id}`;

  return (
    <Link
      href={href}
      style={{
        display: "block",
        textDecoration: "none",
        opacity: 0,
        animation: `fadeUp 0.5s ease forwards ${index * 60}ms`,
      }}
    >
      {/* Image / placeholder */}
      <div style={{
        position: "relative",
        aspectRatio: "16/9",
        overflow: "hidden",
        borderRadius: isLagos ? "0" : "16px",
        background: isLagos ? "#1A1A1A" : "var(--store-bg, #F0FAF3)",
        marginBottom: "14px",
      }}>
        {collection.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={collection.image_url}
            alt={collection.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
            className="group-hover:scale-105"
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Layers style={{
              width: "40px", height: "40px",
              color: "var(--store-primary, #1A7A42)",
              opacity: 0.3,
            }} />
          </div>
        )}

        {/* Overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)",
        }} />

        {/* Name on image */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "16px",
        }}>
          <p style={{
            color: "#fff",
            fontWeight: 800,
            fontSize: "17px",
            letterSpacing: isLagos ? "-0.2px" : "-0.3px",
            fontFamily: isLagos ? "'Playfair Display', Georgia, serif" : undefined,
          }}>
            {collection.name}
          </p>
        </div>
      </div>

      {/* Footer row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {collection.description ? (
          <p style={{
            fontSize: "12px",
            color: isLagos ? "rgba(247,244,238,0.5)" : "#6b7280",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "80%",
          }}>
            {collection.description}
          </p>
        ) : <span />}
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "4px",
          fontSize: "12px", fontWeight: 700,
          color: "var(--store-primary, #1A7A42)",
        }}>
          View <ArrowRight style={{ width: "13px", height: "13px" }} />
        </span>
      </div>
    </Link>
  );
}
