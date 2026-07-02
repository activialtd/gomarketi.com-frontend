// Skeleton for the categories page
export default function CategoriesSkeleton() {
  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="h-7 w-28 rounded-[8px] bg-[#f1f5f9]" />
        <div className="h-9 w-36 rounded-[8px] bg-[#1A7A42]/20" />
      </div>
      <div className="rounded-[14px] border overflow-hidden" style={{ borderColor: "#e2e8f0" }}>
        <div className="h-11 bg-[#f8fafc] border-b" style={{ borderColor: "#f1f5f9" }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: "#f9fafb" }}>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-[6px] bg-[#f1f5f9]" />
              <div className="h-3.5 rounded bg-[#f1f5f9]" style={{ width: `${80 + i * 20}px` }} />
            </div>
            <div className="flex gap-2">
              <div className="h-7 w-14 rounded-[7px] bg-[#f1f5f9]" />
              <div className="h-7 w-14 rounded-[7px] bg-[#f1f5f9]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
