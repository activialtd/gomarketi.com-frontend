"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

// ── Google Places version ─────────────────────────────────────────────────────

function GooglePlacesSearch({ onSelect, defaultValue }: Props) {
  const [query, setQuery] = useState(defaultValue ?? "");
  const [predictions, setPredictions] = useState<G[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const acService = useRef<G>(null);
  const placesService = useRef<G>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const g = (): G => (window as G).google;

  useEffect(() => {
    const maps = g()?.maps;
    if (!maps?.places) return;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    acService.current = new maps.places.AutocompleteService() as G;
    const dummy = document.createElement("div");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    placesService.current = new maps.places.PlacesService(dummy) as G;
  }, []);

  const search = useCallback((text: string) => {
    if (!acService.current || text.length < 3) { setPredictions([]); return; }
    setLoading(true);
    acService.current.getPlacePredictions(
      { input: text, componentRestrictions: { country: "ng" }, types: ["geocode", "establishment"] },
      (results: G, status: G) => {
        setLoading(false);
        if (status === g()?.maps?.places?.PlacesServiceStatus?.OK && results) {
          setPredictions(results);
          setOpen(true);
        } else {
          setPredictions([]);
        }
      }
    );
  }, []);

  function handleInput(v: string) {
    setQuery(v);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => search(v), 350);
  }

  function handleSelect(pred: G) {
    setQuery(pred.description);
    setOpen(false);
    setPredictions([]);
    if (!placesService.current) return;

    placesService.current.getDetails(
      { placeId: pred.place_id, fields: ["address_components", "geometry", "formatted_address"] },
      (result: G, status: G) => {
        if (status !== g()?.maps?.places?.PlacesServiceStatus?.OK || !result) return;
        const comps: G[] = result.address_components ?? [];
        let city = "";
        let state = "";
        for (const c of comps) {
          if (c.types.includes("locality") || c.types.includes("sublocality_level_1")) city ||= c.long_name;
          if (c.types.includes("administrative_area_level_1")) state = c.long_name.replace(/\s+State$/i, "");
        }
        onSelect({
          fullAddress: result.formatted_address ?? pred.description,
          city,
          state,
          lat: result.geometry?.location?.lat(),
          lng: result.geometry?.location?.lng(),
        });
      }
    );
  }

  const baseInput = "w-full h-11 rounded-[10px] border text-[13px] outline-none transition-all";

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#94a3b8" }} />
        <input
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => predictions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="Search for your business address in Nigeria…"
          className={`${baseInput} pl-10 pr-10`}
          style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#1C1C1C" }}
        />
        {loading && <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin pointer-events-none" style={{ color: "#1A7A42" }} />}
        {query && !loading && (
          <button type="button" onClick={() => { setQuery(""); setPredictions([]); setOpen(false); }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4" style={{ color: "#94a3b8" }} />
          </button>
        )}
      </div>
      {open && predictions.length > 0 && (
        <div className="absolute top-12 left-0 right-0 z-50 rounded-[12px] border overflow-hidden shadow-xl"
          style={{ background: "#fff", borderColor: "#e2e8f0" }}>
          {predictions.map((p: G) => (
            <button key={p.place_id} type="button" onMouseDown={() => handleSelect(p)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[#F0FAF3] transition-colors border-b last:border-0"
              style={{ borderColor: "#f1f5f9" }}>
              <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#1A7A42" }} />
              <div>
                <p className="text-[13px] font-semibold" style={{ color: "#1C1C1C" }}>{p.structured_formatting?.main_text}</p>
                <p className="text-[11px]" style={{ color: "#6b7280" }}>{p.structured_formatting?.secondary_text}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Manual fallback ───────────────────────────────────────────────────────────

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
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#94a3b8" }} />
        <input value={street} onChange={(e) => setStreet(e.target.value)} onBlur={commit}
          placeholder="Street address" className={`${inp} pl-10`} style={s} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input value={city} onChange={(e) => setCity(e.target.value)} onBlur={commit}
          placeholder="City / LGA" className={inp} style={s} />
        <select value={state} onChange={(e) => setState(e.target.value)} onBlur={commit}
          className={inp} style={{ ...s, appearance: "none" as const }}>
          <option value="">State</option>
          {NIGERIAN_STATES.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
    </div>
  );
}

// ── Google Maps loader ────────────────────────────────────────────────────────

function useGoogleMapsLoaded() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!MAPS_KEY) return;
    if ((window as G).google?.maps?.places) { setLoaded(true); return; }
    const id = "google-maps-places-script";
    if (!document.getElementById(id)) {
      const el = document.createElement("script");
      el.id = id;
      el.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places`;
      el.async = true;
      el.onload = () => setLoaded(true);
      document.head.appendChild(el);
    } else {
      const check = setInterval(() => {
        if ((window as G).google?.maps?.places) { setLoaded(true); clearInterval(check); }
      }, 200);
      return () => clearInterval(check);
    }
  }, []);
  return loaded;
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function AddressSearch({ onSelect, defaultValue }: Props) {
  const mapsLoaded = useGoogleMapsLoaded();

  if (MAPS_KEY && mapsLoaded) {
    return <GooglePlacesSearch onSelect={onSelect} defaultValue={defaultValue} />;
  }

  if (MAPS_KEY && !mapsLoaded) {
    return (
      <div className="flex items-center gap-2 h-11 px-4 rounded-[10px] border" style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}>
        <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#1A7A42" }} />
        <span className="text-[13px]" style={{ color: "#6b7280" }}>Loading map search…</span>
      </div>
    );
  }

  return <ManualAddressForm onSelect={onSelect} defaultValue={defaultValue} />;
}
