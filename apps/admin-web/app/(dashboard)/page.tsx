"use client";

import { useAdminMe } from "@/lib/swr/hooks";

export default function DashboardHome() {
  const { data, isLoading } = useAdminMe();

  return (
    <div>
      <h1 className="mb-1 text-[20px] font-extrabold text-[#0A2E1A]">Dashboard</h1>
      <p className="mb-6 text-[13px] text-slate-500">
        Activity feed and platform analytics land here in a later phase.
      </p>

      <div className="rounded-[12px] border border-[#e2e8f0] bg-white p-5">
        <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-slate-400">
          Session
        </p>
        {isLoading ? (
          <p className="text-[13px] text-slate-400">Loading…</p>
        ) : (
          <pre className="overflow-x-auto text-[12px] text-slate-600">
            {JSON.stringify(data?.admin, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
