import { PERMISSIONS } from "@/lib/config/permissions";
import { ROLE_CONFIG } from "@/lib/config/role";
import {
  Check,
  ChevronDown,
  Clock,
  MoreHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

export type Role = "admin" | "staff";

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "invited";
  joinedAt?: string;
  invitedAt?: string;
  lastActive?: string;
  avatarColor: string;
};

export const AVATAR_COLORS = [
  "#0A2E1A",
  "#1A7A42",
  "#0369a1",
  "#7c3aed",
  "#b45309",
  "#be185d",
  "#0f766e",
  "#1d4ed8",
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function RoleBadge({ role }: { role: Role }) {
  const cfg = ROLE_CONFIG[role];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

export function PermissionMatrix({
  selectedRole,
}: {
  selectedRole: Role | null;
}) {
  return (
    <div
      className="rounded-[12px] border overflow-hidden"
      style={{ borderColor: "#e2e8f0" }}
    >
      {/* Header row */}
      <div
        className="grid border-b"
        style={{
          gridTemplateColumns: "1fr repeat(2, 90px)",
          borderColor: "#f1f5f9",
          background: "#fafafa",
        }}
      >
        <div className="px-4 py-2.5">
          <p
            className="text-[10px] font-extrabold uppercase tracking-[0.1em]"
            style={{ color: "#94a3b8" }}
          >
            Permission
          </p>
        </div>
        {(["admin", "staff"] as Role[]).map((role) => {
          const cfg = ROLE_CONFIG[role];
          const isSelected = selectedRole === role;
          return (
            <div
              key={role}
              className="flex flex-col items-center justify-center py-2.5 transition-all"
              style={{
                background: isSelected ? `${cfg.color}0a` : "transparent",
              }}
            >
              <p
                className="text-[10px] font-bold"
                style={{ color: isSelected ? cfg.color : "#94a3b8" }}
              >
                {cfg.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Permission rows */}
      {PERMISSIONS.map((perm) => {
        const Icon = perm.icon;
        return (
          <div
            key={perm.label}
            className="grid border-b last:border-0"
            style={{
              gridTemplateColumns: "1fr repeat(2, 90px)",
              borderColor: "#f9fafb",
            }}
          >
            <div className="flex items-center gap-2.5 px-4 py-2.5">
              <Icon
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: "#94a3b8" }}
              />
              <span
                className="text-[12px] font-medium"
                style={{ color: "#374151" }}
              >
                {perm.label}
              </span>
            </div>
            {(["admin", "staff"] as Role[]).map((role) => {
              const allowed = perm[role];
              const cfg = ROLE_CONFIG[role];
              const isSelected = selectedRole === role;
              return (
                <div
                  key={role}
                  className="flex items-center justify-center py-2.5 transition-all"
                  style={{
                    background: isSelected ? `${cfg.color}07` : "transparent",
                  }}
                >
                  {allowed ? (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        background: isSelected ? cfg.color : "#F0FAF3",
                      }}
                    >
                      <Check
                        className="w-3 h-3"
                        style={{ color: isSelected ? "#fff" : "#1A7A42" }}
                      />
                    </div>
                  ) : (
                    <X className="w-3.5 h-3.5" style={{ color: "#d1d5db" }} />
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function StaffRow({
  member,
  isSelf,
  onRemove,
  onChangeRole,
}: {
  member: StaffMember;
  isSelf: boolean;
  onRemove: () => void;
  onChangeRole: (role: Role) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  return (
    <div
      className="flex items-center gap-4 px-5 py-4 border-b last:border-0 transition-colors group hover:bg-[#fafafa] last:rounded-b-[16px]"
      style={{ borderColor: "#f1f5f9" }}
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-extrabold text-white shrink-0"
        style={{ background: member.avatarColor }}
      >
        {getInitials(member.name)}
      </div>

      {/* Name + email */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13px] font-semibold" style={{ color: "#1C1C1C" }}>
            {member.name}
          </p>
          {isSelf && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: "#F0FAF3", color: "#1A7A42" }}
            >
              You
            </span>
          )}
          {member.status === "invited" && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: "#fef3c7", color: "#92400e" }}
            >
              <Clock className="w-2.5 h-2.5" /> Invite pending
            </span>
          )}
        </div>
        <p className="text-[11px] truncate mt-0.5" style={{ color: "#6b7280" }}>
          {member.email}
        </p>
      </div>

      {/* Last active */}
      <div className="hidden md:block text-right shrink-0 min-w-[80px]">
        {member.lastActive ? (
          <>
            <p className="text-[11px] font-medium" style={{ color: "#374151" }}>
              {timeAgo(member.lastActive)}
            </p>
            <p className="text-[10px]" style={{ color: "#94a3b8" }}>
              last active
            </p>
          </>
        ) : member.invitedAt ? (
          <>
            <p className="text-[11px] font-medium" style={{ color: "#f59e0b" }}>
              {timeAgo(member.invitedAt)}
            </p>
            <p className="text-[10px]" style={{ color: "#94a3b8" }}>
              invited
            </p>
          </>
        ) : null}
      </div>

      {/* Role — clickable to change if not self */}
      <div className={`relative shrink-0 ${roleMenuOpen ? "z-50" : ""}`}>
        {!isSelf ? (
          <button
            onClick={() => setRoleMenuOpen((v) => !v)}
            className="flex items-center gap-1.5 transition-all hover:opacity-80"
          >
            <RoleBadge role={member.role} />
            <ChevronDown className="w-3 h-3" style={{ color: "#94a3b8" }} />
          </button>
        ) : (
          <RoleBadge role={member.role} />
        )}

        {roleMenuOpen && !isSelf && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setRoleMenuOpen(false)}
            />
            <div
              className="absolute right-0 top-full mt-1.5 w-52 rounded-[12px] border shadow-xl py-1.5 z-20 overflow-hidden"
              style={{
                background: "#fff",
                borderColor: "#e2e8f0",
                boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
              }}
            >
              {(
                Object.entries(ROLE_CONFIG) as [
                  Role,
                  (typeof ROLE_CONFIG)[Role],
                ][]
              ).map(([r, cfg]) => {
                const Icon = cfg.icon;
                const isActive = member.role === r;
                return (
                  <button
                    key={r}
                    onClick={() => {
                      onChangeRole(r);
                      setRoleMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-[12px] font-medium transition-colors hover:bg-[#F0FAF3]"
                    style={{ color: isActive ? cfg.color : "#374151" }}
                  >
                    <Icon
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: isActive ? cfg.color : "#9ca3af" }}
                    />
                    <div>
                      <p className="font-semibold">{cfg.label}</p>
                      <p className="text-[10px]" style={{ color: "#94a3b8" }}>
                        {cfg.description}
                      </p>
                    </div>
                    {isActive && (
                      <Check
                        className="w-3.5 h-3.5 ml-auto shrink-0"
                        style={{ color: cfg.color }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Actions menu */}
      {!isSelf && (
        <div className={`relative shrink-0 ${menuOpen ? "z-50" : ""}`}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-8 h-8 rounded-[7px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-100"
            style={{ color: "#6b7280" }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div
                className="absolute right-0 top-full mt-1 w-40 rounded-[10px] border shadow-lg py-1 z-20"
                style={{ background: "#fff", borderColor: "#e2e8f0" }}
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onRemove();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-left transition-colors hover:bg-red-50"
                  style={{ color: "#dc2626" }}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove access
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
