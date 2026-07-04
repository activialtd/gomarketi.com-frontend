"use client";

import { useState } from "react";
import {
  Mail, Send, Plus, Loader2, Users, CheckCircle2,
  Clock, AlertCircle, Trash2, X,
} from "lucide-react";
import { campaignsApi, type CampaignResp } from "@gomarket/api-client";
import { useCampaigns, useSubscribers, invalidate } from "@/lib/swr/hooks";
import { useAuthStore } from "@/store/useAuthStore";

function tok() { return useAuthStore.getState().accessToken ?? ""; }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    draft:   { label: "Draft",   bg: "#f8fafc", color: "#64748b" },
    sending: { label: "Sending", bg: "#eff6ff", color: "#3b82f6" },
    sent:    { label: "Sent",    bg: "#f0fdf4", color: "#16a34a" },
    failed:  { label: "Failed",  bg: "#fef2f2", color: "#dc2626" },
  };
  const s = map[status] ?? map.draft;
  return (
    <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function ComposeModal({ onClose, onSaved }: { onClose: () => void; onSaved: (c: CampaignResp) => void }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function handleSave(andSend: boolean) {
    if (!subject.trim()) { setErr("Subject is required"); return; }
    if (!body.trim()) { setErr("Email body is required"); return; }
    setSaving(true);
    try {
      const camp = await campaignsApi.create({ subject, body_html: body }, tok());
      if (andSend) {
        await campaignsApi.send(camp.id, tok());
      }
      invalidate.campaigns();
      onSaved(camp);
      onClose();
    } catch {
      setErr("Failed to save campaign. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "640px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <p style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#1C1C1C" }}>New campaign</p>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#6b7280" }}>Compose an email to send to your subscribers</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}><X className="w-5 h-5" /></button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {err && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px" }}>
              <AlertCircle className="w-4 h-4 shrink-0" style={{ color: "#dc2626" }} />
              <p style={{ margin: 0, fontSize: "12px", color: "#991b1b" }}>{err}</p>
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px" }}>Subject line</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. 🎉 New arrivals + 15% off this weekend!"
              style={{ width: "100%", height: "42px", padding: "0 12px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "13px", outline: "none", color: "#1C1C1C", background: "#fafafa", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px" }}>
              Email body <span style={{ fontWeight: 400, color: "#94a3b8" }}>(HTML or plain text)</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              placeholder={"Hi {name},\n\nWe have exciting news for you...\n\nShop now at your favourite store!"}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "13px", outline: "none", color: "#1C1C1C", background: "#fafafa", resize: "vertical", lineHeight: 1.6, fontFamily: "inherit", boxSizing: "border-box" }}
            />
            <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>Tip: Use HTML tags for formatting. Recipients will see this in their email client.</p>
          </div>
        </div>

        <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={() => void handleSave(false)} disabled={saving} style={{ height: "38px", padding: "0 18px", borderRadius: "8px", border: "1.5px solid #e2e8f0", background: "#fff", fontSize: "13px", fontWeight: 600, color: "#374151", cursor: "pointer" }}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" /> : "Save draft"}
          </button>
          <button onClick={() => void handleSave(true)} disabled={saving} style={{ height: "38px", padding: "0 18px", borderRadius: "8px", border: "none", background: "#1A7A42", fontSize: "13px", fontWeight: 700, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Send now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Campaigns() {
  const { data: campaigns = [], isLoading: loadingCamps } = useCampaigns();
  const { data: subsResp, isLoading: loadingSubs } = useSubscribers();
  const [showCompose, setShowCompose] = useState(false);
  const [sending, setSending] = useState<string | null>(null);

  const totalSubs = subsResp?.total ?? 0;

  async function handleSend(id: string) {
    setSending(id);
    try {
      await campaignsApi.send(id, tok());
      invalidate.campaigns();
    } catch {
      // error handled silently; status will update on refetch
    } finally {
      setSending(null);
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="px-6 lg:px-8 py-4 border-b flex flex-wrap items-center justify-between gap-3" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
        <div>
          <h1 className="text-[20px] font-extrabold" style={{ color: "#1C1C1C", letterSpacing: "-0.3px" }}>Email campaigns</h1>
          <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
            {loadingSubs ? "Loading…" : `${totalSubs} active subscriber${totalSubs === 1 ? "" : "s"}`}
          </p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          style={{ display: "flex", alignItems: "center", gap: "6px", height: "38px", padding: "0 16px", borderRadius: "10px", border: "none", background: "#1A7A42", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
        >
          <Plus className="w-4 h-4" /> New campaign
        </button>
      </div>

      <div className="px-6 lg:px-8 py-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="rounded-[12px] border p-4" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" style={{ color: "#1A7A42" }} />
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#6b7280" }}>Subscribers</p>
            </div>
            <p className="text-[24px] font-black" style={{ color: "#1C1C1C" }}>{loadingSubs ? "—" : totalSubs}</p>
          </div>
          <div className="rounded-[12px] border p-4" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4" style={{ color: "#3b82f6" }} />
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#6b7280" }}>Campaigns sent</p>
            </div>
            <p className="text-[24px] font-black" style={{ color: "#1C1C1C" }}>{campaigns.filter((c) => c.status === "sent").length}</p>
          </div>
          <div className="rounded-[12px] border p-4" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4" style={{ color: "#f59e0b" }} />
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#6b7280" }}>Drafts</p>
            </div>
            <p className="text-[24px] font-black" style={{ color: "#1C1C1C" }}>{campaigns.filter((c) => c.status === "draft").length}</p>
          </div>
        </div>

        {/* Campaign list */}
        <div className="rounded-[14px] border overflow-hidden" style={{ borderColor: "#e2e8f0" }}>
          <div className="px-5 py-3 border-b" style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}>
            <p className="text-[13px] font-bold" style={{ color: "#1C1C1C" }}>All campaigns</p>
          </div>

          {loadingCamps ? (
            <div className="flex items-center justify-center gap-2 py-16" style={{ color: "#94a3b8" }}>
              <Loader2 className="w-5 h-5 animate-spin" /><span className="text-[13px]">Loading…</span>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Mail className="w-10 h-10" style={{ color: "#d1fae5" }} />
              <p className="text-[14px] font-bold" style={{ color: "#1C1C1C" }}>No campaigns yet</p>
              <p className="text-[12px] text-center max-w-xs" style={{ color: "#6b7280" }}>Create your first campaign to start engaging your newsletter subscribers.</p>
              <button onClick={() => setShowCompose(true)} style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "6px", height: "36px", padding: "0 16px", borderRadius: "8px", border: "none", background: "#1A7A42", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                <Plus className="w-3.5 h-3.5" /> Create campaign
              </button>
            </div>
          ) : (
            <div>
              {campaigns.map((camp, i) => (
                <div key={camp.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 20px", borderBottom: i < campaigns.length - 1 ? "1px solid #f1f5f9" : "none", background: "#fff" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: camp.status === "sent" ? "#f0fdf4" : "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {camp.status === "sent" ? <CheckCircle2 className="w-4 h-4" style={{ color: "#16a34a" }} /> : <Mail className="w-4 h-4" style={{ color: "#94a3b8" }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#1C1C1C", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{camp.subject}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "3px" }}>
                      <StatusBadge status={camp.status} />
                      {camp.recipients_count > 0 && <span style={{ fontSize: "11px", color: "#6b7280" }}>{camp.recipients_count} recipient{camp.recipients_count !== 1 ? "s" : ""}</span>}
                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>{fmtDate(camp.created_at)}</span>
                    </div>
                  </div>
                  {camp.status === "draft" && (
                    <button
                      onClick={() => void handleSend(camp.id)}
                      disabled={sending === camp.id}
                      style={{ display: "flex", alignItems: "center", gap: "5px", height: "32px", padding: "0 12px", borderRadius: "8px", border: "none", background: "#1A7A42", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer", flexShrink: 0, opacity: sending === camp.id ? 0.7 : 1 }}
                    >
                      {sending === camp.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      Send
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCompose && <ComposeModal onClose={() => setShowCompose(false)} onSaved={() => {}} />}
    </div>
  );
}
