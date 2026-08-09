"use client";

import { useState, useEffect, useRef } from "react";
import { Link2, Loader2, X, Check } from "lucide-react";
import { catalogueApi, type CanonicalProductResp } from "@gomarket/api-client";

interface Props {
  query: string;
  token: string;
  selected: CanonicalProductResp | null;
  onSelect: (product: CanonicalProductResp | null) => void;
}

// Suggests existing canonical products as the vendor types a product name, so
// they can link their listing instead of minting a duplicate identity. Picking
// none is a valid choice — a fresh canonical product is minted on save. Debounce
// matches AddressSearch.tsx's 350ms.
export default function CanonicalProductTypeahead({ query, token, selected, onSelect }: Props) {
  const [suggestions, setSuggestions] = useState<CanonicalProductResp[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (selected) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    let cancelled = false;
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      catalogueApi
        .searchCanonicalProducts(q, token)
        .then((r) => {
          if (cancelled) return;
          setSuggestions(r.products);
          setOpen(r.products.length > 0);
        })
        .catch(() => {
          if (!cancelled) setSuggestions([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 350);
    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, token, selected]);

  if (selected) {
    return (
      <div
        className="mt-2 flex items-center gap-2 px-3 py-2 rounded-[8px] text-[12px]"
        style={{ background: "#F0FAF3", border: "1px solid rgba(26,122,66,0.2)" }}
      >
        <Link2 className="w-3.5 h-3.5 shrink-0" style={{ color: "#1A7A42" }} />
        <span style={{ color: "#1C1C1C" }}>
          Linked to <strong>{selected.name}</strong>
        </span>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="ml-auto"
          aria-label="Unlink"
        >
          <X className="w-3.5 h-3.5" style={{ color: "#6b7280" }} />
        </button>
      </div>
    );
  }

  if (!open && !loading) return null;

  return (
    <div className="relative mt-2">
      <div
        className="rounded-[10px] border overflow-hidden shadow-sm"
        style={{ background: "#fff", borderColor: "#e2e8f0" }}
      >
        {loading && suggestions.length === 0 ? (
          <div className="flex items-center gap-2 px-3.5 py-2.5 text-[12px]" style={{ color: "#6b7280" }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Checking for matching products…
          </div>
        ) : (
          <>
            <p
              className="px-3.5 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: "#94a3b8" }}
            >
              Link to an existing product
            </p>
            {suggestions.map((p) => (
              <button
                key={p.id}
                type="button"
                onMouseDown={() => {
                  onSelect(p);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-[#F0FAF3] transition-colors border-t"
                style={{ borderColor: "#f1f5f9" }}
              >
                <Check className="w-3.5 h-3.5 shrink-0 opacity-0" />
                <span className="text-[12.5px] font-medium truncate" style={{ color: "#1C1C1C" }}>
                  {p.name}
                </span>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
