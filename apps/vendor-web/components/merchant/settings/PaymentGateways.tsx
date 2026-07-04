"use client";

import { useState } from "react";
import { Loader2, CreditCard, Smartphone, Banknote, Info, CheckCircle2, Wifi, WifiOff } from "lucide-react";
import { paymentGatewaysApi, type PaymentGatewayResp } from "@gomarket/api-client";
import { usePaymentGateways, invalidate } from "@/lib/swr/hooks";
import { useAuthStore } from "@/store/useAuthStore";

function tok() { return useAuthStore.getState().accessToken ?? ""; }

const GATEWAY_INFO: Record<string, {
  label: string;
  logo: string;
  desc: string;
  icon: React.ReactNode;
  category: "online" | "offline";
  configFields?: Array<{ key: string; label: string; placeholder: string; type?: string }>;
}> = {
  paystack: {
    label: "Paystack",
    logo: "🟢",
    desc: "Accept cards, bank transfers, USSD & mobile money. Most popular in Nigeria.",
    icon: <CreditCard className="w-5 h-5" />,
    category: "online",
    configFields: [
      { key: "public_key", label: "Public Key", placeholder: "pk_live_..." },
    ],
  },
  flutterwave: {
    label: "Flutterwave",
    logo: "🌊",
    desc: "Pan-African payments — cards, bank transfers, mobile money across Africa.",
    icon: <CreditCard className="w-5 h-5" />,
    category: "online",
    configFields: [
      { key: "public_key", label: "Public Key", placeholder: "FLWPUBK_TEST-..." },
    ],
  },
  stripe: {
    label: "Stripe",
    logo: "💳",
    desc: "International card payments. Best for customers outside Nigeria.",
    icon: <CreditCard className="w-5 h-5" />,
    category: "online",
    configFields: [
      { key: "public_key", label: "Publishable Key", placeholder: "pk_live_..." },
    ],
  },
  pos: {
    label: "POS Terminal",
    logo: "🖥️",
    desc: "Customers pay via a physical POS machine and enter their transaction ID at checkout.",
    icon: <Smartphone className="w-5 h-5" />,
    category: "offline",
    configFields: [
      { key: "instructions", label: "Checkout instructions (optional)", placeholder: "e.g. Use our POS terminal to pay. Enter the 12-digit transaction ID to confirm your order." },
    ],
  },
  manual: {
    label: "Bank Transfer",
    logo: "🏦",
    desc: "Customers transfer to your bank account and enter their reference at checkout.",
    icon: <Banknote className="w-5 h-5" />,
    category: "offline",
    configFields: [
      { key: "bank_name",      label: "Bank name",      placeholder: "e.g. GTBank" },
      { key: "account_number", label: "Account number", placeholder: "e.g. 0123456789" },
      { key: "account_name",   label: "Account name",   placeholder: "e.g. My Business Ltd" },
      { key: "instructions",   label: "Extra instructions (optional)", placeholder: "e.g. Send proof of transfer via WhatsApp after payment." },
    ],
  },
};

const ONLINE_ORDER  = ["paystack", "flutterwave", "stripe"];
const OFFLINE_ORDER = ["pos", "manual"];

