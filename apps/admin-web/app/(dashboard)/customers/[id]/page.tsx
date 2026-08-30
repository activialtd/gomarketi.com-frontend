"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCustomer } from "@/lib/swr/hooks";
import { fmtNaira, fmtDate } from "@/lib/format";

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useCustomer(id);

  if (isLoading) return <p className="text-[13px] text-slate-400">Loading…</p>;
  if (error || !data) return <p className="text-[13px] text-red-600">Customer not found.</p>;

  const { profile, orders } = data;

  return (
    <div>
      <Link href="/customers" className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to customers
      </Link>

      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-[20px] font-extrabold text-[#0A2E1A]">{profile.full_name ?? "Unnamed customer"}</h1>
          <p className="text-[13px] text-slate-500">{profile.email}</p>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-bold"
          style={{
            background: profile.is_active ? "#F0FAF3" : "#fef2f2",
            color: profile.is_active ? "#1A7A42" : "#dc2626",
          }}
        >
          {profile.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <StatCard label="Total orders" value={String(profile.total_orders)} />
        <StatCard label="Total spent" value={fmtNaira(profile.total_spent)} />
        <StatCard label="Customer since" value={fmtDate(profile.created_at)} />
      </div>

      <h2 className="mb-3 text-[14px] font-bold text-[#0A2E1A]">Order history</h2>
      <div className="overflow-hidden rounded-[12px] border border-[#e2e8f0] bg-white">
        {orders.length === 0 ? (
          <p className="px-4 py-6 text-center text-[13px] text-slate-400">No orders yet.</p>
        ) : (
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#F7F9F8] text-[11px] font-bold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-2.5">Items</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Total</th>
                <th className="px-4 py-2.5">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-[#f1f5f9] last:border-0">
                  <td className="px-4 py-2.5 text-slate-600">
                    {o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-2.5 capitalize text-slate-600">{o.status}</td>
                  <td className="px-4 py-2.5 text-slate-600">{fmtNaira(o.total_kobo)}</td>
                  <td className="px-4 py-2.5 text-slate-400">{fmtDate(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-[#e2e8f0] bg-white p-4">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-[16px] font-extrabold text-[#0A2E1A]">{value}</p>
    </div>
  );
}
