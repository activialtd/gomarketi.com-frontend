"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Search, Loader2, X } from "lucide-react";
import { NIGERIAN_STATES } from "@gomarket/shared-utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type G = any;

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

export interface AddressResult {
  fullAddress: string;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
}

interface Props {
  onSelect: (result: AddressResult) => void;
  defaultValue?: string;
}

// ── Google Maps script loader ─────────────────────────────────────────────────
// Uses loading=async in the URL (the correct best-practice flag per Google docs)
// and v=weekly to access the latest stable Places API (AutocompleteSuggestion).

let scriptState: "idle" | "loading" | "ready" = "idle";
const readyCallbacks: Array<() => void> = [];

function loadGoogleMaps(onReady: () => void) {
  const g = (): G => (window as G).google;

  if (scriptState === "ready" || g()?.maps?.places) {
    scriptState = "ready";
    onReady();
    return;
  }

  readyCallbacks.push(onReady);

  if (scriptState === "loading") return;
  scriptState = "loading";

  const id = "google-maps-places-v2";
  if (document.getElementById(id)) return;

  // loading=async → tells the Maps SDK to initialise without blocking the page.
  // v=weekly   → gives access to AutocompleteSuggestion + Place (new APIs).
  // libraries=places → required for both old and new Places APIs.
  const el = document.createElement("script");
  el.id = id;
  el.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places&v=weekly&loading=async`;
  el.async = true;
  el.defer = true;
  el.onload = () => {
    scriptState = "ready";
    readyCallbacks.splice(0).forEach((cb) => cb());
  };
  document.head.appendChild(el);
}

function useGoogleMapsLoaded() {
  const [loaded, setLoaded] = useState(scriptState === "ready");
  useEffect(() => {
    if (!MAPS_KEY) return;
    loadGoogleMaps(() => setLoaded(true));
  }, []);
  return loaded;
}

// ── Google Places search using the new (March 2025) APIs ─────────────────────
// AutocompleteSuggestion replaces AutocompleteService (callback-based, legacy).
// Place.fetchFields()   replaces PlacesService.getDetails() (callback-based).

function GooglePlacesSearch({ onSelect, defaultValue }: Props) {
  const [query, setQuery] = useState(defaultValue ?? "");
  const [suggestions, setSuggestions] = useState<G[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionTokenRef = useRef<G>(null);

  // Create a new autocomplete session token (improves billing accuracy)
  useEffect(() => {
    const g = (window as G).google;
    if (g?.maps?.places?.AutocompleteSessionToken) {
      sessionTokenRef.current = new g.maps.places.AutocompleteSessionToken();
    }
  }, []);

  async function search(text: string) {
    if (text.length < 3) { setSuggestions([]); return; }
    const g = (window as G).google;
    if (!g?.maps?.places?.AutocompleteSuggestion) return;

    setLoading(true);
    try {
      // New API: AutocompleteSuggestion (async, no callback needed)
      const { suggestions: results } = await g.maps.places.AutocompleteSuggestion
        .fetchAutocompleteSuggestions({
          input: text,
          includedRegionCodes: ["ng"], // Nigeria only
          sessionToken: sessionTokenRef.current,
        });
      setSuggestions(results ?? []);
      if ((results ?? []).length > 0) setOpen(true);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }

  function handleInput(v: string) {
    setQuery(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(v), 350);
  }

  async function handleSelect(suggestion: G) {
    const pred = suggestion.placePrediction;
    setQuery(pred?.text?.text ?? "");
    setOpen(false);
    setSuggestions([]);

    try {
      // New API: Place.fetchFields() (async, no callback needed)
      const place = pred.toPlace();
      await place.fetchFields({
        fields: ["addressComponents", "location", "formattedAddress"],
      });

      let city = "";
      let state = "";
      for (const comp of (place.addressComponents ?? [])) {
        const types: string[] = comp.types ?? [];
        if (types.includes("locality") || types.includes("sublocality_level_1")) {
          city ||= comp.longText ?? "";
        }
        if (types.includes("administrative_area_level_1")) {
          state = (comp.longText ?? "").replace(/\s+State$/i, "");
        }
      }

      // Rotate session token after a complete autocomplete→details cycle
      const g = (window as G).google;
      if (g?.maps?.places?.AutocompleteSessionToken) {
        sessionTokenRef.current = new g.maps.places.AutocompleteSessionToken();
      }

      onSelect({
        fullAddress: place.formattedAddress ?? pred?.text?.text ?? "",
        city,
        state,
        lat: place.location?.lat?.(),
        lng: place.location?.lng?.(),
      });
    } catch {
      // If detail fetch fails, fall back to the suggestion text
      onSelect({
        fullAddress: pred?.text?.text ?? "",
        city: "",
        state: "",
      });
    }
  }

  const baseInput = "w-full h-11 rounded-[10px] border text-[13px] outline-none transition-all";

  return (
    <div className="relative">
      <div className="relative">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: "#94a3b8" }}
        />
        <input
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="Search for your business address in Nigeria…"
          className={`${baseInput} pl-10 pr-10`}
          style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#1C1C1C" }}
        />
        {loading && (
          <Loader2
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin pointer-events-none"
            style={{ color: "#1A7A42" }}
          />
        )}
        {query && !loading && (
          <button
            type="button"
            onClick={() => { setQuery(""); setSuggestions([]); setOpen(false); }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4" style={{ color: "#94a3b8" }} />
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div
          className="absolute top-12 left-0 right-0 z-50 rounded-[12px] border overflow-hidden shadow-xl"
          style={{ background: "#fff", borderColor: "#e2e8f0" }}
        >
          {suggestions.map((s: G, i: number) => {
            const pred = s.placePrediction;
            const main = pred?.structuredFormat?.mainText?.text ?? pred?.text?.text ?? "";
            const secondary = pred?.structuredFormat?.secondaryText?.text ?? "";
            return (
              <button
                key={pred?.placeId ?? i}
                type="button"
                onMouseDown={() => handleSelect(s)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[#F0FAF3] transition-colors border-b last:border-0"
                style={{ borderColor: "#f1f5f9" }}
              >
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#1A7A42" }} />
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: "#1C1C1C" }}>{main}</p>
                  {secondary && (
                    <p className="text-[11px]" style={{ color: "#6b7280" }}>{secondary}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Manual fallback (when no Google Maps key is configured) ───────────────────

function ManualAddressForm({ onSelect, defaultValue }: Props) {
  const [street, setStreet] = useState(defaultValue ?? "");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  function commit() {
    if (!street.trim() || !city.trim() || !state) return;
    onSelect({ fullAddress: `${street}, ${city}, ${state}`, city, state });
  }

  const inp = "w-full h-11 px-3.5 rounded-[10px] border text-[13px] outline-none transition-all";
  const s = { borderColor: "#e2e8f0", background: "#f8fafc", color: "#1C1C1C" };

  return (
    <div className="space-y-3">
      <div className="relative">
        <MapPin
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: "#94a3b8" }}
        />
        <input
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          onBlur={commit}
          placeholder="Street address"
          className={`${inp} pl-10`}
          style={s}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onBlur={commit}
          placeholder="City / LGA"
          className={inp}
          style={s}
        />
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          onBlur={commit}
          className={inp}
          style={{ ...s, appearance: "none" as const }}
        >
          <option value="">State</option>
          {NIGERIAN_STATES.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function AddressSearch({ onSelect, defaultValue }: Props) {
  const mapsLoaded = useGoogleMapsLoaded();

  if (MAPS_KEY && mapsLoaded) {
    return <GooglePlacesSearch onSelect={onSelect} defaultValue={defaultValue} />;
  }

  if (MAPS_KEY && !mapsLoaded) {
    return (
      <div
        className="flex items-center gap-2 h-11 px-4 rounded-[10px] border"
        style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}
      >
        <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#1A7A42" }} />
        <span className="text-[13px]" style={{ color: "#6b7280" }}>Loading map search…</span>
      </div>
    );
  }

  return <ManualAddressForm onSelect={onSelect} defaultValue={defaultValue} />;
}
