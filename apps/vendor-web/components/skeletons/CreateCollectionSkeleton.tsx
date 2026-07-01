// Skeleton for the create collection page
export default function CreateCollectionSkeleton() {
  return (
    <div className="w-full animate-in fade-in duration-300">
      <div className="px-6 py-4 border-b flex items-center justify-between gap-3" style={{ borderColor: "#e2e8f0", background: "#fff" }}>
        <div className="flex items-center gap-3">
          <div className="h-4 w-16 rounded bg-[#f1f5f9]" />
          <div className="w-px h-4 bg-[#e2e8f0]" />
          <div className="h-5 w-44 rounded bg-[#f1f5f9]" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-[8px] bg-[#f1f5f9]" />
          <div className="h-9 w-28 rounded-[8px] bg-[#1A7A42]/20" />
        </div>
      </div>

      <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 max-w-5xl">
        <div className="space-y-4">
          <div className="rounded-[14px] border p-5 space-y-4" style={{ borderColor: "#e2e8f0", background: "#fff" }}>
            <div className="h-4 w-40 rounded bg-[#f1f5f9]" />
            <div className="h-10 rounded-[8px] bg-[#f1f5f9]" />
            <div className="h-20 rounded-[8px] bg-[#f1f5f9]" />
          </div>
          <div className="rounded-[14px] border p-5 space-y-3" style={{ borderColor: "#e2e8f0", background: "#fff" }}>
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-[#f1f5f9]" />
              <div className="h-8 w-20 rounded-[7px] bg-[#f1f5f9]" />
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-2 rounded-[7px]">
                <div className="w-4 h-4 rounded-[4px] bg-[#f1f5f9]" />
                <div className="w-9 h-9 rounded-[6px] bg-[#f1f5f9]" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 rounded bg-[#f1f5f9]" style={{ width: `${60 + i * 15}%` }} />
                  <div className="h-2.5 w-16 rounded bg-[#f8fafc]" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[14px] border p-4 space-y-3" style={{ borderColor: "#e2e8f0", background: "#fff" }}>
          <div className="h-4 w-24 rounded bg-[#f1f5f9]" />
          <div className="h-32 rounded-[10px] bg-[#f8fafc] border-2 border-dashed" style={{ borderColor: "#e2e8f0" }} />
        </div>
      </div>
    </div>
  );
}
