"use client";

import { use, useState } from "react";
import Link from "next/link";
import { mutate } from "swr";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { adminApi } from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import { useErrorEvent } from "@/lib/swr/hooks";
import { fmtDate } from "@/lib/format";

export default function ErrorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: e, isLoading } = useErrorEvent(id);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleResolve() {
    if (!accessToken) return;
    setBusy(true);
    setActionError(null);
    try {
      await adminApi.resolveError(id, accessToken);
      await mutate(`admin:error:${id}`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to resolve");
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) return <p className="text-[13px] text-muted-soft">Loading…</p>;
  if (!e) return <p className="text-[13px] text-muted-soft">Error event not found.</p>;

  return (
    <div>
      <Link href="/errors" className="mb-4 flex items-center gap-1.5 text-[12.5px] font-semibold text-muted hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to errors
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="badge"
              style={{
                background: e.level === "error" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.14)",
                color: e.level === "error" ? "#dc2626" : "#b45309",
              }}
            >
              {e.level}
            </span>
            <span className="text-[13px] font-semibold text-muted">{e.service}</span>
          </div>
          <h1 className="mt-1.5 text-[17px] font-bold text-foreground">{e.message}</h1>
          <p className="mt-1 text-[12px] text-muted-soft">
            {fmtDate(e.created_at)}
            {e.request_path && ` · ${e.request_path}`}
            {e.status_code && ` · HTTP ${e.status_code}`}
            {e.user_id && ` · user ${e.user_id}`}
          </p>
        </div>
        {!e.resolved ? (
          <button onClick={handleResolve} disabled={busy} className="btn btn-primary h-8 px-3 text-[12.5px]">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            Mark resolved
          </button>
        ) : (
          <span className="badge" style={{ background: "rgba(34,197,94,0.12)", color: "#15803d" }}>
            Resolved {e.resolved_at ? fmtDate(e.resolved_at) : ""}
          </span>
        )}
      </div>

      {actionError && <p className="mb-4 text-[12.5px] text-[#dc2626]">{actionError}</p>}

      {e.stack && (
        <div className="card mb-4 p-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-soft">Stack trace</p>
          <pre className="overflow-auto whitespace-pre-wrap text-[12px] leading-relaxed text-foreground">{e.stack}</pre>
        </div>
      )}

      {e.context != null && (
        <div className="card p-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-soft">Context</p>
          <pre className="overflow-auto whitespace-pre-wrap text-[12px] leading-relaxed text-foreground">
            {JSON.stringify(e.context, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
