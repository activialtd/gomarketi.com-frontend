"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Wallet } from "lucide-react";
import { useVendor } from "@/lib/swr/hooks";
import { fmtNaira, fmtDate } from "@/lib/format";
import { Avatar } from "@/components/Avatar";
import { StatCard } from "@/components/StatCard";

export default function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useVendor(id);

  if (isLoading) return <p className="text-[13px] text-muted-soft">Loading…</p>;
  if (error || !data) return <p className="text-[13px] text-red-600">Vendor not found.</p>;

  const { profile, stores, sales } = data;
  const totalSalesKobo = sales.reduce((sum, s) => sum + Number(s.total_kobo), 0);

  return (
    <div>
      <Link
        href="/vendors"
        className="mb-5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to vendors
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <Avatar name={profile.full_name} size={48} />
          <div>
            <h1 className="text-[19px] font-extrabold tracking-tight text-foreground">
              {profile.full_name ?? "Unnamed vendor"}
            </h1>
            <p className="text-[13px] text-muted">
              {profile.business_name ?? "No business name set"} · {profile.email}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <span
            className="badge capitalize"
            style={
              profile.kyc_status === "verified"
                ? { background: "rgba(34,197,94,0.12)", color: "#15803d" }
                : { background: "rgba(245,158,11,0.14)", color: "#b45309" }
            }
          >
            KYC: {profile.kyc_status}
          </span>
          <span className="badge" style={{ background: "var(--input)", color: "var(--primary-soft)" }}>
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
        <div className="card mb-6 flex items-center gap-3 p-4">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px]"
            style={{ background: "var(--input)" }}
          >
            <Wallet className="h-[16px] w-[16px]" style={{ color: "var(--primary-soft)" }} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-soft">
              Payment account
            </p>
            <p className="text-[13px] font-semibold text-foreground">
              {profile.paystack_dva_bank_name} — {profile.paystack_dva_account_number}
            </p>
          </div>
        </div>
      )}

      <h2 className="mb-3 text-[14px] font-bold text-foreground">Stores</h2>
      <div className="table-shell mb-7">
        {stores.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-muted-soft">No stores yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Currency</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id}>
                  <td className="font-semibold text-foreground">{s.name}</td>
                  <td className="capitalize text-muted">{s.category}</td>
                  <td className="text-muted">{s.currency}</td>
                  <td className="text-muted">{s.is_active ? "Active" : "Inactive"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h2 className="mb-3 text-[14px] font-bold text-foreground">Recent sales</h2>
      <div className="table-shell">
        {sales.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-muted-soft">No sales yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Store</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id}>
                  <td className="text-muted">{s.store_name}</td>
                  <td className="text-muted">{s.customer_name}</td>
                  <td className="capitalize text-muted">{s.status}</td>
                  <td className="font-semibold text-foreground">{fmtNaira(s.total_kobo)}</td>
                  <td className="text-muted-soft">{fmtDate(s.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
