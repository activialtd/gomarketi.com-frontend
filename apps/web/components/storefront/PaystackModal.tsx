"use client";

import { useState, useEffect } from "react";
import { X, CreditCard, Lock, Check, AlertCircle, Loader2 } from "lucide-react";

interface Props {
  amount: number; // kobo
  email: string;
  storeName: string;
  onSuccess: (ref: string) => void;
  onClose: () => void;
}

function fmt(kobo: number) {
  return "₦" + (kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 });
}

type Step = "card" | "processing" | "success" | "failed";

export function PaystackModal({ amount, email, storeName, onSuccess, onClose }: Props) {
  const [step, setStep] = useState<Step>("card");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [error, setError] = useState<string | null>(null);
  const [ref] = useState(() => "PSK_" + Math.random().toString(36).slice(2, 12).toUpperCase());

  // Format card number with spaces
  function handleCardNumber(v: string) {
    const cleaned = v.replace(/\D/g, "").slice(0, 16);
    const formatted = cleaned.replace(/(.{4})/g, "$1 ").trim();
    setCard((c) => ({ ...c, number: formatted }));
  }

  // Format expiry
  function handleExpiry(v: string) {
    const cleaned = v.replace(/\D/g, "").slice(0, 4);
    const formatted = cleaned.length > 2 ? cleaned.slice(0, 2) + "/" + cleaned.slice(2) : cleaned;
    setCard((c) => ({ ...c, expiry: formatted }));
  }

  function validate() {
    const digits = card.number.replace(/\s/g, "");
    if (digits.length < 16) return "Enter a 16-digit card number";
    if (card.expiry.length < 5) return "Enter a valid expiry date";
    if (card.cvv.length < 3) return "Enter your 3-digit CVV";
    if (!card.name.trim()) return "Enter the name on your card";
    // Simulate failure for cards starting with 0
    if (digits.startsWith("0")) return null; // will fail on payment
    return null;
  }

  function handlePay() {
    const err = validate();
    if (err) { setError(err); return; }

    const digits = card.number.replace(/\s/g, "");
    setError(null);
    setStep("processing");

    setTimeout(() => {
      if (digits.startsWith("0")) {
        setStep("failed");
      } else {
        setStep("success");
        setTimeout(() => onSuccess(ref), 1800);
      }
    }, 2200);
  }

  // Trap scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }}>
      {/* Backdrop */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.7)", backdropFilter: "blur(4px)" }}
        onClick={step === "card" ? onClose : undefined} />

      {/* Modal */}
      <div style={{
        position: "relative", width: "100%", maxWidth: "420px",
        background: "#fff", borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
      }}>

        {/* Paystack header */}
        <div style={{
          background: "linear-gradient(135deg, #011B33 0%, #0a2d52 100%)",
          padding: "24px 24px 20px",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        }}>
          <div>
            {/* Paystack logo mark */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div style={{
                width: "28px", height: "28px", background: "#00C3F7",
                borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "#011B33", fontWeight: 900, fontSize: "14px" }}>P</span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: "15px" }}>Paystack</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", marginBottom: "4px" }}>
              Pay {storeName}
            </p>
            <p style={{ color: "#fff", fontSize: "26px", fontWeight: 900, letterSpacing: "-0.5px" }}>
              {fmt(amount)}
            </p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginTop: "4px" }}>{email}</p>
          </div>
          {step === "card" && (
            <button onClick={onClose}
              style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer" }}>
              <X style={{ width: "16px", height: "16px", color: "rgba(255,255,255,0.7)" }} />
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>

          {/* CARD FORM */}
          {step === "card" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <CreditCard style={{ width: "16px", height: "16px", color: "#6b7280" }} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>Pay with card</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Card number */}
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px", letterSpacing: "0.05em" }}>
                    CARD NUMBER
                  </label>
                  <div style={{
                    display: "flex", alignItems: "center",
                    border: "1.5px solid #e2e8f0", borderRadius: "10px",
                    padding: "0 14px", height: "46px",
                    background: "#f8fafc",
                  }}>
                    <input
                      value={card.number}
                      onChange={(e) => handleCardNumber(e.target.value)}
                      placeholder="0000 0000 0000 0000"
                      style={{
                        flex: 1, border: "none", outline: "none", background: "transparent",
                        fontSize: "15px", fontFamily: "monospace", color: "#1C1C1C", letterSpacing: "0.05em",
                      }}
                    />
                    <CreditCard style={{ width: "18px", height: "18px", color: "#94a3b8", flexShrink: 0 }} />
                  </div>
                </div>

                {/* Expiry + CVV */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px", letterSpacing: "0.05em" }}>
                      EXPIRY DATE
                    </label>
                    <input
                      value={card.expiry}
                      onChange={(e) => handleExpiry(e.target.value)}
                      placeholder="MM/YY"
                      style={{
                        width: "100%", height: "46px", borderRadius: "10px",
                        border: "1.5px solid #e2e8f0", padding: "0 14px",
                        fontSize: "15px", fontFamily: "monospace", color: "#1C1C1C",
                        background: "#f8fafc", outline: "none", boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px", letterSpacing: "0.05em" }}>
                      CVV
                    </label>
                    <input
                      value={card.cvv}
                      onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                      placeholder="•••"
                      type="password"
                      style={{
                        width: "100%", height: "46px", borderRadius: "10px",
                        border: "1.5px solid #e2e8f0", padding: "0 14px",
                        fontSize: "18px", color: "#1C1C1C",
                        background: "#f8fafc", outline: "none", boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                {/* Card name */}
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px", letterSpacing: "0.05em" }}>
                    NAME ON CARD
                  </label>
                  <input
                    value={card.name}
                    onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                    placeholder="John Doe"
                    style={{
                      width: "100%", height: "46px", borderRadius: "10px",
                      border: "1.5px solid #e2e8f0", padding: "0 14px",
                      fontSize: "15px", color: "#1C1C1C",
                      background: "#f8fafc", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "14px", padding: "10px 14px", background: "#fef2f2", borderRadius: "8px" }}>
                  <AlertCircle style={{ width: "14px", height: "14px", color: "#ef4444", flexShrink: 0 }} />
                  <p style={{ fontSize: "12px", color: "#ef4444", fontWeight: 500 }}>{error}</p>
                </div>
              )}

              <button onClick={handlePay} style={{
                width: "100%", height: "50px", marginTop: "20px",
                background: "#00C3F7", color: "#011B33",
                border: "none", borderRadius: "12px",
                fontSize: "15px", fontWeight: 800, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}>
                <Lock style={{ width: "15px", height: "15px" }} />
                Pay {fmt(amount)}
              </button>

              <p style={{ fontSize: "10px", color: "#94a3b8", textAlign: "center", marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                <Lock style={{ width: "10px", height: "10px" }} />
                Secured by Paystack · 256-bit SSL
              </p>
            </>
          )}

          {/* PROCESSING */}
          {step === "processing" && (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <Loader2 style={{ width: "48px", height: "48px", color: "#00C3F7", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
              <p style={{ fontWeight: 700, fontSize: "16px", color: "#1C1C1C", marginBottom: "6px" }}>Processing payment…</p>
              <p style={{ fontSize: "13px", color: "#6b7280" }}>Please do not close this window</p>
            </div>
          )}

          {/* SUCCESS */}
          {step === "success" && (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <div style={{
                width: "72px", height: "72px", borderRadius: "50%",
                background: "#f0fdf4", border: "3px solid #22c55e",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
              }}>
                <Check style={{ width: "36px", height: "36px", color: "#22c55e" }} />
              </div>
              <p style={{ fontWeight: 900, fontSize: "20px", color: "#1C1C1C", marginBottom: "8px" }}>
                Payment successful!
              </p>
              <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
                {fmt(amount)} paid to {storeName}
              </p>
              <p style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "monospace" }}>Ref: {ref}</p>
            </div>
          )}

          {/* FAILED */}
          {step === "failed" && (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <div style={{
                width: "72px", height: "72px", borderRadius: "50%",
                background: "#fef2f2", border: "3px solid #ef4444",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
              }}>
                <AlertCircle style={{ width: "36px", height: "36px", color: "#ef4444" }} />
              </div>
              <p style={{ fontWeight: 900, fontSize: "20px", color: "#1C1C1C", marginBottom: "8px" }}>
                Payment failed
              </p>
              <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px" }}>
                Your card was declined. Please try a different card.
              </p>
              <button onClick={() => { setStep("card"); setCard({ number: "", expiry: "", cvv: "", name: "" }); }}
                style={{
                  padding: "12px 28px", borderRadius: "10px", border: "none",
                  background: "#011B33", color: "#fff",
                  fontSize: "14px", fontWeight: 700, cursor: "pointer",
                }}>
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
