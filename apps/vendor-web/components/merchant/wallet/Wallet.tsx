"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  Plus,
  ArrowUpRight,
  Building2,
  Trash2,
  Lock,
  Clock,
  Zap,
  Wallet,
} from "lucide-react";
import { BankAccount } from "@gomarket/shared-types";
import { fmtNaira } from "@gomarket/shared-utils";
import {
  SAVED_ACCOUNTS,
  TRANSACTIONS,
  AddBankModal,
  WithdrawModal,
  BALANCE,
  LIFETIME_WITHDRAWN,
  PENDING_SETTLEMENT,
  TOTAL_EARNED,
  TXN_CFG,
} from "./helpers";

export default function WalletPage() {
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [addBankOpen, setAddBankOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [accounts, setAccounts] = useState<BankAccount[]>(SAVED_ACCOUNTS);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  function copyRef(ref: string) {
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 1800);
  }

  function setDefault(id: string) {
    setAccounts((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  }

  function removeAccount(id: string) {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div
        className="px-6 lg:px-8 py-4 border-b flex flex-wrap items-center justify-between gap-3"
        style={{ background: "#fff", borderColor: "#e2e8f0" }}
      >
        <div className="flex items-center gap-2.5">
          <h1
            className="text-[20px] font-extrabold"
            style={{ color: "#1C1C1C", letterSpacing: "-0.3px" }}
          >
            GoMarket Wallet
          </h1>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{ background: "#F0FAF3", color: "#1A7A42" }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full bg-green-500"
              style={{ animation: "pulse 2s infinite" }}
            />
            Powered by Paystack
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-5 space-y-5">
        {/* ── Top: Balance card + earning summary ─────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main balance card */}
          <div
            className="lg:col-span-2 rounded-[16px] border overflow-hidden"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            {/* Green header stripe */}
            <div className="px-6 py-5" style={{ background: "#1A7A42" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-white opacity-80" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white opacity-70">
                    Available Balance
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setBalanceVisible((v) => !v)}
                  className="p-1.5 rounded-[6px] transition-colors"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  {balanceVisible ? (
                    <Eye className="w-4 h-4 text-white" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
              <p
                className="text-[36px] font-extrabold text-white leading-none"
                style={{ letterSpacing: "-1px" }}
              >
                {balanceVisible ? fmtNaira(BALANCE) : "₦ • • • • •"}
              </p>
              <p className="text-[12px] mt-2 text-white opacity-60">
                Pending settlement:{" "}
                {balanceVisible ? fmtNaira(PENDING_SETTLEMENT) : "• • •"}
              </p>
            </div>

            {/* Action row */}
            <div
              className="px-6 py-4 flex items-center gap-3 border-b"
              style={{ borderColor: "#f1f5f9" }}
            >
              <button
                type="button"
                onClick={() => setWithdrawOpen(true)}
                className="flex items-center gap-2 h-10 px-5 rounded-[10px] text-white text-[13px] font-bold transition-all active:scale-[0.98]"
                style={{
                  background: "#1A7A42",
                  boxShadow: "0 2px 8px rgba(26,122,66,0.25)",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#239452")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "#1A7A42")
                }
              >
                <ArrowUpRight className="w-4 h-4" /> Withdraw
              </button>
              <div
                className="flex items-center gap-1.5 text-[11px]"
                style={{ color: "#6b7280" }}
              >
                <Zap className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
                Instant to Paystack-Titan · 1–2 days to other banks
              </div>
            </div>

            {/* Stats row */}
            <div
              className="grid grid-cols-3 divide-x"
              style={{ divideColor: "#f1f5f9" } as any}
            >
              {[
                { label: "Total earned", value: fmtNaira(TOTAL_EARNED) },
                { label: "Withdrawn", value: fmtNaira(LIFETIME_WITHDRAWN) },
                { label: "Fee paid", value: fmtNaira(141750) },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center py-4 border-r last:border-0"
                  style={{ borderColor: "#f1f5f9" }}
                >
                  <p
                    className="text-[14px] font-extrabold"
                    style={{ color: "#1C1C1C" }}
                  >
                    {balanceVisible ? s.value : "• • •"}
                  </p>
                  <p
                    className="text-[9px] font-semibold uppercase tracking-wide mt-0.5"
                    style={{ color: "#94a3b8" }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Withdrawal accounts */}
          <div
            className="rounded-[16px] border p-4 flex flex-col gap-3"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <div className="flex items-center justify-between">
              <p
                className="text-[13px] font-extrabold"
                style={{ color: "#1C1C1C" }}
              >
                Withdrawal accounts
              </p>
              <button
                type="button"
                onClick={() => setAddBankOpen(true)}
                className="flex items-center gap-1 h-7 px-2.5 rounded-[7px] text-[11px] font-bold transition-all"
                style={{ background: "#F0FAF3", color: "#1A7A42" }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#dcfce7")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "#F0FAF3")
                }
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>

            <div className="space-y-2 flex-1">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center gap-2.5 p-3 rounded-[10px] border"
                  style={{
                    borderColor: acc.isDefault
                      ? "rgba(26,122,66,0.25)"
                      : "#f1f5f9",
                    background: acc.isDefault
                      ? "rgba(26,122,66,0.03)"
                      : "#fafafa",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-[7px] flex items-center justify-center shrink-0"
                    style={{
                      background: acc.isDefault ? "#F0FAF3" : "#f1f5f9",
                    }}
                  >
                    <Building2
                      className="w-4 h-4"
                      style={{ color: acc.isDefault ? "#1A7A42" : "#94a3b8" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[12px] font-semibold truncate"
                      style={{ color: "#1C1C1C" }}
                    >
                      {acc.bankName}
                    </p>
                    <p
                      className="text-[10px] font-mono"
                      style={{ color: "#6b7280" }}
                    >
                      •••• {acc.accountNumber.slice(-4)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {acc.isDefault ? (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "#F0FAF3", color: "#1A7A42" }}
                      >
                        Default
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDefault(acc.id)}
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border transition-colors"
                        style={{ borderColor: "#e2e8f0", color: "#6b7280" }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.borderColor = "#1A7A42";
                          e.currentTarget.style.color = "#1A7A42";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.color = "#6b7280";
                        }}
                      >
                        Set default
                      </button>
                    )}
                    {!acc.isDefault && (
                      <button
                        type="button"
                        onClick={() => removeAccount(acc.id)}
                        className="w-5 h-5 rounded flex items-center justify-center hover:bg-red-50 transition-colors"
                      >
                        <Trash2
                          className="w-3 h-3"
                          style={{ color: "#dc2626" }}
                        />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Trust note */}
            <div
              className="flex items-center gap-2 text-[10px]"
              style={{ color: "#94a3b8" }}
            >
              <Lock className="w-3 h-3 shrink-0" />
              Secured by Paystack. Transfers encrypted end-to-end.
            </div>
          </div>
        </div>

        {/* ── Transaction history ──────────────────────────── */}
        <div
          className="rounded-[14px] border overflow-hidden"
          style={{ background: "#fff", borderColor: "#e2e8f0" }}
        >
          <div
            className="px-5 py-4 border-b flex items-center justify-between"
            style={{ borderColor: "#f1f5f9" }}
          >
            <div>
              <p
                className="text-[15px] font-extrabold"
                style={{ color: "#1C1C1C" }}
              >
                Transaction history
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
                All wallet activity
              </p>
            </div>
          </div>

          {TRANSACTIONS.map((txn) => {
            const cfg = TXN_CFG[txn.type];
            const isCredit = txn.type === "credit";
            return (
              <div
                key={txn.id}
                className="flex items-center gap-3 px-5 py-3.5 border-b last:border-0 transition-colors hover:bg-[#fafafa]"
                style={{ borderColor: "#f9fafb" }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: cfg.bg }}
                >
                  <cfg.icon className="w-4 h-4" style={{ color: cfg.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-[13px] font-semibold truncate"
                    style={{ color: "#1C1C1C" }}
                  >
                    {txn.description}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-[10px] font-mono"
                      style={{ color: "#94a3b8" }}
                    >
                      {txn.ref}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyRef(txn.ref)}
                      className="transition-colors"
                    >
                      {copiedRef === txn.ref ? (
                        <Check
                          className="w-3 h-3"
                          style={{ color: "#1A7A42" }}
                        />
                      ) : (
                        <Copy
                          className="w-3 h-3"
                          style={{ color: "#d1d5db" }}
                        />
                      )}
                    </button>
                    {txn.status === "pending" && (
                      <span
                        className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "#fef3c7", color: "#92400e" }}
                      >
                        <Clock className="w-2 h-2" /> Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className="text-[13px] font-bold tabular-nums"
                    style={{
                      color: isCredit
                        ? "#15803d"
                        : txn.type === "reversal"
                          ? "#dc2626"
                          : "#1C1C1C",
                    }}
                  >
                    {isCredit ? "+" : "–"}
                    {balanceVisible
                      ? fmtNaira(Math.abs(txn.amount)).replace("₦", "₦")
                      : "•••"}
                  </p>
                  <p className="text-[10px]" style={{ color: "#94a3b8" }}>
                    {new Date(txn.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {addBankOpen && (
        <AddBankModal
          onClose={() => setAddBankOpen(false)}
          onAdd={(acc) => setAccounts((prev) => [...prev, acc])}
        />
      )}
      {withdrawOpen && (
        <WithdrawModal
          balance={BALANCE}
          accounts={accounts}
          onClose={() => setWithdrawOpen(false)}
        />
      )}
    </div>
  );
}
