// Generic skeleton shown while a merchant dashboard page is loading.
// Used by all loading.tsx files so the transition is instant and consistent.
export default function PageSkeleton() {
  return (
    <div className="w-full animate-pulse">
      {/* Page header bar */}
      <div
        className="px-6 lg:px-8 py-4 border-b flex items-center justify-between"
        style={{ background: "#fff", borderColor: "#e2e8f0" }}
      >
        <div className="h-6 w-40 rounded-[8px]" style={{ background: "#f1f5f9" }} />
        <div className="h-9 w-28 rounded-[10px]" style={{ background: "#f1f5f9" }} />
      </div>

      <div className="px-6 lg:px-8 py-5 space-y-5">
        {/* Stat cards row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-[12px] border p-4 space-y-3"
              style={{ background: "#fff", borderColor: "#e2e8f0" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[9px]" style={{ background: "#f1f5f9" }} />
                <div className="space-y-1.5 flex-1">
                  <div className="h-5 w-16 rounded" style={{ background: "#f1f5f9" }} />
                  <div className="h-3 w-20 rounded" style={{ background: "#f1f5f9" }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main content block */}
        <div
          className="rounded-[14px] border overflow-hidden"
          style={{ background: "#fff", borderColor: "#e2e8f0" }}
        >
          {/* Table / list header */}
          <div
            className="px-4 py-3 border-b flex items-center gap-3"
            style={{ borderColor: "#f1f5f9", background: "#fafafa" }}
          >
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-3 rounded flex-1" style={{ background: "#e2e8f0" }} />
            ))}
          </div>

          {/* Table rows */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="px-4 py-3.5 border-b flex items-center gap-4"
              style={{ borderColor: "#f9fafb" }}
            >
              <div className="w-10 h-10 rounded-[8px] shrink-0" style={{ background: "#f1f5f9" }} />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-48 rounded" style={{ background: "#f1f5f9" }} />
                <div className="h-2.5 w-32 rounded" style={{ background: "#f1f5f9" }} />
              </div>
              <div className="h-5 w-16 rounded-full" style={{ background: "#f1f5f9" }} />
              <div className="h-3.5 w-20 rounded" style={{ background: "#f1f5f9" }} />
              <div className="h-7 w-7 rounded-[6px]" style={{ background: "#f1f5f9" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
