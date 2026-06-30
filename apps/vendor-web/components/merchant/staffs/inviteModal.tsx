import { ROLE_CONFIG } from "@/lib/config/role";
import {
  AVATAR_COLORS,
  PermissionMatrix,
  Role,
  StaffMember,
} from "@/components/merchant/staffs/helpers";
import { Check, Mail, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function InviteModal({
  onClose,
  onInvite,
}: {
  onClose: () => void;
  onInvite: (member: StaffMember) => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("staff");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!modalRef.current) return;
    gsap.fromTo(
      modalRef.current,
      { scale: 0.95, opacity: 0, y: 12 },
      { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
    );
  }, []);

  async function handleSend() {
    if (!email.trim() || !name.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    setSent(true);
    const newMember: StaffMember = {
      id: `s-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      status: "invited",
      invitedAt: new Date().toISOString(),
      avatarColor:
        AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    };
    setTimeout(() => {
      onInvite(newMember);
      onClose();
    }, 1200);
  }

  const inputClass =
    "w-full h-[42px] px-3.5 rounded-[10px] border text-[13px] font-medium outline-none transition-all bg-[#F0FAF3] focus:bg-white focus:border-[#1A7A42]";
  const inputStyle = { borderColor: "#e2e8f0", color: "#1C1C1C" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl rounded-[18px] border overflow-hidden mb-10"
        style={{
          background: "#fff",
          borderColor: "#e2e8f0",
          boxShadow: "0 24px 60px rgba(0,0,0,0.14)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: "#f1f5f9" }}
        >
          <div>
            <p
              className="text-[16px] font-extrabold"
              style={{ color: "#1C1C1C" }}
            >
              Invite a team member
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
              They'll receive an email with a link to join your store.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" style={{ color: "#6b7280" }} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                className="text-[10px] font-extrabold uppercase tracking-[0.1em]"
                style={{ color: "#3D6B4F" }}
              >
                Full name *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                style={inputStyle}
                placeholder="John Doe"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#1A7A42";
                  e.currentTarget.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.background = "#F0FAF3";
                }}
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="text-[10px] font-extrabold uppercase tracking-[0.1em]"
                style={{ color: "#3D6B4F" }}
              >
                Email address *
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className={inputClass}
                style={inputStyle}
                placeholder="john@yourstore.com"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#1A7A42";
                  e.currentTarget.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.background = "#F0FAF3";
                }}
              />
            </div>
          </div>

          {/* Role selector */}
          <div className="space-y-1.5">
            <label
              className="text-[10px] font-extrabold uppercase tracking-[0.1em]"
              style={{ color: "#3D6B4F" }}
            >
              Role
            </label>
            {/* Adjusted from 4 columns to 2 columns max */}
            <div className="grid grid-cols-2 gap-2">
              {(
                Object.entries(ROLE_CONFIG) as [
                  Role,
                  (typeof ROLE_CONFIG)[Role],
                ][]
              ).map(([r, cfg]) => {
                const Icon = cfg.icon;
                const isSelected = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className="flex flex-col items-start gap-2 p-3 rounded-[10px] border text-left transition-all relative"
                    style={{
                      borderColor: isSelected ? cfg.color : "#e2e8f0",
                      background: isSelected ? cfg.bg : "#fafafa",
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-[7px] flex items-center justify-center"
                      style={{
                        background: isSelected ? `${cfg.color}18` : "#f1f5f9",
                      }}
                    >
                      <Icon
                        className="w-3.5 h-3.5"
                        style={{ color: isSelected ? cfg.color : "#9ca3af" }}
                      />
                    </div>
                    <p
                      className="text-[12px] font-bold"
                      style={{ color: isSelected ? cfg.color : "#374151" }}
                    >
                      {cfg.label}
                    </p>
                    {isSelected && (
                      <div
                        className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: cfg.color }}
                      >
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] mt-1" style={{ color: "#6b7280" }}>
              {ROLE_CONFIG[role].description}
            </p>
          </div>

          {/* Permission matrix */}
          <div className="space-y-2">
            <p
              className="text-[10px] font-extrabold uppercase tracking-[0.1em]"
              style={{ color: "#94a3b8" }}
            >
              What this role can access
            </p>
            <PermissionMatrix selectedRole={role} />
          </div>

          {/* Send */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!email.trim() || !name.trim() || sending}
            className="w-full h-[46px] rounded-[11px] text-[14px] font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "#0A2E1A",
              boxShadow: "0 4px 14px rgba(10,46,26,0.25)",
            }}
            onMouseOver={(e) =>
              !sending &&
              email.trim() &&
              name.trim() &&
              (e.currentTarget.style.background = "#1A7A42")
            }
            onMouseOut={(e) => (e.currentTarget.style.background = "#0A2E1A")}
          >
            {sent ? (
              <>
                <Check className="w-4 h-4" /> Invite sent!
              </>
            ) : sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{" "}
                Sending…
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" /> Send invite
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
