"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";

interface WhatsAppFloatProps {
  number: string;
  storeName: string;
  primary?: string;
  defaultMessage?: string;
}

export function WhatsAppFloat({
  number,
  storeName,
  primary = "#25D366",
  defaultMessage,
}: WhatsAppFloatProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(
    defaultMessage ?? `Hi ${storeName}, I have a question about your products.`,
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // strip everything except digits so a display value like "+234 801 234 5678"
  // still produces a valid wa.me link
  const cleanNumber = number.replace(/\D/g, "");

  // autofocus the textarea when the panel opens
  useEffect(() => {
    if (open) {
      // slight delay so the animation doesn't fight the focus
      const t = setTimeout(() => textareaRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = () => {
    const text = message.trim();
    if (!text) return;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends; Shift+Enter inserts a newline (chat convention)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!cleanNumber) return null; // no number configured → render nothing

  return (
    <>
      {/* ── Chat panel ─────────────────────────────────── */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-white text-[#0E0E0E] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200"
          role="dialog"
          aria-label={`Chat with ${storeName} on WhatsApp`}
        >
          {/* header */}
          <div
            className="flex items-center gap-3 px-4 py-3.5"
            style={{ backgroundColor: primary }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <MessageCircle className="h-5 w-5 text-white" fill="white" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-white">
                {storeName}
              </p>
              <p className="text-[11px] text-white/85">
                Typically replies within an hour
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="p-1 text-white/80 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* preview bubble — sets the "chat" tone */}
          <div className="bg-[#ECE5DD] px-4 py-4">
            <div className="max-w-[80%] rounded-lg rounded-tl-none bg-white px-3 py-2 shadow-sm">
              <p className="text-[12px] leading-relaxed text-[#0E0E0E]">
                Hi 👋 Send us a message and we'll continue on WhatsApp.
              </p>
              <p className="mt-1 text-[10px] text-black/40">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* composer */}
          <div className="flex items-end gap-2 border-t border-black/5 bg-white p-3">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type a message…"
              rows={2}
              className="flex-1 resize-none rounded-lg border border-black/10 bg-[#F7F7F7] px-3 py-2 text-[13px] text-[#0E0E0E] placeholder:text-black/35 focus:border-black/25 focus:outline-none"
            />
            <button
              onClick={send}
              disabled={!message.trim()}
              aria-label="Send on WhatsApp"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-40"
              style={{ backgroundColor: primary }}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Floating bubble ────────────────────────────── */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close WhatsApp chat" : "Open WhatsApp chat"}
        aria-expanded={open}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: primary }}
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageCircle className="h-7 w-7" fill="white" strokeWidth={0} />
            {/* subtle pulse ring to draw attention on first load */}
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-30"
              style={{ backgroundColor: primary, animationDuration: "2.5s" }}
              aria-hidden="true"
            />
          </>
        )}
      </button>
    </>
  );
}
