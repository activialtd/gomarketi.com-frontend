import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
      <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#1C1C1C", marginBottom: "8px" }}>
        Product not found
      </h1>
      <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "24px" }}>
        This item may have been removed or is no longer available.
      </p>
      <Link href="/shop" style={{
        background: "var(--store-primary, #1A7A42)", color: "#fff",
        borderRadius: "10px", padding: "11px 24px",
        fontWeight: 700, fontSize: "14px", textDecoration: "none",
      }}>
        Browse all products →
      </Link>
    </div>
  );
}
