"use client";

import { use, useState } from "react";
import Link from "next/link";
import { mutate } from "swr";
import { ArrowLeft, CheckCircle2, Truck, RotateCcw, Loader2, AlertTriangle, XCircle, Banknote } from "lucide-react";
import { adminApi, type AdminOrderStatus } from "@gomarket/api-client";
import { useAuthStore, roleAtLeast } from "@/store/useAuthStore";
import { useBatch } from "@/lib/swr/hooks";
import { fmtNaira, fmtDate } from "@/lib/format";

const STATUS_STYLE: Record<AdminOrderStatus, { bg: string; fg: string; label: string }> = {
  pending: { bg: "var(--input)", fg: "var(--muted)", label: "Pending" },
  confirmed: { bg: "rgba(59,130,246,0.12)", fg: "#1d4ed8", label: "Confirmed — awaiting hub" },
  at_hub: { bg: "rgba(245,158,11,0.14)", fg: "#b45309", label: "At GoMarketi hub" },
  shipped: { bg: "rgba(34,197,94,0.12)", fg: "#15803d", label: "Dispatched" },
  delivered: { bg: "rgba(26,122,66,0.14)", fg: "#0A2E1A", label: "Delivered" },
  cancelled: { bg: "rgba(239,68,68,0.1)", fg: "#dc2626", label: "Cancelled" },
};

