"use client";

// StoreSkeleton renders the body content only.
// The header + footer come from app/storefront/[slug]/layout.tsx.
import type { StoreData, StorefrontProduct } from "@/app/storefront/[slug]/page";

export default function StoreSkeleton({ store }: { store: StoreData; products?: StorefrontProduct[] }) {
  return (
    <div style={{ minHeight: "60vh", background: "#fff" }}>

      {/* Hero placeholder */}
      <div style={{ background: "#f8fafc", padding: "80px 40px", textAlign: "center", borderBottom: "1px dashed #e2e8f0" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#94a3b8", marginBottom: "12px" }}>
          {store.name}
        </p>
        <h1 style={{ fontSize: "clamp(24px, 4vw, 42px)", fontWeight: 900, color: "#e2e8f0", letterSpacing: "-0.5px", marginBottom: "16px" }}>
          {store.tagline ?? "Customise your store in the dashboard"}
        </h1>
        <p style={{ fontSize: "13px", color: "#cbd5e1" }}>
          Go to Store Editor to publish your storefront design.
        </p>
      </div>

      {/* Product placeholders */}
      <div style={{ padding: "48px 40px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ width: "160px", height: "20px", borderRadius: "6px", background: "#f1f5f9", marginBottom: "8px" }} />
          <div style={{ width: "100px", height: "12px", borderRadius: "4px", background: "#f8fafc" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #f1f5f9" }}>
              <div style={{ aspectRatio: "1", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "28px", opacity: 0.15 }}>📦</span>
              </div>
              <div style={{ padding: "12px" }}>
                <div style={{ width: "70%", height: "10px", borderRadius: "3px", background: "#f1f5f9", marginBottom: "6px" }} />
                <div style={{ width: "40%", height: "10px", borderRadius: "3px", background: "#f8fafc" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
