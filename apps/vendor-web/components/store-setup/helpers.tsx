import { AlertCircle, Store, Upload } from "lucide-react";
import { useRef } from "react";

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[14px] border overflow-hidden"
      style={{ background: "#fff", borderColor: "#e2e8f0" }}
    >
      <div className="px-5 py-4 border-b" style={{ borderColor: "#f1f5f9" }}>
        <p className="text-[14px] font-extrabold" style={{ color: "#1C1C1C" }}>
          {title}
        </p>
        {description && (
          <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
            {description}
          </p>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        className="text-[10px] font-extrabold uppercase block"
        style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px]" style={{ color: "#94a3b8" }}>
          {hint}
        </p>
      )}
      {error && (
        <div className="flex items-center gap-1">
          <AlertCircle
            className="w-3 h-3 shrink-0"
            style={{ color: "#dc2626" }}
          />
          <p className="text-[11px]" style={{ color: "#dc2626" }}>
            {error}
          </p>
        </div>
      )}
    </div>
  );
}

export function StyledTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      rows={3}
      className="w-full px-3.5 py-2.5 rounded-[10px] border text-[13px] resize-none outline-none transition-all"
      style={{
        borderColor: "#e2e8f0",
        background: "#F0FAF3",
        color: "#1C1C1C",
        lineHeight: "1.6",
      }}
      onFocus={(e) => {
        e.currentTarget.style.background = "#fff";
        e.currentTarget.style.borderColor = "#1A7A42";
        e.currentTarget.style.outline = "2px solid #1A7A42";
        e.currentTarget.style.outlineOffset = "-2px";
      }}
      onBlur={(e) => {
        e.currentTarget.style.background = "#F0FAF3";
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.outline = "none";
      }}
      {...props}
    />
  );
}

export function LogoUpload({
  logo,
  onSet,
}: {
  logo: string | null;
  onSet: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-4">
      <div
        className="w-20 h-20 rounded-[14px] border-2 border-dashed flex items-center justify-center overflow-hidden shrink-0"
        style={{
          borderColor: logo ? "#1A7A42" : "#e2e8f0",
          background: "#F0FAF3",
        }}
      >
        {logo ? (
          <img src={logo} alt="Logo" className="w-full h-full object-cover" />
        ) : (
          <Store className="w-8 h-8" style={{ color: "#d1fae5" }} />
        )}
      </div>
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 h-9 px-4 rounded-[8px] border text-[12px] font-semibold transition-colors"
          style={{
            borderColor: "#1A7A42",
            background: "#F0FAF3",
            color: "#1A7A42",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#dcfce7")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#F0FAF3")}
        >
          <Upload className="w-3.5 h-3.5" />{" "}
          {logo ? "Change logo" : "Upload logo"}
        </button>
        <p className="text-[11px]" style={{ color: "#94a3b8" }}>
          PNG or SVG · Square · Min 200×200px
        </p>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={() =>
          onSet(
            "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&q=80",
          )
        }
      />
    </div>
  );
}