export default function BatchDetailPage({ params }: { params: Promise<{ paymentReference: string }> }) {
  const { paymentReference } = use(params);
  const decodedRef = decodeURIComponent(paymentReference);
  const { data, isLoading, error } = useBatch(decodedRef);
  const admin = useAuthStore((s) => s.admin);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const canDispatch = roleAtLeast(admin?.role, "supervisor");
  const key = `admin:batch:${decodedRef}`;

  async function handleHubIntake(orderId: string) {
    if (!accessToken) return;
    setBusyId(orderId);
    setActionError(null);
    try {
      await adminApi.hubIntake(orderId, accessToken);
      await mutate(key);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Hub intake failed");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDispatch() {
    if (!accessToken) return;
    setBusyId("__dispatch__");
    setActionError(null);
    try {
      const result = await adminApi.dispatchBatch(decodedRef, accessToken);
      if (result.refund_errors.length > 0) {
        setActionError(
          `Dispatched, but ${result.refund_errors.length} refund(s) failed — check the orders manually.`,
        );
      }
      await mutate(key);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Dispatch failed");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReleaseEscrow(orderId: string) {
    if (!accessToken) return;
    setBusyId(orderId);
    setActionError(null);
    try {
      await adminApi.releaseEscrow(orderId, accessToken);
      await mutate(key);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Escrow release failed");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDismissDispute(orderId: string) {
    if (!accessToken) return;
    setBusyId(orderId);
    setActionError(null);
    try {
      await adminApi.dismissDispute(orderId, accessToken);
      await mutate(key);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Dismissing dispute failed");
    } finally {
      setBusyId(null);
    }
  }

  async function handleRefundDispute(orderId: string) {
    if (!accessToken) return;
    if (!confirm("Refund the buyer for this order via Paystack? This cancels the order and reverses the vendor's payout.")) return;
    setBusyId(orderId);
    setActionError(null);
    try {
      await adminApi.refundDispute(orderId, accessToken);
      await mutate(key);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Dispute refund failed");
    } finally {
      setBusyId(null);
    }
  }

  if (isLoading) return <p className="text-[13px] text-muted-soft">Loading…</p>;
  if (error || !data) return <p className="text-[13px] text-red-600">Order not found.</p>;

  const notYetAtHub = data.orders.filter((o) => o.status === "confirmed");
  const readyToDispatch = data.orders.some((o) => o.status === "confirmed" || o.status === "at_hub");

  return (
    <div>
      <Link href="/orders" className="mb-5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to orders
      </Link>

      <div className="mb-2 flex items-start justify-between">
        <div>
          <h1 className="text-[19px] font-extrabold tracking-tight text-foreground">{data.customer_name}</h1>
          <p className="text-[13px] text-muted">{data.customer_email}</p>
        </div>
        {canDispatch && readyToDispatch && (
          <button
            onClick={handleDispatch}
            disabled={busyId !== null}
            className="btn btn-primary h-10 px-4"
            title={
              notYetAtHub.length > 0
                ? `${notYetAtHub.length} vendor(s) haven't checked in yet — they'll be cancelled and refunded`
                : undefined
            }
          >
            {busyId === "__dispatch__" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
            Dispatch batch
          </button>
        )}
      </div>

      {notYetAtHub.length > 0 && readyToDispatch && (
        <p className="mb-4 text-[12px] text-amber-600">
          {notYetAtHub.length} of {data.orders.length} vendor{notYetAtHub.length === 1 ? "" : "s"} haven't
          delivered to the hub yet — dispatching now will cancel and refund their portion.
        </p>
      )}

      {actionError && (
        <div className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-700">
          {actionError}
        </div>
      )}

      <div className="space-y-3">
        {data.orders.map((o) => {
          const style = STATUS_STYLE[o.status];
          return (
            <div key={o.id} className="card p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[14px] font-bold text-foreground">{o.store_name}</p>
                <div className="flex items-center gap-1.5">
                  {o.dispute_status === "reported" && (
                    <span className="badge" style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626" }}>
                      <AlertTriangle className="h-3 w-3" /> Reported missing
                    </span>
                  )}
                  <span className="badge" style={{ background: style.bg, color: style.fg }}>
                    {style.label}
                  </span>
                </div>
              </div>
              {o.dispute_status === "reported" && (
                <p className="mb-2 text-[12px] text-red-600">
                  Buyer says this wasn't received{o.dispute_reason ? `: "${o.dispute_reason}"` : "."}
                  {o.disputed_at ? ` — reported ${fmtDate(o.disputed_at)}` : ""}
                </p>
              )}
              <p className="mb-3 text-[13px] text-muted">
                {o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ") || "—"} · {fmtNaira(o.total_kobo)}
              </p>

              <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-muted-soft">
                {o.hub_received_at && <span>Checked in {fmtDate(o.hub_received_at)}</span>}
                {o.dispatched_at && <span>· Dispatched {fmtDate(o.dispatched_at)}</span>}
                {o.delivery_confirmed_at && <span>· Received {fmtDate(o.delivery_confirmed_at)}</span>}
                {o.cancelled_reason && <span>· {o.cancelled_reason.replace(/_/g, " ")}</span>}
                {o.wallet_status && (
                  <span
                    className="badge ml-1"
                    style={
                      o.wallet_status === "completed"
                        ? { background: "rgba(34,197,94,0.1)", color: "#15803d" }
                        : o.wallet_status === "failed"
                          ? { background: "rgba(239,68,68,0.1)", color: "#dc2626" }
                          : { background: "var(--input)", color: "var(--muted)" }
                    }
                  >
                    Escrow: {o.wallet_status === "completed" ? "released" : o.wallet_status === "failed" ? "reversed" : "held"}
                  </span>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                {o.status === "confirmed" && (
                  <button
                    onClick={() => handleHubIntake(o.id)}
                    disabled={busyId !== null}
                    className="btn btn-outline h-8 px-3"
                  >
                    {busyId === o.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    Confirm hub intake
                  </button>
                )}
                {canDispatch && o.wallet_status === "pending" && (o.status === "shipped" || o.status === "delivered") && (
                  <button
                    onClick={() => handleReleaseEscrow(o.id)}
                    disabled={busyId !== null}
                    className="btn btn-ghost h-8 px-3"
                  >
                    {busyId === o.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                    Release escrow manually
                  </button>
                )}
                {canDispatch && o.dispute_status === "reported" && (
                  <>
                    <button
                      onClick={() => handleRefundDispute(o.id)}
                      disabled={busyId !== null}
                      className="btn h-8 px-3"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626" }}
                    >
                      {busyId === o.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Banknote className="h-3.5 w-3.5" />}
                      Refund buyer
                    </button>
                    <button
                      onClick={() => handleDismissDispute(o.id)}
                      disabled={busyId !== null}
                      className="btn btn-ghost h-8 px-3"
                    >
                      {busyId === o.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                      Dismiss dispute
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
