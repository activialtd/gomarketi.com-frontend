"use client";

import { QUICK_MESSAGES, formatNairaInput } from "@/lib/offers";

/** A large ₦ amount field that formats with commas as the buyer types. */
export function NairaInput({
  value,
  onChange,
  invalid,
  id,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  id?: string;
  autoFocus?: boolean;
}) {
  return (
    <div
      className={`flex h-14 items-center gap-1.5 rounded-xl border-[1.5px] bg-neutral-50 px-4 transition-colors focus-within:bg-white ${
        invalid
          ? "border-red-300"
          : "border-neutral-200 focus-within:border-[var(--store-primary,#1A7A42)]"
      }`}
    >
      <span className="text-[22px] font-black text-neutral-400">₦</span>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        autoFocus={autoFocus}
        placeholder="0"
        value={value}
        onChange={(e) => onChange(formatNairaInput(e.target.value))}
        className="h-full w-full min-w-0 bg-transparent text-[24px] font-black tracking-tight text-neutral-900 outline-none placeholder:text-neutral-300"
      />
    </div>
  );
}

/**
 * Jiji-style one-tap notes. Tapping one adds it to the note (or takes it out
 * again), so a buyer on a phone can ask the usual questions without typing.
 */
export function QuickMessages({
  note,
  onChange,
}: {
  note: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {QUICK_MESSAGES.map((m) => {
        const on = note.includes(m);
        return (
          <button
            key={m}
            type="button"
            onClick={() =>
              onChange(
                on
                  ? note.replace(m, "").replace(/\s{2,}/g, " ").trim()
                  : [note.trim(), m].filter(Boolean).join(" ").slice(0, 500),
              )
            }
            className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
              on
                ? "border-[var(--store-primary,#1A7A42)] bg-[var(--store-bg,#F0FAF3)] text-[var(--store-primary,#1A7A42)]"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
            }`}
          >
            {m}
          </button>
        );
      })}
    </div>
  );
}
