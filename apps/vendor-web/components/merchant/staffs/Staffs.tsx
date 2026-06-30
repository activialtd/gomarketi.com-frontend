"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { Plus, Search, Users } from "lucide-react";
import { PermissionMatrix, Role, StaffMember, StaffRow } from "./helpers";
import { MOCK_STAFF } from "@/lib/data/staffs";
import { ROLE_CONFIG } from "@/lib/config/role";
import InviteModal from "./inviteModal";
import RemoveModal from "./removeStaff";

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF);
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<StaffMember | null>(null);
  const [filterRole, setFilterRole] = useState<Role | "all">("all");

  const SELF_ID = "s-001";

  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headerRef.current || !pageRef.current) return;
    const tl = gsap.timeline();
    tl.fromTo(
      headerRef.current,
      { opacity: 0, y: -14 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
    ).fromTo(
      pageRef.current.querySelectorAll("[data-animate]"),
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, stagger: 0.08, duration: 0.4, ease: "power2.out" },
      "-=0.2",
    );
  }, []);

  const filtered = staff.filter((m) => {
    const matchSearch =
      !search.trim() ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || m.role === filterRole;
    return matchSearch && matchRole;
  });

  function handleInvite(member: StaffMember) {
    setStaff((prev) => [...prev, member]);
  }

  function handleRemove(id: string) {
    const el = pageRef.current?.querySelector(`[data-staff-row="${id}"]`);
    if (el) {
      gsap.to(el, {
        opacity: 0,
        x: 20,
        height: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => setStaff((prev) => prev.filter((m) => m.id !== id)),
      });
    } else {
      setStaff((prev) => prev.filter((m) => m.id !== id));
    }
    setRemoveTarget(null);
  }

  function handleChangeRole(id: string, role: Role) {
    setStaff((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
  }

  const activeCount = staff.filter((m) => m.status === "active").length;
  const pendingCount = staff.filter((m) => m.status === "invited").length;

  return (
    <div ref={pageRef} className="w-full">
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        ref={headerRef}
        className="mb-6 flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <h1
            className="text-[22px] font-extrabold"
            style={{ color: "#1C1C1C", letterSpacing: "-0.4px" }}
          >
            Staff & Roles
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "#6b7280" }}>
            Manage who has access to your store and what they can do.
          </p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-[10px] text-white text-[13px] font-bold transition-all active:scale-[0.97]"
          style={{
            background: "#0A2E1A",
            boxShadow: "0 2px 10px rgba(10,46,26,0.25)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#1A7A42")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#0A2E1A")}
        >
          <Plus className="w-4 h-4" /> Invite staff
        </button>
      </div>

      {/* ── Stats ─────────────────────────────────────────── */}
      <div data-animate className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {
            label: "Total staff",
            value: staff.length,
            color: "#0A2E1A",
            bg: "#F0FAF3",
          },
          {
            label: "Active",
            value: activeCount,
            color: "#1A7A42",
            bg: "#dcfce7",
          },
          {
            label: "Pending",
            value: pendingCount,
            color: "#b45309",
            bg: "#fef3c7",
          },
          {
            label: "Roles used",
            value: new Set(staff.map((m) => m.role)).size,
            color: "#7c3aed",
            bg: "#faf5ff",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-[12px] border px-4 py-3"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <p
              className="text-[22px] font-extrabold"
              style={{ color: "#1C1C1C" }}
            >
              {s.value}
            </p>
            <p
              className="text-[11px] font-semibold uppercase tracking-wide mt-0.5"
              style={{ color: "#94a3b8" }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Staff table ────────────────────────────────────── */}
      <div
        data-animate
        className="rounded-[16px] border"
        style={{ background: "#fff", borderColor: "#e2e8f0" }}
      >
        {/* Toolbar */}
        <div
          className="flex flex-wrap items-center gap-2.5 px-5 py-4 border-b rounded-t-[16px]"
          style={{ borderColor: "#f1f5f9" }}
        >
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: "#94a3b8" }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff…"
              className="w-full h-9 pl-9 pr-3 rounded-[8px] border text-[13px] outline-none transition-all"
              style={{
                borderColor: "#e2e8f0",
                background: "#F0FAF3",
                color: "#1C1C1C",
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.borderColor = "#1A7A42";
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = "#F0FAF3";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
            />
          </div>

          {/* Role filter tabs */}
          <div
            className="flex items-center rounded-[8px] border overflow-hidden"
            style={{ borderColor: "#e2e8f0" }}
          >
            {(["all", "admin", "staff"] as const).map((r, i) => (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className="h-9 px-3 text-[11px] font-semibold capitalize transition-colors"
                style={{
                  background: filterRole === r ? "#0A2E1A" : "#fff",
                  color: filterRole === r ? "#fff" : "#6b7280",
                  borderRight: i < 2 ? "1px solid #e2e8f0" : "none",
                }}
              >
                {r === "all" ? "All" : ROLE_CONFIG[r].label}
              </button>
            ))}
          </div>

          <p className="ml-auto text-[12px]" style={{ color: "#94a3b8" }}>
            {filtered.length} member{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Table header */}
        <div
          className="hidden sm:grid px-5 py-2.5 border-b"
          style={{
            gridTemplateColumns: "36px 1fr 100px 140px 40px",
            gap: "16px",
            background: "#fafafa",
            borderColor: "#f1f5f9",
          }}
        >
          {["", "Name / Email", "Last active", "Role", ""].map((h, i) => (
            <span
              key={i}
              className="text-[10px] font-extrabold uppercase tracking-[0.1em]"
              style={{ color: "#94a3b8" }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div
              className="w-12 h-12 rounded-[12px] flex items-center justify-center"
              style={{ background: "#F0FAF3" }}
            >
              <Users className="w-5 h-5" style={{ color: "#1A7A42" }} />
            </div>
            <p
              className="text-[13px] font-semibold"
              style={{ color: "#374151" }}
            >
              {search ? `No staff match "${search}"` : "No staff yet"}
            </p>
            <button
              onClick={() => setInviteOpen(true)}
              className="text-[12px] font-bold"
              style={{ color: "#1A7A42" }}
            >
              Invite someone →
            </button>
          </div>
        ) : (
          filtered.map((member) => (
            <div key={member.id} data-staff-row={member.id}>
              <StaffRow
                member={member}
                isSelf={member.id === SELF_ID}
                onRemove={() => setRemoveTarget(member)}
                onChangeRole={(role) => handleChangeRole(member.id, role)}
              />
            </div>
          ))
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────── */}
      {inviteOpen && (
        <InviteModal
          onClose={() => setInviteOpen(false)}
          onInvite={handleInvite}
        />
      )}
      {removeTarget && (
        <RemoveModal
          member={removeTarget}
          onConfirm={() => handleRemove(removeTarget.id)}
          onCancel={() => setRemoveTarget(null)}
        />
      )}
    </div>
  );
}
