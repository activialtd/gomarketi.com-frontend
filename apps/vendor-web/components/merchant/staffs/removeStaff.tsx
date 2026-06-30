import { AlertTriangle } from "lucide-react";
import { useRef, useEffect } from "react";
import { StaffMember } from "./helpers";
import { gsap } from "gsap/gsap-core";

export default function RemoveModal({
  member,
  onConfirm,
  onCancel,
}: {
  member: StaffMember;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { scale: 0.95, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.25, ease: "power2.out" },
    );
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onCancel}
    >
      <div
        ref={ref}
        className="w-full max-w-sm rounded-[16px] border p-5 shadow-2xl"
        style={{ background: "#fff", borderColor: "#e2e8f0" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "#fee2e2" }}
          >
            <AlertTriangle className="w-5 h-5" style={{ color: "#dc2626" }} />
          </div>
          <div>
            <p
              className="text-[14px] font-extrabold"
              style={{ color: "#1C1C1C" }}
            >
              Remove {member.name}?
            </p>
            <p
              className="text-[12px] mt-1 leading-relaxed"
              style={{ color: "#6b7280" }}
            >
              They'll immediately lose access to your store. This cannot be
              undone — you'd need to re-invite them.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 h-10 rounded-[9px] border text-[13px] font-semibold transition-colors"
            style={{ borderColor: "#e2e8f0", color: "#374151" }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#f9fafb")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-10 rounded-[9px] text-[13px] font-bold text-white transition-all active:scale-[0.98]"
            style={{ background: "#dc2626" }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#b91c1c")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#dc2626")}
          >
            Remove access
          </button>
        </div>
      </div>
    </div>
  );
}
