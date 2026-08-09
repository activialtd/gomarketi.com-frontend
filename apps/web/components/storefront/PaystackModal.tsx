"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  amount: number; // kobo
  email: string;
  storeName: string;
  onSuccess: (ref: string) => void;
  onClose: () => void;
}

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";
const PAYSTACK_SCRIPT_SRC = "https://js.paystack.co/v1/inline.js";

declare global {
  interface Window {
    PaystackPop?: {
      setup(config: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }): { openIframe(): void };
    };
  }
}

function loadPaystackScript(): Promise<void> {
  if (window.PaystackPop) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${PAYSTACK_SCRIPT_SRC}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Paystack")));
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = PAYSTACK_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack"));
    document.body.appendChild(script);
  });
}

// Real Paystack Inline checkout. Only the PUBLIC key lives here — the
// backend verifies the resulting reference server-side with the SECRET key
// (services/orders/internal/service/paystack.go) before ever creating an
// order, so a client-reported "success" alone is never trusted. Paystack's
// own iframe (opened by openIframe()) handles all card entry — this
// component never sees card details, matching the mobile app's
// PaystackSheet.tsx pattern.
export function PaystackModal({ amount, email, storeName, onSuccess, onClose }: Props) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // No "has run once" ref here on purpose: React Strict Mode's dev-only
    // mount->cleanup->mount double-invoke means the FIRST invocation would
    // claim such a guard and then get cancelled, leaving the SURVIVING
    // second invocation seeing the guard already set and skipping entirely
    // — Paystack would never open. The `cancelled` flag below already does
    // the right thing: the first invocation's in-flight load is cancelled
    // by its own cleanup, and the second invocation runs to completion.
    if (!PAYSTACK_PUBLIC_KEY) {
      setError("Payments aren't configured for this store yet. Please contact the store owner.");
      return;
    }

    let cancelled = false;
    loadPaystackScript()
      .then(() => {
        if (cancelled || !window.PaystackPop) return;
        const ref = `GMK_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        window.PaystackPop.setup({
          key: PAYSTACK_PUBLIC_KEY,
          email,
          amount,
          currency: "NGN",
          ref,
          callback: (response) => onSuccess(response.reference),
          onClose: () => onClose(),
        }).openIframe();
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load the payment provider. Please check your connection and try again.");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Paystack's own iframe covers the screen once it opens — this is only
  // visible briefly while the script loads, or if setup fails outright.
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "rgba(15,23,42,0.5)",
      }}
      onClick={error ? onClose : undefined}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "32px",
          textAlign: "center",
          maxWidth: "360px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {error ? (
          <>
            <p style={{ fontWeight: 700, fontSize: "15px", color: "#1C1C1C", marginBottom: "8px" }}>
              Payment unavailable
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px" }}>{error}</p>
            <button
              onClick={onClose}
              style={{
                padding: "10px 24px",
                borderRadius: "10px",
                border: "none",
                background: "#011B33",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </>
        ) : (
          <>
            <Loader2
              style={{ width: "36px", height: "36px", color: "#00C3F7", margin: "0 auto 14px", animation: "spin 1s linear infinite" }}
            />
            <p style={{ fontSize: "13px", color: "#6b7280" }}>Opening secure payment for {storeName}…</p>
          </>
        )}
      </div>
    </div>
  );
}
