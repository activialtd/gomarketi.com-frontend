"use client";

import { useState } from "react";
import Link from "next/link";
import { useVendors } from "@/lib/swr/hooks";
import { fmtDate } from "@/lib/format";

const KYC_COLORS: Record<string, { bg: string; fg: string }> = {
  verified: { bg: "#F0FAF3", fg: "#1A7A42" },
  pending: { bg: "#fffbeb", fg: "#b45309" },
  none: { bg: "#f1f5f9", fg: "#64748b" },
};

export default function VendorsPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useVendors({ q: q || undefined, page, per_page: 20 });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-extrabold text-[#0A2E1A]">Vendors</h1>
          <p className="text-[13px] text-slate-500">
            {data ? `${data.total} vendor${data.total === 1 ? "" : "s"}` : "Loading…"}
          </p>
        </div>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Search name, email, or business…"
          className="h-9 w-72 rounded-[8px] border border-[#e2e8f0] px-3 text-[13px] outline-none focus:border-[#1A7A42]"
        />
      </div>

      <div className="overflow-hidden rounded-[12px] border border-[#e2e8f0] bg-white">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-[#e2e8f0] bg-[#F7F9F8] text-[11px] font-bold uppercase tracking-wide text-slate-400">
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Business</th>
              <th className="px-4 py-2.5">Onboarding</th>
              <th className="px-4 py-2.5">KYC</th>
              <th className="px-4 py-2.5">Joined</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && data?.vendors.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No vendors found.
                </td>
              </tr>
            )}
            {data?.vendors.map((v) => {
              const kyc = KYC_COLORS[v.kyc_status] ?? KYC_COLORS.none;
              return (
                <tr key={v.id} className="border-b border-[#f1f5f9] last:border-0 hover:bg-[#F7F9F8]">
                  <td className="px-4 py-2.5">
                    <Link href={`/vendors/${v.id}`} className="font-semibold text-[#0A2E1A] hover:underline">
                      {v.full_name ?? "—"}
                    </Link>
                    <p className="text-[11px] text-slate-400">{v.email}</p>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{v.business_name ?? "—"}</td>
                  <td className="px-4 py-2.5 capitalize text-slate-600">{v.onboarding_step.replace(/_/g, " ")}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-bold capitalize"
                      style={{ background: kyc.bg, color: kyc.fg }}
                    >
                      {v.kyc_status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-400">{fmtDate(v.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data && data.total > data.per_page && (
        <div className="mt-4 flex items-center justify-between text-[12px] text-slate-500">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-[6px] border border-[#e2e8f0] px-3 py-1.5 disabled:opacity-40"
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            disabled={page * data.per_page >= data.total}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-[6px] border border-[#e2e8f0] px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
