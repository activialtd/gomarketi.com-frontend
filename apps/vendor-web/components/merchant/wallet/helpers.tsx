import { useState } from "react";
import { X, CheckCircle2, ArrowDownLeft, ArrowUpRight, AlertCircle, Loader2 } from "lucide-react";
import { fmtNaira } from "@gomarket/shared-utils";
import { walletApi, type WalletResp, type WalletTransactionResp } from "@gomarket/api-client";

export const NIGERIAN_BANKS = [
  "Access Bank",
  "Zenith Bank",
  "Guaranty Trust Bank (GTBank)",
  "First Bank of Nigeria",
  "United Bank for Africa (UBA)",
  "Fidelity Bank",
  "Union Bank",
  "Stanbic IBTC Bank",
  "Sterling Bank",
  "Wema Bank",
  "Polaris Bank",
  "Ecobank Nigeria",
  "Kuda Bank",
  "Opay",
  "PalmPay",
];

export const TXN_CFG: Record<
  "credit" | "debit",
  { icon: React.ElementType; bg: string; color: string }
> = {
  credit: { icon: ArrowDownLeft, bg: "#dcfce7", color: "#15803d" },
  debit: { icon: ArrowUpRight, bg: "#fee2e2", color: "#dc2626" },
};

export function WithdrawModal({
  wallet,
  token,
  onClose,
  onSuccess,
}: {
  wallet: WalletResp;
  token: string;
  onClose: () => void;
  onSuccess: (updated: WalletResp) => void;
}) {
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const amountKobo = Math.round(parseFloat(amount.replace(/,/g, "")) * 100) || 0;

  const canSubmit =
    amountKobo >= 10000 &&
    amountKobo <= wallet.balance_kobo &&
    bankName.trim() !== "" &&
    accountNumber.trim().length === 10 &&
    accountName.trim() !== "";

  async function handleWithdraw() {
    if (!canSubmit) return;
    setProcessing(true);
    setError("");
    try {
      const updated = await walletApi.withdraw(
        { amount_kobo: amountKobo, bank_name: bankName, account_number: accountNumber, account_name: accountName },
        token,
      );
      setDone(true);
      onSuccess(updated);
      setTimeout(onClose, 1800);
    } catch {
      setError("Withdrawal failed. Please check the details and try again.");
    } finally {
      setProcessing(false);
    }
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
          <p className="text-[14px] font-extrabold" style={{ color: "#1C1C1C" }}>
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
            <p className="text-[15px] font-extrabold" style={{ color: "#1C1C1C" }}>
              Withdrawal sent!
            </p>
            <p className="text-[12px] text-center" style={{ color: "#6b7280" }}>
              {fmtNaira(amountKobo)} is on its way to {bankName} •••• {accountNumber.slice(-4)}.
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div
              className="flex items-center justify-between px-4 py-3 rounded-[10px]"
              style={{ background: "#F0FAF3", border: "1px solid rgba(26,122,66,0.15)" }}
            >
              <span className="text-[12px] font-medium" style={{ color: "#3D6B4F" }}>
                Available balance
              </span>
              <span className="text-[14px] font-extrabold" style={{ color: "#1A7A42" }}>
                {fmtNaira(wallet.balance_kobo)}
              </span>
            </div>

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
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                  placeholder="0.00"
                  className="w-full h-[46px] pl-8 pr-3.5 rounded-[10px] border text-[16px] font-bold outline-none transition-all"
                  style={{ borderColor: "#e2e8f0", background: "#fafafa", color: "#1C1C1C" }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                className="text-[10px] font-extrabold uppercase block"
                style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}
              >
                Bank
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full h-[44px] px-3.5 rounded-[10px] border text-[13px] outline-none transition-all"
                style={{ borderColor: "#e2e8f0", background: "#fafafa", color: "#1C1C1C" }}
              >
                <option value="">Select bank</option>
                {NIGERIAN_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                className="text-[10px] font-extrabold uppercase block"
                style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}
              >
                Account number
              </label>
              <input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                placeholder="0123456789"
                className="w-full h-[44px] px-3.5 rounded-[10px] border text-[13px] font-mono outline-none transition-all"
                style={{ borderColor: "#e2e8f0", background: "#fafafa", color: "#1C1C1C" }}
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="text-[10px] font-extrabold uppercase block"
                style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}
              >
                Account name
              </label>
              <input
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="As it appears on the account"
                className="w-full h-[44px] px-3.5 rounded-[10px] border text-[13px] outline-none transition-all"
                style={{ borderColor: "#e2e8f0", background: "#fafafa", color: "#1C1C1C" }}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-[11px]" style={{ color: "#dc2626" }}>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleWithdraw}
              disabled={!canSubmit || processing}
              className="w-full h-11 rounded-[10px] text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ background: "#0A2E1A", boxShadow: "0 2px 8px rgba(26,122,66,0.25)" }}
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
              {processing ? "Processing…" : "Withdraw"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function TransactionRow({
  txn,
  hidden,
}: {
  txn: WalletTransactionResp;
  hidden: boolean;
}) {
  const cfg = TXN_CFG[txn.type];
  const isCredit = txn.type === "credit";
  return (
    <div
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
        <p className="text-[13px] font-semibold truncate" style={{ color: "#1C1C1C" }}>
          {txn.description}
        </p>
        {txn.reference && (
          <span className="text-[10px] font-mono" style={{ color: "#94a3b8" }}>
            {txn.reference}
          </span>
        )}
      </div>

      <div className="text-right shrink-0">
        <p
          className="text-[13px] font-bold tabular-nums"
          style={{ color: isCredit ? "#15803d" : "#1C1C1C" }}
        >
          {isCredit ? "+" : "–"}
          {hidden ? "•••" : fmtNaira(txn.amount_kobo)}
        </p>
        <p className="text-[10px]" style={{ color: "#94a3b8" }}>
          {new Date(txn.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
        </p>
      </div>
    </div>
  );
}
