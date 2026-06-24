"use client";

import { useRef, useState } from "react";
import { Upload, X, Check, Loader2, Image as ImageIcon } from "lucide-react";

interface Props {
  value?: string;           // current CDN URL
  onChange: (url: string | undefined) => void;
  accept?: string;          // e.g. "image/*" or "image/png,image/jpeg"
  maxMB?: number;
  label?: string;
  hint?: string;
  accessToken: string;
  shape?: "square" | "circle"; // preview shape
}

interface PresignResp {
  upload_url: string;
  public_url: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export function FileUpload({
  value,
  onChange,
  accept = "image/png,image/jpeg,image/webp,image/svg+xml",
  maxMB = 2,
  label = "Upload image",
  hint,
  accessToken,
  shape = "square",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const maxBytes = maxMB * 1024 * 1024;

  async function upload(file: File) {
    setError(null);
    setDone(false);

    if (file.size > maxBytes) {
      setError(`File too large — max ${maxMB} MB`);
      return;
    }

    setProgress(0);

    try {
      // 1. Get presigned PUT URL from our backend
      const presignRes = await fetch(`${API_BASE}/v1/storefront/uploads/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ filename: file.name, content_type: file.type, size: file.size }),
      });

      if (!presignRes.ok) {
        const body = await presignRes.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? "Could not get upload URL");
      }

      const { upload_url, public_url } = (await presignRes.json()) as PresignResp;

      // 2. Upload directly to R2 via XHR so we can track progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", upload_url);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => (xhr.status === 200 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)));
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(file);
      });

      setProgress(null);
      setDone(true);
      onChange(public_url);
      setTimeout(() => setDone(false), 3000);
    } catch (e: unknown) {
      setProgress(null);
      setError(e instanceof Error ? e.message : "Upload failed");
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    upload(files[0]);
  }

  const isLoading = progress !== null;
  const previewClass = shape === "circle" ? "rounded-full" : "rounded-[8px]";

  return (
    <div className="space-y-2">
      {/* Current image preview */}
      {value && (
        <div className="relative inline-block">
          <img src={value} alt="" className={`h-16 w-16 object-cover border ${previewClass}`}
            style={{ borderColor: "#e2e8f0" }} />
          <button type="button" onClick={() => onChange(undefined)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: "#ef4444" }}>
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => !isLoading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !isLoading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        className="flex flex-col items-center justify-center gap-2 rounded-[8px] border-2 border-dashed py-5 px-3 text-center cursor-pointer transition-colors"
        style={{
          borderColor: dragging ? "#1A7A42" : "#e2e8f0",
          background: dragging ? "#F0FAF3" : "#fafafa",
        }}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#1A7A42" }} />
            <p className="text-[11px] font-semibold" style={{ color: "#1A7A42" }}>Uploading… {progress}%</p>
            <div className="w-full max-w-[120px] h-1 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
              <div className="h-full rounded-full transition-all duration-200" style={{ width: `${progress}%`, background: "#1A7A42" }} />
            </div>
          </>
        ) : done ? (
          <>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#F0FAF3" }}>
              <Check className="w-4 h-4" style={{ color: "#1A7A42" }} />
            </div>
            <p className="text-[11px] font-semibold" style={{ color: "#1A7A42" }}>Uploaded!</p>
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#f1f5f9" }}>
              <Upload className="w-4 h-4" style={{ color: "#94a3b8" }} />
            </div>
            <p className="text-[11px] font-semibold" style={{ color: "#374151" }}>{label}</p>
            <p className="text-[10px]" style={{ color: "#94a3b8" }}>
              {hint ?? `Drag & drop or click · Max ${maxMB} MB`}
            </p>
          </>
        )}
      </div>

      {/* Or paste URL */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px" style={{ background: "#f1f5f9" }} />
        <p className="text-[10px]" style={{ color: "#94a3b8" }}>or paste URL</p>
        <div className="flex-1 h-px" style={{ background: "#f1f5f9" }} />
      </div>
      <input
        type="url"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        placeholder="https://…/image.png"
        className="w-full px-2.5 py-2 rounded-[7px] border text-[11px] outline-none focus:border-[#1A7A42] transition-colors"
        style={{ borderColor: "#e2e8f0", color: "#1C1C1C", background: "#f8fafc" }}
      />

      {error && (
        <p className="text-[11px] font-semibold" style={{ color: "#ef4444" }}>⚠ {error}</p>
      )}

      <input ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
}
