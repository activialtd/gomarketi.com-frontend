// Skeleton for the create/edit product form
export default function CreateProductSkeleton() {
  return (
    <div className="w-full animate-in fade-in duration-300">
      {/* Top bar */}
      <div className="px-6 py-4 border-b flex items-center justify-between gap-3" style={{ borderColor: "#e2e8f0", background: "#fff" }}>
        <div className="flex items-center gap-3">
          <div className="h-4 w-16 rounded bg-[#f1f5f9]" />
          <div className="w-px h-4 bg-[#e2e8f0]" />
          <div className="h-5 w-40 rounded bg-[#f1f5f9]" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-[8px] bg-[#f1f5f9]" />
          <div className="h-9 w-28 rounded-[8px] bg-[#1A7A42]/20" />
        </div>
      </div>

      <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 max-w-5xl">
        {/* Main column */}
        <div className="space-y-4">
          {/* Info card */}
          <div className="rounded-[14px] border p-5 space-y-4" style={{ borderColor: "#e2e8f0", background: "#fff" }}>
            <div className="h-4 w-48 rounded bg-[#f1f5f9]" />
            <div className="h-10 rounded-[8px] bg-[#f1f5f9]" />
            <div className="h-24 rounded-[8px] bg-[#f1f5f9]" />
            <div className="h-10 rounded-[8px] bg-[#f1f5f9]" />
          </div>

          {/* Images card */}
          <div className="rounded-[14px] border p-5 space-y-3" style={{ borderColor: "#e2e8f0", background: "#fff" }}>
            <div className="h-4 w-32 rounded bg-[#f1f5f9]" />
            <div className="h-28 rounded-[10px] bg-[#f8fafc] border-2 border-dashed" style={{ borderColor: "#e2e8f0" }} />
          </div>

          {/* Pricing card */}
          <div className="rounded-[14px] border p-5 space-y-4" style={{ borderColor: "#e2e8f0", background: "#fff" }}>
            <div className="h-4 w-20 rounded bg-[#f1f5f9]" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-10 rounded-[8px] bg-[#f1f5f9]" />
              <div className="h-10 rounded-[8px] bg-[#f1f5f9]" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-[14px] border p-4 space-y-3" style={{ borderColor: "#e2e8f0", background: "#fff" }}>
            <div className="h-4 w-24 rounded bg-[#f1f5f9]" />
            <div className="h-10 rounded-[8px] bg-[#f1f5f9]" />
          </div>
          <div className="rounded-[14px] border p-4 space-y-3" style={{ borderColor: "#e2e8f0", background: "#fff" }}>
            <div className="h-4 w-20 rounded bg-[#f1f5f9]" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 rounded-[7px] bg-[#f1f5f9]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