function GatewayCard({ gw, onToggle, onSaveConfig }: {
  gw: PaymentGatewayResp;
  onToggle: (enabled: boolean) => Promise<void>;
  onSaveConfig: (config: Record<string, unknown>) => Promise<void>;
}) {
  const info = GATEWAY_INFO[gw.gateway];
  const [toggling, setToggling] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localConfig, setLocalConfig] = useState<Record<string, string>>(
    Object.fromEntries((info?.configFields ?? []).map((f) => [f.key, (gw.config?.[f.key] as string) ?? ""]))
  );

  if (!info) return null;

  async function toggle() {
    setToggling(true);
    try { await onToggle(!gw.enabled); } finally { setToggling(false); }
  }

  async function saveConfig() {
    setSaving(true);
    try {
      await onSaveConfig(localConfig);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  }

  return (
    <div style={{ borderRadius: "12px", border: `2px solid ${gw.enabled ? "#1A7A42" : "#e2e8f0"}`, background: "#fff", overflow: "hidden", transition: "border-color 0.2s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px", borderBottom: gw.enabled ? "1px solid #f0fdf4" : "none" }}>
        <div style={{ fontSize: "24px", width: "40px", textAlign: "center", lineHeight: 1 }}>{info.logo}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "#1C1C1C" }}>{info.label}</p>
            {gw.enabled && <span style={{ fontSize: "10px", fontWeight: 700, color: "#16a34a", background: "#f0fdf4", padding: "2px 7px", borderRadius: "20px" }}>ACTIVE</span>}
          </div>
          <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#6b7280", lineHeight: 1.5 }}>{info.desc}</p>
        </div>
        <button
          onClick={toggle}
          disabled={toggling}
          style={{
            position: "relative", width: "44px", height: "24px",
            borderRadius: "12px", border: "none", cursor: "pointer",
            background: gw.enabled ? "#1A7A42" : "#d1d5db",
            transition: "background 0.2s", flexShrink: 0,
            display: "flex", alignItems: "center", padding: "2px",
          }}
        >
          {toggling
            ? <Loader2 className="w-3 h-3 animate-spin" style={{ color: "#fff", margin: "0 auto" }} />
            : <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "transform 0.2s", transform: gw.enabled ? "translateX(20px)" : "translateX(0)" }} />
          }
        </button>
      </div>

      {gw.enabled && info.configFields && info.configFields.length > 0 && (
        <div style={{ padding: "16px 20px", background: "#fafffe" }}>
          <p style={{ margin: "0 0 12px", fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "5px" }}>
            <Info className="w-3 h-3" /> Configuration
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {info.configFields.map((f) => (
              <div key={f.key}>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "4px" }}>{f.label}</label>
                <input
                  value={localConfig[f.key] ?? ""}
                  onChange={(e) => setLocalConfig((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  type={f.type ?? "text"}
                  style={{ width: "100%", height: "38px", padding: "0 12px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "13px", outline: "none", color: "#1C1C1C", background: "#fff", boxSizing: "border-box" }}
                />
              </div>
            ))}
          </div>
          <button
            onClick={saveConfig}
            disabled={saving}
            style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "6px", height: "34px", padding: "0 14px", borderRadius: "8px", border: "none", background: saved ? "#f0fdf4" : "#1A7A42", color: saved ? "#16a34a" : "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
            {saving ? "Saving…" : saved ? "Saved!" : "Save configuration"}
          </button>
        </div>
      )}
    </div>
  );
}

function CategorySection({ title, icon, gateways, order, onToggle, onSaveConfig }: {
  title: string;
  icon: React.ReactNode;
  gateways: PaymentGatewayResp[];
  order: string[];
  onToggle: (gateway: string, enabled: boolean) => Promise<void>;
  onSaveConfig: (gateway: string, config: Record<string, unknown>) => Promise<void>;
}) {
  const ordered = order
    .map((g) => gateways.find((gw) => gw.gateway === g))
    .filter(Boolean) as PaymentGatewayResp[];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "8px", background: "#f1f5f9" }}>
          {icon}
        </div>
        <p style={{ margin: 0, fontSize: "13px", fontWeight: 800, color: "#374151" }}>{title}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {ordered.map((gw) => (
          <GatewayCard
            key={gw.gateway}
            gw={gw}
            onToggle={(enabled) => onToggle(gw.gateway, enabled)}
            onSaveConfig={(config) => onSaveConfig(gw.gateway, config)}
          />
        ))}
      </div>
    </div>
  );
}

export default function PaymentGateways() {
  const { data: gateways = [], isLoading } = usePaymentGateways();

  async function handleToggle(gateway: string, enabled: boolean) {
    const gw = gateways.find((g) => g.gateway === gateway);
    await paymentGatewaysApi.upsert(gateway, { enabled, config: gw?.config ?? {} }, tok());
    invalidate.paymentGateways();
  }

  async function handleSaveConfig(gateway: string, config: Record<string, unknown>) {
    const gw = gateways.find((g) => g.gateway === gateway);
    await paymentGatewaysApi.upsert(gateway, { enabled: gw?.enabled ?? false, config }, tok());
    invalidate.paymentGateways();
  }

  return (
    <div className="w-full">
      <div className="px-6 lg:px-8 py-4 border-b" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
        <h2 className="text-[18px] font-extrabold" style={{ color: "#1C1C1C" }}>Payment methods</h2>
        <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>Choose which payment methods your customers can use at checkout. Toggle to enable or disable each one.</p>
      </div>

      <div className="px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16" style={{ color: "#94a3b8" }}>
            <Loader2 className="w-5 h-5 animate-spin" /><span className="text-[13px]">Loading…</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "680px" }}>
            <CategorySection
              title="Online payments"
              icon={<Wifi className="w-4 h-4" style={{ color: "#1A7A42" }} />}
              gateways={gateways}
              order={ONLINE_ORDER}
              onToggle={handleToggle}
              onSaveConfig={handleSaveConfig}
            />
            <CategorySection
              title="Offline payments"
              icon={<WifiOff className="w-4 h-4" style={{ color: "#64748b" }} />}
              gateways={gateways}
              order={OFFLINE_ORDER}
              onToggle={handleToggle}
              onSaveConfig={handleSaveConfig}
            />
          </div>
        )}
      </div>
    </div>
  );
}
