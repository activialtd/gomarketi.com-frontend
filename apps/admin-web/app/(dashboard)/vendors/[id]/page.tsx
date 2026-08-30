"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useVendor } from "@/lib/swr/hooks";
import { fmtNaira, fmtDate } from "@/lib/format";

export default function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useVendor(id);

  if (isLoading) return <p className="text-[13px] text-slate-400">Loading…</p>;
  if (error || !data) return <p className="text-[13px] text-red-600">Vendor not found.</p>;

  const { profile, stores, sales } = data;
  const totalSalesKobo = sales.reduce((sum, s) => sum + Number(s.total_kobo), 0);

  return (
    <div>
      <Link href="/vendors" className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to vendors
      </Link>

      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-[20px] font-extrabold text-[#0A2E1A]">{profile.full_name ?? "Unnamed vendor"}</h1>
          <p className="text-[13px] text-slate-500">
            {profile.business_name ?? "No business name set"} · {profile.email}
          </p>
        </div>
        <div className="flex gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-bold capitalize"
            style={{
              background: profile.kyc_status === "verified" ? "#F0FAF3" : "#fffbeb",
              color: profile.kyc_status === "verified" ? "#1A7A42" : "#b45309",
            }}
          >
            KYC: {profile.kyc_status}
          </span>
          <span className="rounded-full bg-[#F0FAF3] px-2.5 py-1 text-[11px] font-bold text-[#1A7A42]">
            {profile.plan_name ?? "No plan"}
          </span>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4">
        <StatCard label="Stores" value={String(stores.length)} />
        <StatCard label="Total sales" value={fmtNaira(totalSalesKobo)} />
        <StatCard label="Onboarding" value={profile.onboarding_step.replace(/_/g, " ")} />
        <StatCard label="Vendor since" value={fmtDate(profile.created_at)} />
      </div>

      {profile.paystack_dva_account_number && (
        <div className="mb-6 rounded-[10px] border border-[#e2e8f0] bg-white p-4">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Payment account</p>
          <p className="text-[13px] text-slate-700">
            {profile.paystack_dva_bank_name} — {profile.paystack_dva_account_number}
          </p>
        </div>
      )}

      <h2 className="mb-3 text-[14px] font-bold text-[#0A2E1A]">Stores</h2>
      <div className="mb-6 overflow-hidden rounded-[12px] border border-[#e2e8f0] bg-white">
        {stores.length === 0 ? (
          <p className="px-4 py-6 text-center text-[13px] text-slate-400">No stores yet.</p>
        ) : (
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#F7F9F8] text-[11px] font-bold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Currency</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id} className="border-b border-[#f1f5f9] last:border-0">
                  <td className="px-4 py-2.5 font-semibold text-[#0A2E1A]">{s.name}</td>
                  <td className="px-4 py-2.5 capitalize text-slate-600">{s.category}</td>
                  <td className="px-4 py-2.5 text-slate-600">{s.currency}</td>
                  <td className="px-4 py-2.5 text-slate-600">{s.is_active ? "Active" : "Inactive"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h2 className="mb-3 text-[14px] font-bold text-[#0A2E1A]">Recent sales</h2>
      <div className="overflow-hidden rounded-[12px] border border-[#e2e8f0] bg-white">
        {sales.length === 0 ? (
          <p className="px-4 py-6 text-center text-[13px] text-slate-400">No sales yet.</p>
        ) : (
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#F7F9F8] text-[11px] font-bold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-2.5">Store</th>
                <th className="px-4 py-2.5">Customer</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Total</th>
                <th className="px-4 py-2.5">Date</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="border-b border-[#f1f5f9] last:border-0">
                  <td className="px-4 py-2.5 text-slate-600">{s.store_name}</td>
                  <td className="px-4 py-2.5 text-slate-600">{s.customer_name}</td>
                  <td className="px-4 py-2.5 capitalize text-slate-600">{s.status}</td>
                  <td className="px-4 py-2.5 text-slate-600">{fmtNaira(s.total_kobo)}</td>
                  <td className="px-4 py-2.5 text-slate-400">{fmtDate(s.created_at)}</td>
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
      <p className="truncate text-[16px] font-extrabold capitalize text-[#0A2E1A]">{value}</p>
    </div>
  );
}
