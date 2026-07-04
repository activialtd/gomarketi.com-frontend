"use client";

import { useState } from "react";
import { Loader2, UserPlus, Trash2, PencilLine, CheckCircle2, ShieldCheck, Eye, Package, Headphones, BarChart2 } from "lucide-react";
import { staffApi, type StaffResp, type CreateStaffReq } from "@gomarket/api-client";
import { useStaff, invalidate } from "@/lib/swr/hooks";
import { useAuthStore } from "@/store/useAuthStore";

function tok() { return useAuthStore.getState().accessToken ?? ""; }

const ROLE_META: Record<string, { label: string; desc: string; icon: React.ReactNode; color: string }> = {
  manager: {
    label: "Manager",
    desc: "Full dashboard access except billing and account deletion.",
    icon: <ShieldCheck className="w-4 h-4" />,
    color: "#1A7A42",
  },
  fulfillment: {
    label: "Fulfillment",
    desc: "View and update orders only — no access to settings or analytics.",
    icon: <Package className="w-4 h-4" />,
    color: "#0891b2",
  },
  support: {
    label: "Support",
    desc: "View orders and customers. Cannot edit products or settings.",
    icon: <Headphones className="w-4 h-4" />,
    color: "#7c3aed",
  },
  analytics_only: {
    label: "Analytics",
    desc: "Read-only access to analytics and reports. Nothing else.",
    icon: <BarChart2 className="w-4 h-4" />,
    color: "#d97706",
  },
};

function RoleBadge({ role }: { role: string }) {
  const meta = ROLE_META[role];
  if (!meta) return <span style={{ fontSize: "11px", color: "#94a3b8" }}>{role}</span>;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      fontSize: "11px", fontWeight: 700, color: meta.color,
      background: `${meta.color}18`, padding: "3px 8px", borderRadius: "20px",
    }}>
      {meta.icon}
      {meta.label}
    </span>
  );
}

function CreateStaffModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<CreateStaffReq>({ full_name: "", email: "", password: "", role: "fulfillment" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const set = (k: keyof CreateStaffReq, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await staffApi.create(form, tok());
      onCreated();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "480px", padding: "28px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: "17px", fontWeight: 800, color: "#1C1C1C" }}>Add staff member</h3>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {[
            { label: "Full name", key: "full_name" as const, type: "text", placeholder: "e.g. Adaeze Okafor" },
            { label: "Email address", key: "email" as const, type: "email", placeholder: "adaeze@example.com" },
          ].map((f) => (
            <div key={f.key}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "5px" }}>{f.label}</label>
              <input required value={form[f.key]} onChange={(e) => set(f.key, e.target.value)}
                type={f.type} placeholder={f.placeholder}
                style={{ width: "100%", height: "40px", padding: "0 12px", borderRadius: "9px", border: "1.5px solid #e2e8f0", fontSize: "13px", outline: "none", color: "#1C1C1C", boxSizing: "border-box" }} />
            </div>
          ))}

          <div>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "5px" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input required value={form.password} onChange={(e) => set("password", e.target.value)}
                type={showPassword ? "text" : "password"} placeholder="Min 8 characters" minLength={8}
                style={{ width: "100%", height: "40px", padding: "0 40px 0 12px", borderRadius: "9px", border: "1.5px solid #e2e8f0", fontSize: "13px", outline: "none", color: "#1C1C1C", boxSizing: "border-box" }} />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" }}>
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "8px" }}>Role</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {Object.entries(ROLE_META).map(([key, meta]) => (
                <label key={key} style={{
                  display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px",
                  borderRadius: "10px", border: `2px solid ${form.role === key ? meta.color : "#e2e8f0"}`,
                  cursor: "pointer", transition: "border-color 0.15s",
                }}>
                  <input type="radio" name="role" value={key} checked={form.role === key as CreateStaffReq["role"]}
                    onChange={() => set("role", key)} style={{ marginTop: "2px" }} />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: meta.color }}>
                      {meta.icon}{meta.label}
                    </div>
                    <p style={{ margin: "3px 0 0", fontSize: "11.5px", color: "#6b7280" }}>{meta.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && <p style={{ fontSize: "12px", color: "#dc2626", margin: 0 }}>{error}</p>}

          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, height: "40px", borderRadius: "9px", border: "1.5px solid #e2e8f0", background: "#fff", color: "#374151", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              style={{ flex: 1, height: "40px", borderRadius: "9px", border: "none", background: "#1A7A42", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? "Creating…" : "Create staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StaffCard({ member, onRemove }: { member: StaffResp; onRemove: () => void }) {
  const [removing, setRemoving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const initials = member.full_name.split(" ").map((n) => n[0] ?? "").join("").toUpperCase().slice(0, 2) || member.email[0].toUpperCase();

  async function toggleActive() {
    setToggling(true);
    try {
      await staffApi.update(member.id, { is_active: !member.is_active }, tok());
      invalidate.staff();
    } finally { setToggling(false); }
  }

  async function remove() {
    if (!confirm(`Remove ${member.full_name || member.email} from your team?`)) return;
    setRemoving(true);
    try {
      await staffApi.remove(member.id, tok());
      onRemove();
    } finally { setRemoving(false); }
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px",
      borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "#fff",
      opacity: member.is_active ? 1 : 0.55,
    }}>
      <div style={{
        width: "38px", height: "38px", borderRadius: "50%", flexShrink: 0,
        background: "#0A2E1A", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "13px", fontWeight: 800, color: "#fff",
      }}>{initials}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#1C1C1C" }}>
            {member.full_name || "—"}
          </p>
          <RoleBadge role={member.role} />
          {!member.is_active && <span style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", background: "#f1f5f9", padding: "2px 6px", borderRadius: "20px" }}>INACTIVE</span>}
        </div>
        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#6b7280" }}>{member.email}</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        <button onClick={toggleActive} disabled={toggling}
          style={{ height: "32px", padding: "0 12px", borderRadius: "8px", border: "1.5px solid #e2e8f0", background: "#fff", fontSize: "11px", fontWeight: 600, color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
          {toggling ? <Loader2 className="w-3 h-3 animate-spin" /> : <PencilLine className="w-3 h-3" />}
          {member.is_active ? "Disable" : "Enable"}
        </button>
        <button onClick={remove} disabled={removing}
          style={{ height: "32px", width: "32px", borderRadius: "8px", border: "1.5px solid #fee2e2", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
          {removing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

export default function StaffRoles() {
  const { data: staff = [], isLoading } = useStaff();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="w-full">
      <div className="px-6 lg:px-8 py-4 border-b" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h2 className="text-[18px] font-extrabold" style={{ color: "#1C1C1C" }}>Staff & Roles</h2>
            <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
              Invite team members and assign roles to control what they can access in your dashboard.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{ display: "flex", alignItems: "center", gap: "7px", height: "38px", padding: "0 16px", borderRadius: "9px", border: "none", background: "#1A7A42", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
          >
            <UserPlus className="w-4 h-4" /> Add staff
          </button>
        </div>
      </div>

      {/* Role overview */}
      <div className="px-6 lg:px-8 pt-6 pb-2">
        <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "12px" }}>Role permissions</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px", maxWidth: "780px" }}>
          {Object.entries(ROLE_META).map(([key, meta]) => (
            <div key={key} style={{ padding: "12px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "#fafafa" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: meta.color, fontWeight: 700, fontSize: "12px", marginBottom: "4px" }}>
                {meta.icon}{meta.label}
              </div>
              <p style={{ margin: 0, fontSize: "11px", color: "#6b7280", lineHeight: 1.5 }}>{meta.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Staff list */}
      <div className="px-6 lg:px-8 py-5">
        <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "12px" }}>Team members</p>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-12" style={{ color: "#94a3b8" }}>
            <Loader2 className="w-5 h-5 animate-spin" /><span className="text-[13px]">Loading…</span>
          </div>
        ) : staff.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>No staff members yet</p>
            <p style={{ fontSize: "12px", marginTop: "4px" }}>Add your first team member to get started.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "680px" }}>
            {staff.map((m) => (
              <StaffCard key={m.id} member={m} onRemove={() => invalidate.staff()} />
            ))}
          </div>
        )}
      </div>

      {/* Staff login instructions */}
      <div className="px-6 lg:px-8 pb-8">
        <div style={{ maxWidth: "680px", padding: "16px 20px", borderRadius: "12px", background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#166534" }}>How staff log in</p>
          <p style={{ margin: "5px 0 0", fontSize: "12.5px", color: "#166534", lineHeight: 1.6 }}>
            Staff members log in at <strong>the same URL as you</strong> by clicking
            &ldquo;Sign in as staff member&rdquo; on the login page. They use the email and
            password you set here. Each staff member only sees the sections their role permits.
          </p>
        </div>
      </div>

      {showModal && (
        <CreateStaffModal
          onClose={() => setShowModal(false)}
          onCreated={() => invalidate.staff()}
        />
      )}
    </div>
  );
}
