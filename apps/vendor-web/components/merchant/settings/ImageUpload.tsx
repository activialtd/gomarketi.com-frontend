"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, Check, Image as ImageIcon } from "lucide-react";
import { storefrontApi, ApiError } from "@gomarket/api-client";

interface ImageUploadProps {
  label: string;
  description: string;
  currentUrl?: string;
  aspectRatio?: "1:1" | "16:9";
  onUploaded: (url: string) => void;
  accessToken: string;
  uploadType: "logo" | "hero";
}

export function ImageUpload({
  label,
  description,
  currentUrl,
  aspectRatio = "1:1",
  onUploaded,
  accessToken,
  uploadType,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const is169 = aspectRatio === "16:9";
  const previewAspect = is169 ? "aspect-[16/9]" : "aspect-square";

  async function upload(file: File) {
    setError(null);
    setDone(false);
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large — max 5 MB");
      return;
    }
    setUploading(true);
    try {
      const result = await storefrontApi.uploadStoreAsset(accessToken, file, uploadType);
      onUploaded(result.url);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    upload(files[0]);
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[13px] font-bold" style={{ color: "#1C1C1C" }}>{label}</p>
        <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>{description}</p>
      </div>

      {/* Current image preview */}
      {currentUrl && (
        <div className={`relative ${is169 ? "w-full max-w-xs" : "w-24 h-24"} rounded-[10px] overflow-hidden border`}
          style={{ borderColor: "#e2e8f0" }}>
          <img
            src={currentUrl}
            alt={label}
            className={`w-full ${is169 ? previewAspect : "h-24"} object-cover`}
          />
          <button
            type="button"
            onClick={() => onUploaded("")}
            className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.55)" }}
            title="Remove image"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2.5 rounded-[10px] border-2 border-dashed cursor-pointer transition-colors ${is169 ? "py-8" : "py-6"}`}
        style={{
          borderColor: dragging ? "#1A7A42" : "#e2e8f0",
          background: dragging ? "#F0FAF3" : "#fafafa",
        }}
      >
        {uploading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#1A7A42" }} />
            <p className="text-[12px] font-semibold" style={{ color: "#1A7A42" }}>Uploading…</p>
          </>
        ) : done ? (
          <>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#F0FAF3" }}>
              <Check className="w-4 h-4" style={{ color: "#1A7A42" }} />
            </div>
            <p className="text-[12px] font-semibold" style={{ color: "#1A7A42" }}>Uploaded!</p>
          </>
        ) : (
          <>
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#f1f5f9" }}>
              {currentUrl ? <Upload className="w-4.5 h-4.5" style={{ color: "#94a3b8" }} /> : <ImageIcon className="w-4 h-4" style={{ color: "#94a3b8" }} />}
            </div>
            <div className="text-center">
              <p className="text-[12px] font-semibold" style={{ color: "#374151" }}>
                {currentUrl ? `Replace ${label.toLowerCase()}` : `Upload ${label.toLowerCase()}`}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "#94a3b8" }}>
                Drag & drop or click · PNG/JPG/WebP · Max 5 MB
                {is169 && " · 16:9 recommended"}
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-[11px] font-semibold" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
