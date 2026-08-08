"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useNotificationStore } from "@/store/useNotificationStore";

const AUTO_DISMISS_MS = 6000;

function ToastItem({ id, title, body }: { id: string; title: string; body?: string }) {
  const dismissToast = useNotificationStore((s) => s.dismissToast);

  useEffect(() => {
    const timer = setTimeout(() => dismissToast(id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [id, dismissToast]);

  return (
    <div
      className="flex items-start gap-3 w-80 max-w-[calc(100vw-32px)] rounded-[10px] border p-3.5 shadow-lg"
      style={{ background: "#fff", borderColor: "#e9eef3", boxShadow: "0 10px 30px rgba(0,0,0,0.12)" }}
    >
      <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: "#1A7A42" }} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold leading-tight" style={{ color: "#1C1C1C" }}>
          {title}
        </p>
        {body && (
          <p className="text-[12px] mt-0.5 leading-snug" style={{ color: "#64748b" }}>
            {body}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismissToast(id)}
        className="shrink-0 p-0.5 rounded transition-colors hover:bg-gray-100"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" style={{ color: "#9ca3af" }} />
      </button>
    </div>
  );
}

// Fixed-position stack for live order/wallet notifications — ephemeral,
// driven entirely by useNotificationStore (no persisted history).
export function ToastContainer() {
  const toasts = useNotificationStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem {...t} />
        </div>
      ))}
    </div>
  );
}
