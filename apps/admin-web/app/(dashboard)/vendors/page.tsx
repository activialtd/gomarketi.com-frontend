"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useVendors } from "@/lib/swr/hooks";
import { fmtDate } from "@/lib/format";
import { Avatar } from "@/components/Avatar";

const KYC_STYLE: Record<string, { bg: string; fg: string }> = {
  verified: { bg: "rgba(34,197,94,0.12)", fg: "#15803d" },
  pending: { bg: "rgba(245,158,11,0.14)", fg: "#b45309" },
  none: { bg: "var(--input)", fg: "var(--muted)" },
};

export default function VendorsPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useVendors({ q: q || undefined, page, per_page: 20 });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-foreground">Vendors</h1>
          <p className="mt-0.5 text-[13px] text-muted">
            {data ? `${data.total} vendor${data.total === 1 ? "" : "s"}` : "Loading…"}
          </p>
        </div>
        <div className="relative w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-soft" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, email, or business…"
            className="input pl-9"
          />
        </div>
      </div>

      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Business</th>
              <th>Onboarding</th>
              <th>KYC</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-soft">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && data?.vendors.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-soft">
                  No vendors found.
                </td>
              </tr>
            )}
            {data?.vendors.map((v) => {
              const kyc = KYC_STYLE[v.kyc_status] ?? KYC_STYLE.none!;
              return (
                <tr key={v.id}>
                  <td>
                    <Link href={`/vendors/${v.id}`} className="flex items-center gap-2.5 group">
                      <Avatar name={v.full_name} size={30} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground group-hover:underline">
                          {v.full_name ?? "—"}
                        </p>
                        <p className="truncate text-[11px] text-muted-soft">{v.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="text-muted">{v.business_name ?? "—"}</td>
                  <td className="capitalize text-muted">{v.onboarding_step.replace(/_/g, " ")}</td>
                  <td>
                    <span className="badge capitalize" style={{ background: kyc.bg, color: kyc.fg }}>
                      {v.kyc_status}
                    </span>
                  </td>
                  <td className="text-muted-soft">{fmtDate(v.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data && data.total > data.per_page && (
        <div className="mt-4 flex items-center justify-between text-[12.5px] text-muted">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn btn-outline h-8 px-3"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </button>
          <span>Page {page}</span>
          <button
            disabled={page * data.per_page >= data.total}
            onClick={() => setPage((p) => p + 1)}
            className="btn btn-outline h-8 px-3"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
