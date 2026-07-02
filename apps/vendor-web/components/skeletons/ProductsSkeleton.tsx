// Skeleton for the products list page
export default function ProductsSkeleton() {
  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-28 rounded-[8px] bg-[#f1f5f9]" />
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-[8px] bg-[#f1f5f9]" />
          <div className="h-9 w-32 rounded-[8px] bg-[#1A7A42]/20" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-[12px] border p-4 space-y-2" style={{ borderColor: "#e2e8f0", background: "#fff" }}>
            <div className="h-3 w-16 rounded bg-[#f1f5f9]" />
            <div className="h-7 w-10 rounded bg-[#f1f5f9]" />
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-3">
        <div className="flex-1 h-9 rounded-[8px] bg-[#f1f5f9]" />
        <div className="h-9 w-24 rounded-[8px] bg-[#f1f5f9]" />
        <div className="h-9 w-24 rounded-[8px] bg-[#f1f5f9]" />
      </div>

      {/* Table header */}
      <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: "#e2e8f0" }}>
        <div className="h-10 bg-[#f8fafc] border-b" style={{ borderColor: "#f1f5f9" }} />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b" style={{ borderColor: "#f9fafb" }}>
            <div className="w-10 h-10 rounded-[8px] bg-[#f1f5f9] shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-36 rounded bg-[#f1f5f9]" />
              <div className="h-2.5 w-20 rounded bg-[#f8fafc]" />
            </div>
            <div className="h-3 w-16 rounded bg-[#f1f5f9] hidden sm:block" />
            <div className="h-3 w-12 rounded bg-[#f1f5f9] hidden sm:block" />
            <div className="h-6 w-16 rounded-full bg-[#f1f5f9] hidden sm:block" />
            <div className="h-3 w-8 rounded bg-[#f8fafc]" />
          </div>
        ))}
      </div>
    </div>
  );
}
