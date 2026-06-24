import { BankAccount } from "@gomarket/shared-types";
import { BANKS, fmtNaira } from "@gomarket/shared-utils";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Check,
} from "lucide-react";
import { useState } from "react";

type Transaction = {
  id: string;
  type: "credit" | "debit" | "withdrawal" | "reversal";
  description: string;
  amount: number; // kobo
  balanceAfter: number;
  status: "completed" | "pending" | "failed";
  ref: string;
  createdAt: string;
};

export const BALANCE = 24850000; // kobo
export const PENDING_SETTLEMENT = 1830000;
export const TOTAL_EARNED = 10575000;
export const LIFETIME_WITHDRAWN = 8120000;

export const SAVED_ACCOUNTS: BankAccount[] = [
  {
    id: "acc-1",
    bankName: "Paystack-Titan",
    bankCode: "titanpsb",
    accountNumber: "9740176746",
    accountName: "GOMARKET / AKACHI EZEKIEL",
    isDefault: true,
    verifiedAt: "2026-01-12T10:00:00Z",
  },
  {
    id: "acc-2",
    bankName: "Zenith Bank",
    bankCode: "057",
    accountNumber: "2012345678",
    accountName: "AKACHI EZEKIEL",
    isDefault: false,
    verifiedAt: "2026-03-05T14:00:00Z",
  },
];

export const TRANSACTIONS: Transaction[] = [
  {
    id: "txn-1",
    type: "credit",
    description: "Order #ORD-4821 — Adaeze Okonkwo",
    amount: 2650000,
    balanceAfter: 24850000,
    status: "completed",
    ref: "PSK_ref_abc123",
    createdAt: "2026-06-06T14:22:00Z",
  },
  {
    id: "txn-2",
    type: "credit",
    description: "Order #ORD-4818 — Chukwuemeka Eze",
    amount: 10500000,
    balanceAfter: 22200000,
    status: "completed",
    ref: "TRF_9928811",
    createdAt: "2026-06-06T10:00:00Z",
  },
  {
    id: "txn-3",
    type: "withdrawal",
    description: "Payout to Zenith Bank ••••5678",
    amount: -5000000,
    balanceAfter: 11700000,
    status: "completed",
    ref: "WDR_0012345",
    createdAt: "2026-06-05T09:00:00Z",
  },
  {
    id: "txn-4",
    type: "credit",
    description: "Order #ORD-4819 — Fatima Al-Hassan",
    amount: 2670000,
    balanceAfter: 16700000,
    status: "completed",
    ref: "PSK_ref_def456",
    createdAt: "2026-06-05T07:05:00Z",
  },
  {
    id: "txn-5",
    type: "debit",
    description: "GoMarket service fee (1.5%)",
    amount: -141750,
    balanceAfter: 14030000,
    status: "completed",
    ref: "FEE_0088221",
    createdAt: "2026-06-04T23:59:00Z",
  },
  {
    id: "txn-6",
    type: "reversal",
    description: "Refund — Order #ORD-4817 (Ngozi A.)",
    amount: -2000000,
    balanceAfter: 14171750,
    status: "completed",
    ref: "REV_0099112",
    createdAt: "2026-06-04T16:30:00Z",
  },
  {
    id: "txn-7",
    type: "credit",
    description: "Order #ORD-4820 — Emeka Nwosu",
    amount: 8800000,
    balanceAfter: 16171750,
    status: "pending",
    ref: "TRF_9928812",
    createdAt: "2026-06-06T08:45:00Z",
  },
  {
    id: "txn-8",
    type: "withdrawal",
    description: "Payout to Zenith Bank ••••5678",
    amount: -3120000,
    balanceAfter: 7371750,
    status: "completed",
    ref: "WDR_0012289",
    createdAt: "2026-06-03T11:00:00Z",
  },
];

export const TXN_CFG = {
  credit: { icon: ArrowDownLeft, bg: "#dcfce7", color: "#15803d", sign: "+" },
  debit: { icon: ArrowUpRight, bg: "#fee2e2", color: "#dc2626", sign: "–" },
  withdrawal: { icon: Building2, bg: "#fef3c7", color: "#92400e", sign: "–" },
  reversal: { icon: ArrowUpRight, bg: "#f1f5f9", color: "#374151", sign: "–" },
} as const;

