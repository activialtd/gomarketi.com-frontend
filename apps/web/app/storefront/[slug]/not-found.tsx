export default function StoreNotFound() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl"
          style={{ background: "#f8fafc" }}
        >
          🏪
        </div>
        <h1 className="text-[22px] font-extrabold mb-2" style={{ color: "#1C1C1C" }}>
          Store not found
        </h1>
        <p className="text-[14px] leading-relaxed" style={{ color: "#6b7280" }}>
          This store doesn't exist or isn't active yet.
        </p>
        <a
          href="https://gomarketi.com"
          className="inline-block mt-6 text-[13px] font-semibold"
          style={{ color: "#1A7A42" }}
        >
          ← Back to GoMarket
        </a>
      </div>
    </main>
  );
}
