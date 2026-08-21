import { useState, useEffect, useCallback } from "react";
import * as Location from "expo-location";

export type LocationStatus = "idle" | "loading" | "granted" | "denied";

export type LocationState = {
  status: LocationStatus;
  city: string | null;
  region: string | null;
  /** Best-effort street-level address ("12 Adeola Odeku St, Victoria Island, Lagos") — for pre-filling a delivery address, not just the city label. */
  address: string | null;
  coords: { latitude: number; longitude: number } | null;
};

/**
 * Foreground location for delivery context.
 *
 * Requests permission, resolves a human-readable city via reverse geocode,
 * and exposes a `request()` to retry (e.g. when the user taps "Set location"
 * after denying). Fails soft — a denied permission never blocks the UI.
 *
 * app.json needs the iOS usage string + the expo-location plugin (see setup).
 */
export function useLocation() {
  const [state, setState] = useState<LocationState>({
    status: "idle",
    city: null,
    region: null,
    address: null,
    coords: null,
  });

  const request = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading" }));

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setState({ status: "denied", city: null, region: null, address: null, coords: null });
      return;
    }

    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };

      let city: string | null = null;
      let region: string | null = null;
      let address: string | null = null;
      try {
        const geo = await Location.reverseGeocodeAsync(coords);
        if (geo[0]) {
          city = geo[0].city ?? geo[0].subregion ?? geo[0].district ?? null;
          region = geo[0].region ?? geo[0].country ?? null;
          const street = geo[0].name ?? geo[0].street ?? null;
          address = [street, city, region].filter(Boolean).join(", ") || null;
        }
      } catch {
        // reverse geocode is best-effort; coords alone still work
      }

      setState({ status: "granted", city, region, address, coords });
    } catch {
      setState({ status: "denied", city: null, region: null, address: null, coords: null });
    }
  }, []);

  useEffect(() => {
    request();
  }, [request]);

  return { ...state, request };
}