export function AddBankModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (acc: BankAccount) => void;
}) {
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState<{ name: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function resolveAccount() {
    if (accountNumber.length !== 10 || !bankCode) return;
    setResolving(true);
    setError("");
    await new Promise((r) => setTimeout(r, 900));
    setResolving(false);
    // Simulate Paystack account resolution
    setResolved({ name: "AKACHI NWACHUKWU EZEKIEL" });
  }

  async function handleAdd() {
    if (!resolved || !bankCode) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    const bank = BANKS.find((b) => b.code === bankCode)!;
    onAdd({
      id: `acc-${Date.now()}`,
      bankName: bank.name,
      bankCode,
      accountNumber,
      accountName: resolved.name,
      isDefault: false,
      verifiedAt: new Date().toISOString(),
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[16px] border shadow-xl overflow-hidden"
        style={{ background: "#fff", borderColor: "#e2e8f0" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: "#f1f5f9" }}
        >
          <div>
            <p
              className="text-[14px] font-extrabold"
              style={{ color: "#1C1C1C" }}
            >
              Add bank account
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "#6b7280" }}>
              Verified via Paystack
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#f1f5f9] transition-colors"
          >
            <X className="w-4 h-4" style={{ color: "#94a3b8" }} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Bank selector */}
          <div className="space-y-1.5">
            <label
              className="text-[10px] font-extrabold uppercase block"
              style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}
            >
              Bank name
            </label>
            <select
              value={bankCode}
              onChange={(e) => {
                setBankCode(e.target.value);
                setResolved(null);
              }}
              className="w-full h-[42px] px-3.5 rounded-[10px] border text-[13px] outline-none appearance-none transition-all"
              style={{
                borderColor: "#e2e8f0",
                background: "#F0FAF3",
                color: bankCode ? "#1C1C1C" : "#6b7280",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#1A7A42";
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.outline = "2px solid #1A7A42";
                e.currentTarget.style.outlineOffset = "-2px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.background = "#F0FAF3";
                e.currentTarget.style.outline = "none";
              }}
            >
              <option value="">Select a bank…</option>
              {BANKS.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account number */}
          <div className="space-y-1.5">
            <label
              className="text-[10px] font-extrabold uppercase block"
              style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}
            >
              Account number
            </label>
            <div className="flex gap-2">
              <input
                value={accountNumber}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setAccountNumber(v);
                  setResolved(null);
                }}
                placeholder="10-digit account number"
                className="flex-1 h-[42px] px-3.5 rounded-[10px] border text-[13px] font-mono outline-none transition-all"
                style={{
                  borderColor: "#e2e8f0",
                  background: "#F0FAF3",
                  color: "#1C1C1C",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#1A7A42";
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.outline = "2px solid #1A7A42";
                  e.currentTarget.style.outlineOffset = "-2px";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.background = "#F0FAF3";
                  e.currentTarget.style.outline = "none";
                }}
              />
              <button
                type="button"
                onClick={resolveAccount}
                disabled={accountNumber.length !== 10 || !bankCode || resolving}
                className="flex items-center gap-1.5 h-[42px] px-3.5 rounded-[10px] border text-[12px] font-semibold transition-all disabled:opacity-40"
                style={{
                  borderColor: "#1A7A42",
                  background: "#F0FAF3",
                  color: "#1A7A42",
                }}
              >
                {resolving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "Verify"
                )}
              </button>
            </div>
          </div>

          {/* Resolved name */}
          {resolved && (
            <div
              className="flex items-center gap-2.5 px-3.5 py-3 rounded-[10px] animate-in fade-in duration-200"
              style={{
                background: "#F0FAF3",
                border: "1px solid rgba(26,122,66,0.2)",
              }}
            >
              <CheckCircle2
                className="w-4 h-4 shrink-0"
                style={{ color: "#1A7A42" }}
              />
              <div>
                <p
                  className="text-[12px] font-bold"
                  style={{ color: "#1A7A42" }}
                >
                  {resolved.name}
                </p>
                <p className="text-[10px]" style={{ color: "#3D6B4F" }}>
                  Account verified via Paystack
                </p>
              </div>
            </div>
          )}

          {error && (
            <div
              className="flex items-center gap-2 text-[12px]"
              style={{ color: "#dc2626" }}
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}

          {/* Trust note */}
          <div
            className="flex items-start gap-2 text-[11px] leading-relaxed"
            style={{ color: "#6b7280" }}
          >
            <Shield
              className="w-3.5 h-3.5 shrink-0 mt-0.5"
              style={{ color: "#94a3b8" }}
            />
            Your account details are encrypted and verified through Paystack's
            secure infrastructure. GoMarket never stores raw credentials.
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-[10px] border text-[13px] font-semibold"
              style={{ borderColor: "#e2e8f0", color: "#374151" }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#F0FAF3")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!resolved || saving}
              className="flex-1 h-10 rounded-[10px] text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{
                background: "#1A7A42",
                boxShadow: "0 2px 8px rgba(26,122,66,0.25)",
              }}
              onMouseOver={(e) =>
                !saving &&
                !!resolved &&
                (e.currentTarget.style.background = "#239452")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#1A7A42")}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" /> Add account
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Withdraw modal ───────────────────────────────────────────────────────────

export function WithdrawModal({
  balance,
  accounts,
  onClose,
}: {
  balance: number;
  accounts: BankAccount[];
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id ?? "",
  );
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const amountKobo = parseFloat(amount.replace(/,/g, "")) * 100 || 0;
  const fee = Math.min(amountKobo * 0.015, 200000); // Paystack 1.5%, capped at ₦2000
  const netAmount = amountKobo - fee;

  async function handleWithdraw() {
    if (amountKobo <= 0 || amountKobo > balance || !accountId) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setProcessing(false);
    setDone(true);
    setTimeout(onClose, 1800);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[16px] border shadow-xl overflow-hidden"
        style={{ background: "#fff", borderColor: "#e2e8f0" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: "#f1f5f9" }}
        >
          <p
            className="text-[14px] font-extrabold"
            style={{ color: "#1C1C1C" }}
          >
            Withdraw funds
          </p>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#f1f5f9]"
          >
            <X className="w-4 h-4" style={{ color: "#94a3b8" }} />
          </button>
        </div>

        {done ? (
          <div className="px-5 py-10 flex flex-col items-center gap-3">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "#F0FAF3" }}
            >
              <CheckCircle2 className="w-7 h-7" style={{ color: "#1A7A42" }} />
            </div>
            <p
              className="text-[15px] font-extrabold"
              style={{ color: "#1C1C1C" }}
            >
              Withdrawal initiated!
            </p>
            <p className="text-[12px] text-center" style={{ color: "#6b7280" }}>
              {fmtNaira(netAmount)} will arrive in your account within 1–2
              business days.
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Available */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-[10px]"
              style={{
                background: "#F0FAF3",
                border: "1px solid rgba(26,122,66,0.15)",
              }}
            >
              <span
                className="text-[12px] font-medium"
                style={{ color: "#3D6B4F" }}
              >
                Available balance
              </span>
              <span
                className="text-[14px] font-extrabold"
                style={{ color: "#1A7A42" }}
              >
                {fmtNaira(balance)}
              </span>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label
                className="text-[10px] font-extrabold uppercase block"
                style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}
              >
                Amount (₦)
              </label>
              <div className="relative">
                <span
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[16px] font-bold"
                  style={{ color: "#3D6B4F" }}
                >
                  ₦
                </span>
                <input
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value.replace(/[^0-9.]/g, ""))
                  }
                  placeholder="0.00"
                  className="w-full h-[48px] pl-8 pr-3.5 rounded-[10px] border text-[18px] font-bold font-mono outline-none transition-all"
                  style={{
                    borderColor: "#e2e8f0",
                    background: "#F0FAF3",
                    color: "#1C1C1C",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#1A7A42";
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.outline = "2px solid #1A7A42";
                    e.currentTarget.style.outlineOffset = "-2px";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.background = "#F0FAF3";
                    e.currentTarget.style.outline = "none";
                  }}
                />
              </div>
              <div className="flex gap-2">
                {[25, 50, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() =>
                      setAmount(
                        String((((balance / 100) * pct) / 100).toFixed(2)),
                      )
                    }
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors"
                    style={{
                      borderColor: "#e2e8f0",
                      background: "#fafafa",
                      color: "#374151",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = "#1A7A42";
                      e.currentTarget.style.color = "#1A7A42";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.color = "#374151";
                    }}
                  >
                    {pct}%
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAmount(String((balance / 100).toFixed(2)))}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors"
                  style={{
                    borderColor: "#e2e8f0",
                    background: "#fafafa",
                    color: "#374151",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "#1A7A42";
                    e.currentTarget.style.color = "#1A7A42";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.color = "#374151";
                  }}
                >
                  Max
                </button>
              </div>
            </div>

            {/* Destination */}
            <div className="space-y-1.5">
              <label
                className="text-[10px] font-extrabold uppercase block"
                style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}
              >
                Send to
              </label>
              <div className="space-y-1.5">
                {accounts.map((acc) => (
                  <label
                    key={acc.id}
                    className="flex items-center gap-3 p-3 rounded-[10px] border cursor-pointer transition-all"
                    style={{
                      borderColor: accountId === acc.id ? "#1A7A42" : "#e2e8f0",
                      background:
                        accountId === acc.id
                          ? "rgba(26,122,66,0.04)"
                          : "#fafafa",
                    }}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      checked={accountId === acc.id}
                      onChange={() => setAccountId(acc.id)}
                    />
                    <div
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                      style={{
                        borderColor:
                          accountId === acc.id ? "#1A7A42" : "#d1d5db",
                        background:
                          accountId === acc.id ? "#1A7A42" : "transparent",
                      }}
                    >
                      {accountId === acc.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[12px] font-semibold"
                        style={{ color: "#1C1C1C" }}
                      >
                        {acc.bankName}
                      </p>
                      <p className="text-[11px]" style={{ color: "#6b7280" }}>
                        {acc.accountNumber} · {acc.accountName}
                      </p>
                    </div>
                    {acc.isDefault && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: "#F0FAF3", color: "#1A7A42" }}
                      >
                        Default
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Fee breakdown */}
            {amountKobo > 0 && (
              <div
                className="rounded-[10px] p-3.5 space-y-1.5 text-[12px]"
                style={{ background: "#fafafa", border: "1px solid #f1f5f9" }}
              >
                <div
                  className="flex justify-between"
                  style={{ color: "#6b7280" }}
                >
                  <span>Withdrawal amount</span>
                  <span className="font-medium">{fmtNaira(amountKobo)}</span>
                </div>
                <div
                  className="flex justify-between"
                  style={{ color: "#6b7280" }}
                >
                  <span>Processing fee (1.5%)</span>
                  <span className="font-medium" style={{ color: "#dc2626" }}>
                    –{fmtNaira(fee)}
                  </span>
                </div>
                <div
                  className="flex justify-between pt-1 border-t font-bold"
                  style={{ borderColor: "#e2e8f0", color: "#1C1C1C" }}
                >
                  <span>You'll receive</span>
                  <span style={{ color: "#1A7A42" }}>
                    {fmtNaira(netAmount)}
                  </span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleWithdraw}
              disabled={
                processing ||
                amountKobo <= 0 ||
                amountKobo > balance ||
                !accountId
              }
              className="w-full flex items-center justify-center gap-2 h-11 rounded-[10px] text-white text-[13px] font-bold transition-all active:scale-[0.98] disabled:opacity-50"
              style={{
                background: "#0a2e1a",
                boxShadow: "0 4px 14px rgba(26,122,66,0.25)",
              }}
              onMouseOver={(e) =>
                !processing && (e.currentTarget.style.background = "#239452")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#0a2e1a")}
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" /> Withdraw now
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
