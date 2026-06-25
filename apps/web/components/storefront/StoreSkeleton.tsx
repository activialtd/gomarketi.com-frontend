"use client";

import type { StoreData, StorefrontProduct } from "@/app/storefront/[slug]/page";

export default function StoreSkeleton({ store, products = [] }: { store: StoreData; products?: StorefrontProduct[] }) {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#fff" }}>

      {/* Header */}
      <header style={{ borderBottom: "1px solid #f1f5f9", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 900, fontSize: "20px", letterSpacing: "-0.4px", color: "#1C1C1C" }}>
          {store.name}
        </span>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <div style={{ width: "60px", height: "10px", borderRadius: "4px", background: "#f1f5f9" }} />
          <div style={{ width: "60px", height: "10px", borderRadius: "4px", background: "#f1f5f9" }} />
          <div style={{ width: "60px", height: "10px", borderRadius: "4px", background: "#f1f5f9" }} />
        </div>
      </header>

      {/* Hero placeholder */}
      <div style={{ background: "#f8fafc", padding: "80px 40px", textAlign: "center", borderBottom: "1px dashed #e2e8f0" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#94a3b8", marginBottom: "12px" }}>
          {store.name}
        </p>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, color: "#e2e8f0", letterSpacing: "-0.5px", marginBottom: "16px" }}>
          {store.tagline ?? "Your store tagline goes here"}
        </h1>
        <div style={{ display: "inline-flex", gap: "8px", justifyContent: "center" }}>
          <div style={{ width: "120px", height: "42px", borderRadius: "10px", background: "#e2e8f0" }} />
          <div style={{ width: "120px", height: "42px", borderRadius: "10px", background: "#f1f5f9" }} />
        </div>
      </div>

      {/* Products placeholder */}
      <div style={{ padding: "48px 40px" }}>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ width: "160px", height: "20px", borderRadius: "6px", background: "#f1f5f9", marginBottom: "8px" }} />
          <div style={{ width: "100px", height: "12px", borderRadius: "4px", background: "#f8fafc" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #f1f5f9" }}>
              <div style={{ aspectRatio: "1", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "28px", opacity: 0.2 }}>📦</span>
              </div>
              <div style={{ padding: "12px" }}>
                <div style={{ width: "70%", height: "10px", borderRadius: "3px", background: "#f1f5f9", marginBottom: "6px" }} />
                <div style={{ width: "40%", height: "10px", borderRadius: "3px", background: "#f8fafc" }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "48px", textAlign: "center", padding: "32px", border: "1px dashed #e2e8f0", borderRadius: "12px" }}>
          <p style={{ color: "#94a3b8", fontSize: "14px", fontWeight: 600 }}>
            🎨 This store is being set up
          </p>
          <p style={{ color: "#cbd5e1", fontSize: "13px", marginTop: "4px" }}>
            Products and content will appear here soon.
          </p>
        </div>
      </div>

      {/* Footer placeholder */}
      <footer style={{ borderTop: "1px solid #f1f5f9", padding: "24px 40px", textAlign: "center" }}>
        <p style={{ color: "#cbd5e1", fontSize: "12px" }}>
          {store.name} · Powered by GoMarketi
        </p>
      </footer>
    </div>
  );
}
