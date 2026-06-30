"use client";

import { useState, useEffect, useCallback } from "react";
import { Eye, EyeOff, ArrowUpRight, Lock, Zap, Wallet, Loader2 } from "lucide-react";
import { fmtNaira } from "@gomarket/shared-utils";
import { walletApi, type WalletResp } from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import { WithdrawModal, TransactionRow } from "./helpers";

export default function WalletPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [wallet, setWallet] = useState<WalletResp | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWallet = useCallback(() => {
    if (!accessToken) return;
    setLoading(true);
    walletApi
      .getBalance(accessToken)
      .then(setWallet)
      .catch(() => setWallet(null))
      .finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

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
        {/* ── Balance card ──────────────────────────────────── */}
        <div
          className="rounded-[16px] border overflow-hidden"
          style={{ background: "#fff", borderColor: "#e2e8f0" }}
        >
          <div className="px-6 py-5" style={{ background: "#0A2E1A" }}>
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
              {loading
                ? "—"
                : balanceVisible
                  ? fmtNaira(wallet?.balance_kobo ?? 0)
                  : "₦ • • • • •"}
            </p>
          </div>

          <div
            className="px-6 py-4 flex items-center gap-3 border-b"
            style={{ borderColor: "#f1f5f9" }}
          >
            <button
              type="button"
              onClick={() => setWithdrawOpen(true)}
              disabled={!wallet || wallet.balance_kobo <= 0}
              className="flex items-center gap-2 h-10 px-5 rounded-[10px] text-white text-[13px] font-bold transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ background: "#0A2E1A", boxShadow: "0 2px 8px rgba(26,122,66,0.25)" }}
            >
              <ArrowUpRight className="w-4 h-4" /> Withdraw
            </button>
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "#6b7280" }}>
              <Zap className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
              Simulated instant transfer via Paystack
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x" style={{ divideColor: "#f1f5f9" } as any}>
            {[
              { label: "Total earned", value: wallet?.total_earned_kobo ?? 0 },
              {
                label: "Withdrawn",
                value: (wallet?.total_earned_kobo ?? 0) - (wallet?.balance_kobo ?? 0),
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center py-4 border-r last:border-0"
                style={{ borderColor: "#f1f5f9" }}
              >
                <p className="text-[14px] font-extrabold" style={{ color: "#1C1C1C" }}>
                  {loading ? "—" : balanceVisible ? fmtNaira(s.value) : "• • •"}
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

        {/* ── Trust note ───────────────────────────────────── */}
        <div className="flex items-center gap-2 text-[10px] px-1" style={{ color: "#94a3b8" }}>
          <Lock className="w-3 h-3 shrink-0" />
          Withdrawals are simulated for testing — no real bank transfer is made.
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
              <p className="text-[15px] font-extrabold" style={{ color: "#1C1C1C" }}>
                Transaction history
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
                All wallet activity
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2" style={{ color: "#94a3b8" }}>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-[13px]">Loading transactions…</span>
            </div>
          ) : !wallet || wallet.transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Wallet className="w-8 h-8" style={{ color: "#d1fae5" }} />
              <p className="text-[13px] font-medium" style={{ color: "#6b7280" }}>
                No transactions yet
              </p>
              <p className="text-[11px]" style={{ color: "#94a3b8" }}>
                Your wallet credits automatically when customers pay for orders.
              </p>
            </div>
          ) : (
            wallet.transactions.map((txn) => (
              <TransactionRow key={txn.id} txn={txn} hidden={!balanceVisible} />
            ))
          )}
        </div>
      </div>

      {withdrawOpen && wallet && accessToken && (
        <WithdrawModal
          wallet={wallet}
          token={accessToken}
          onClose={() => setWithdrawOpen(false)}
          onSuccess={(updated) => setWallet(updated)}
        />
      )}
    </div>
  );
}
