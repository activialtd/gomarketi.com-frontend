"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import {
  Mail,
  Lock,
  Trash2,
  AlertTriangle,
  X,
  ShieldCheck,
  Globe,
  Phone,
} from "lucide-react";

export default function ProfilePage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Mock User State
  const [profile, setProfile] = useState({
    firstName: "Chidinma",
    lastName: "Okafor",
    email: "chidinma@yourstore.ng",
    phone: "+234 801 234 5678",
    language: "en",
    timezone: "Africa/Lagos",
  });

  // Modals & UI States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Passwords
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

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

  const getInitials = () => {
    return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
  };

  // Styling for active inputs (Passwords, Preferences)
  const activeInputClass =
    "w-full h-[46px] px-4 rounded-[12px] border text-[14px] font-medium outline-none transition-all bg-[#F0FAF3] focus:bg-white focus:border-[#1A7A42]";
  const activeInputStyle = { borderColor: "#e2e8f0", color: "#1C1C1C" };

  // Styling for read-only inputs (Identity)
  const readOnlyInputClass =
    "w-full h-[46px] px-4 rounded-[12px] border border-gray-200 text-[14px] font-semibold bg-gray-50/50 cursor-not-allowed outline-none";

  const labelClass =
    "text-[11px] font-extrabold uppercase tracking-[0.1em] mb-2 block";

  return (
    <div ref={pageRef} className="w-full pb-20">
      {/* ── Header ─────────────────────────────────────────── */}
      <div ref={headerRef} className="mb-8 flex items-end justify-between">
        <div>
          <h1
            className="text-[26px] font-black"
            style={{ color: "#1C1C1C", letterSpacing: "-0.5px" }}
          >
            Your Profile
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "#6b7280" }}>
            Manage your personal identity, preferences, and security settings.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* ── Personal Info Section (Full Width, Avatar Left) ── */}
        <div
          data-animate
          className="rounded-[24px] border p-8 md:p-10 flex flex-col md:flex-row gap-10 lg:gap-16 items-start"
          style={{ background: "#fff", borderColor: "#e2e8f0" }}
        >
          {/* Avatar Area */}
          <div className="flex flex-col items-center md:items-start shrink-0">
            <div
              className="w-32 h-32 lg:w-40 lg:h-40 rounded-full flex items-center justify-center text-[48px] lg:text-[56px] font-black tracking-tighter"
              style={{
                background: "#0A2E1A",
                color: "#fff",
              }}
            >
              {getInitials()}
            </div>
            <div className="mt-5 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#F0FAF3] text-[#1A7A42] text-[11px] font-extrabold uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" /> Store Owner
            </div>
          </div>

          {/* Read-Only Form */}
          <div className="flex-1 w-full max-w-3xl">
            <div className="mb-8">
              <h2
                className="text-[18px] font-extrabold"
                style={{ color: "#1C1C1C" }}
              >
                Personal Details
              </h2>
              <p className="text-[13px] text-gray-500 mt-1">
                Your core identity information. Contact support if you need to
                update these details.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClass} style={{ color: "#94a3b8" }}>
                  First Name
                </label>
                <input
                  readOnly
                  value={profile.firstName}
                  className={readOnlyInputClass}
                  style={{ color: "#6b7280" }}
                />
              </div>
              <div>
                <label className={labelClass} style={{ color: "#94a3b8" }}>
                  Last Name
                </label>
                <input
                  readOnly
                  value={profile.lastName}
                  className={readOnlyInputClass}
                  style={{ color: "#6b7280" }}
                />
              </div>
              <div>
                <label className={labelClass} style={{ color: "#94a3b8" }}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5"
                    style={{ color: "#94a3b8" }}
                  />
                  <input
                    readOnly
                    value={profile.email}
                    className={`${readOnlyInputClass} pl-12`}
                    style={{ color: "#6b7280" }}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass} style={{ color: "#94a3b8" }}>
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5"
                    style={{ color: "#94a3b8" }}
                  />
                  <input
                    readOnly
                    value={profile.phone}
                    className={`${readOnlyInputClass} pl-12`}
                    style={{ color: "#6b7280" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Lower Grid: Preferences & Security ─────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preferences Section */}
          <div
            data-animate
            className="rounded-[24px] border p-8 md:p-10 flex flex-col justify-between"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F0FAF3]">
                  <Globe className="w-5 h-5" style={{ color: "#1A7A42" }} />
                </div>
                <div>
                  <h2
                    className="text-[18px] font-extrabold"
                    style={{ color: "#1C1C1C" }}
                  >
                    Preferences
                  </h2>
                  <p className="text-[13px] text-gray-500 mt-0.5">
                    Customize your dashboard experience.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={labelClass} style={{ color: "#3D6B4F" }}>
                    Language
                  </label>
                  <select
                    value={profile.language}
                    onChange={(e) =>
                      setProfile({ ...profile, language: e.target.value })
                    }
                    className={activeInputClass}
                    style={activeInputStyle}
                  >
                    <option value="en">English (US)</option>
                    <option value="fr">Français</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass} style={{ color: "#3D6B4F" }}>
                    Timezone
                  </label>
                  <select
                    value={profile.timezone}
                    onChange={(e) =>
                      setProfile({ ...profile, timezone: e.target.value })
                    }
                    className={activeInputClass}
                    style={activeInputStyle}
                  >
                    <option value="Africa/Lagos">
                      West Africa Time (Lagos)
                    </option>
                    <option value="UTC">
                      Coordinated Universal Time (UTC)
                    </option>
                    <option value="America/New_York">
                      Eastern Time (New York)
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end">
              <button className="h-11 px-6 rounded-[12px] text-[14px] font-bold transition-all active:scale-[0.97] bg-[#F0FAF3] text-[#1A7A42] hover:bg-[#dcfce7]">
                Save Preferences
              </button>
            </div>
          </div>

          {/* Security Section */}
          <div
            data-animate
            className="rounded-[24px] border p-8 md:p-10 flex flex-col justify-between"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F0FAF3]">
                  <Lock className="w-5 h-5" style={{ color: "#1A7A42" }} />
                </div>
                <div>
                  <h2
                    className="text-[18px] font-extrabold"
                    style={{ color: "#1C1C1C" }}
                  >
                    Password & Security
                  </h2>
                  <p className="text-[13px] text-gray-500 mt-0.5">
                    Update your password to stay secure.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={labelClass} style={{ color: "#3D6B4F" }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords({ ...passwords, current: e.target.value })
                    }
                    className={activeInputClass}
                    style={activeInputStyle}
                    placeholder="••••••••"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass} style={{ color: "#3D6B4F" }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwords.new}
                      onChange={(e) =>
                        setPasswords({ ...passwords, new: e.target.value })
                      }
                      className={activeInputClass}
                      style={activeInputStyle}
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className={labelClass} style={{ color: "#3D6B4F" }}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirm: e.target.value })
                      }
                      className={activeInputClass}
                      style={activeInputStyle}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end">
              <button
                disabled={
                  !passwords.current ||
                  !passwords.new ||
                  passwords.new !== passwords.confirm
                }
                className="h-11 px-8 rounded-[12px] text-[14px] font-bold transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "#0A2E1A",
                  color: "#fff",
                }}
                onMouseOver={(e) =>
                  !(
                    !passwords.current ||
                    !passwords.new ||
                    passwords.new !== passwords.confirm
                  ) && (e.currentTarget.style.background = "#1A7A42")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "#0A2E1A")
                }
              >
                Update Password
              </button>
            </div>
          </div>
        </div>

        {/* ── Subtle Delete Account Area ─────────────────────── */}
        <div
          data-animate
          className="pt-8 pb-4 flex flex-col items-center justify-center text-center"
        >
          <p className="text-[13px] text-gray-500 mb-2">
            No longer need this account?
          </p>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="text-[13px] font-bold text-red-600 hover:text-red-700 transition-colors hover:underline flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete my account
          </button>
        </div>
      </div>

      {/* ── Delete Account Modal ─────────────────────────────── */}
      {deleteModalOpen && (
        <DeleteAccountModal
          onClose={() => setDeleteModalOpen(false)}
          email={profile.email}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Sub-component for the Delete Modal
// ----------------------------------------------------------------------

function DeleteAccountModal({
  onClose,
  email,
}: {
  onClose: () => void;
  email: string;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!modalRef.current) return;
    gsap.fromTo(
      modalRef.current,
      { scale: 0.95, opacity: 0, y: 15 },
      { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
    );
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    // Simulate API call to delete account
    await new Promise((r) => setTimeout(r, 1500));
    setIsDeleting(false);
    onClose();
  };

  const inputClass =
    "w-full px-4 py-3 rounded-[12px] border text-[14px] font-medium outline-none transition-all";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-[24px] border overflow-hidden shadow-2xl"
        style={{
          background: "#fff",
          borderColor: "#e2e8f0",
        }}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <div className="flex items-center gap-2.5 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="text-[18px] font-black text-gray-900 tracking-tight">
              Delete Account
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="p-4 rounded-[12px] bg-red-50 border border-red-100 text-[13px] text-red-800 leading-relaxed">
            You are about to permanently delete your account (
            <strong>{email}</strong>). This action <strong>cannot</strong> be
            undone.
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-gray-500">
              Why are you leaving? (Optional)
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`${inputClass} bg-gray-50 border-gray-200 focus:bg-white focus:border-gray-400`}
            >
              <option value="" disabled>
                Select a reason...
              </option>
              <option value="too_expensive">It's too expensive</option>
              <option value="missing_features">Missing features I need</option>
              <option value="hard_to_use">Too hard to use</option>
              <option value="closing_business">Closing my business</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-gray-500">
              To confirm, type "DELETE" below
            </label>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className={`${inputClass} bg-gray-50 border-gray-200 focus:bg-white focus:border-red-400 focus:ring-1 focus:ring-red-400`}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-12 rounded-[12px] text-[14px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={confirmText !== "DELETE" || isDeleting}
              className="flex-1 h-12 rounded-[12px] text-[14px] font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-red-600/20"
            >
              {isDeleting ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                "Delete Account"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
