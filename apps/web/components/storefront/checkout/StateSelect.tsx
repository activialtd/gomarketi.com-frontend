"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

/**
 * A searchable state picker.
 *
 * Nigeria has 37 entries counting the FCT, which is long enough that a native
 * select means scrolling a list to find "Ogun" on a phone. Typing two letters
 * is faster, and on mobile a native select opens a wheel that is worse still.
 *
 * Built as a combobox rather than reaching for a library: it is one field, and
 * the keyboard behaviour below (arrows, enter, escape, type-to-filter) is the
 * whole of what a dependency would have brought.
 */
export function StateSelect({
  value,
  options,
  onChange,
  onBlur,
  error,
  className,
  placeholder = "Select state",
  tone = "light",
}: {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: boolean;
  className?: string;
  placeholder?: string;
  /** The Lagos storefront theme is dark; the dropdown has to follow it. */
  tone?: "light" | "dark";
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const dark = tone === "dark";

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    // Prefix matches first — typing "o" should offer Ogun and Ondo before
    // Cross River, which merely contains an "o".
    const starts = options.filter((o) => o.toLowerCase().startsWith(q));
    const contains = options.filter(
      (o) => !o.toLowerCase().startsWith(q) && o.toLowerCase().includes(q),
    );
    return [...starts, ...contains];
  }, [options, query]);

  // Close when the click lands anywhere else, which is what a user expects
  // from a dropdown and what a bare input would not do.
  useEffect(() => {
    if (!open) return;
    function onDocPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
        onBlur?.();
      }
    }
    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, [open, onBlur]);

  useEffect(() => setActive(0), [query]);

  function choose(option: string) {
    onChange(option);
    setOpen(false);
    setQuery("");
    onBlur?.();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (matches.length ? (i + step + matches.length) % matches.length : 0));
      return;
    }
    if (e.key === "Enter") {
      // Only swallow Enter while the list is open, so it still submits the
      // form when the field is merely focused.
      if (open && matches[active]) {
        e.preventDefault();
        choose(matches[active]);
      }
      return;
    }
    if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <input
        ref={inputRef}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && matches[active] ? `${listId}-${active}` : undefined}
        className={className}
        // Shows the chosen state when closed, and whatever is being typed
        // while searching, so the field never looks empty after a choice.
        value={open ? query : value}
        placeholder={value ? value : placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        autoComplete="address-level1"
      />
      <ChevronDown
        className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
          dark ? "text-white/40" : "text-neutral-400"
        }`}
        aria-hidden
      />

      {open && (
        <ul
          id={listId}
          role="listbox"
          className={`absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-[10px] border-[1.5px] py-1 shadow-lg ${
            dark ? "border-white/15 bg-neutral-900" : "border-neutral-200 bg-white"
          }`}
        >
          {matches.length === 0 ? (
            <li className={`px-3.5 py-2.5 text-[13px] ${dark ? "text-white/40" : "text-neutral-400"}`}>
              No state matches “{query}”
            </li>
          ) : (
            matches.map((option, i) => {
              const selected = option === value;
              return (
                <li
                  key={option}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={selected}
                  // pointerdown, not click: the document handler above closes
                  // on pointerdown, which would otherwise unmount the row
                  // before its click ever fired.
                  onPointerDown={(e) => {
                    e.preventDefault();
                    choose(option);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={`flex cursor-pointer items-center justify-between px-3.5 py-2.5 text-[13px] ${
                    i === active ? (dark ? "bg-white/10" : "bg-neutral-100") : ""
                  } ${
                    selected
                      ? dark
                        ? "font-semibold text-white"
                        : "font-semibold text-neutral-900"
                      : dark
                        ? "text-white/80"
                        : "text-neutral-700"
                  }`}
                >
                  {option}
                  {selected && <Check className="h-3.5 w-3.5" aria-hidden />}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
