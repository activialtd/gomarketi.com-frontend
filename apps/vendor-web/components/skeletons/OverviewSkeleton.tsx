import Skeleton from "@gomarket/ui/src/skeleton";

export default function PageLoader() {
  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      <Skeleton className="w-full h-[54px] rounded-[10px]" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Wallet card */}
        <div
          className="lg:col-span-2 rounded-[14px] border p-5 space-y-3.5"
          style={{ background: "#fff", borderColor: "#e2e8f0" }}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="w-48 h-5" />
              <Skeleton className="w-32 h-3" />
            </div>
            <Skeleton className="w-28 h-7 rounded-[8px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-[10px] p-4 space-y-2.5"
              style={{ background: "#F0FAF3" }}
            >
              <Skeleton className="w-20 h-2.5" />
              <Skeleton className="w-36 h-7" />
              <Skeleton className="w-28 h-2.5" />
            </div>
            <div
              className="rounded-[10px] p-4 space-y-2.5 border"
              style={{ borderColor: "#e2e8f0" }}
            >
              <Skeleton className="w-20 h-2.5" />
              <Skeleton className="w-36 h-7" />
              <Skeleton className="w-28 h-2.5" />
            </div>
          </div>
          <div
            className="rounded-[8px] px-4 py-3 flex items-center justify-between"
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
          >
            <div className="flex items-center gap-3">
              <Skeleton className="w-4 h-4 rounded" />
              <div className="space-y-1.5">
                <Skeleton className="w-16 h-2.5" />
                <Skeleton className="w-44 h-3.5" />
              </div>
            </div>
            <Skeleton className="w-16 h-7 rounded-[7px]" />
          </div>
        </div>

        {/* To-do + Quick actions */}
        <div className="space-y-4">
          <div
            className="rounded-[14px] border p-4 space-y-3"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <div className="flex items-center justify-between">
              <Skeleton className="w-20 h-4" />
              <Skeleton className="w-16 h-5 rounded-full" />
            </div>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="w-full h-8 rounded-[8px]" />
            ))}
          </div>
          <div
            className="rounded-[14px] border p-4"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <Skeleton className="w-24 h-4 mb-3" />
            <div className="grid grid-cols-2 gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-[10px]" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats row ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-[14px] border p-4 flex items-start justify-between"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <div className="space-y-2.5">
              <Skeleton className="w-20 h-2.5" />
              <Skeleton className="w-12 h-7" />
              <Skeleton className="w-24 h-2.5" />
            </div>
            <Skeleton className="w-9 h-9 rounded-[10px]" />
          </div>
        ))}
      </div>

      {/* ── Chart + top channels row ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div
          className="lg:col-span-2 rounded-[14px] border p-5 space-y-4"
          style={{ background: "#fff", borderColor: "#e2e8f0" }}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="w-40 h-5" />
              <Skeleton className="w-28 h-3" />
            </div>
            <Skeleton className="w-36 h-11 rounded-[8px]" />
          </div>
          {/* Chart bars */}
          <div className="flex items-end gap-1.5 h-36 pb-2">
            {[40, 75, 55, 90, 70, 85, 30, 28, 25, 22, 18, 12].map((h, i) => (
              <Skeleton
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${h}%`,
                  opacity: i > 5 ? 0.35 - i * 0.03 : 1,
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="w-24 h-3 rounded" />
            <Skeleton className="w-28 h-3 rounded" />
          </div>
        </div>

        <div
          className="rounded-[14px] border p-5 space-y-4"
          style={{ background: "#fff", borderColor: "#e2e8f0" }}
        >
          <div className="flex items-center justify-between">
            <Skeleton className="w-24 h-5" />
            <Skeleton className="w-14 h-3.5" />
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className="w-20 h-3" />
                <Skeleton className="w-16 h-3" />
              </div>
              <Skeleton className="w-full h-1.5 rounded-full" />
            </div>
          ))}
          <Skeleton className="w-full h-[72px] rounded-[10px]" />
        </div>
      </div>

      {/* ── Recent orders table ───────────────────────────── */}
      <div
        className="rounded-[14px] border overflow-hidden"
        style={{ background: "#fff", borderColor: "#e2e8f0" }}
      >
        <div
          className="px-5 py-4 flex items-center justify-between border-b"
          style={{ borderColor: "#f1f5f9" }}
        >
          <div className="space-y-2">
            <Skeleton className="w-36 h-5" />
            <Skeleton className="w-52 h-3" />
          </div>
          <Skeleton className="w-20 h-3.5" />
        </div>

        {/* Header row */}
        <div
          className="hidden sm:grid px-5 py-2.5 border-b"
          style={{
            gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr",
            gap: "1rem",
            borderColor: "#f1f5f9",
          }}
        >
          {[100, 80, 60, 72, 60].map((w, i) => (
            <Skeleton key={i} className="h-2.5" style={{ width: `${w}%` }} />
          ))}
        </div>

        {/* Data rows */}
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="hidden sm:grid px-5 py-3.5 border-b last:border-0"
            style={{
              gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr",
              gap: "1rem",
              borderColor: "#f9fafb",
            }}
          >
            <div className="space-y-1.5">
              <Skeleton className="w-24 h-3.5" />
              <Skeleton className="w-32 h-2.5" />
            </div>
            <Skeleton className="h-3 self-center" style={{ width: "75%" }} />
            <Skeleton className="h-3.5 self-center" style={{ width: "80%" }} />
            <Skeleton className="h-5 w-[72px] rounded-full self-center" />
            <Skeleton className="h-2.5 self-center" style={{ width: "70%" }} />
          </div>
        ))}

        {/* Mobile row fallback */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="sm:hidden px-5 py-3.5 space-y-2 border-b last:border-0"
            style={{ borderColor: "#f9fafb" }}
          >
            <div className="flex items-center justify-between">
              <Skeleton className="w-28 h-3.5" />
              <Skeleton className="h-5 w-[72px] rounded-full" />
            </div>
            <Skeleton className="w-40 h-2.5" />
          </div>
        ))}
      </div>
    </div>
  );
}
