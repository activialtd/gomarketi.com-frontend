import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { useOrders, OrderStatus } from "../../lib/orders-context";
import { color, type, space } from "../../theme/tokens";

/**
 * Live tracking. Courier position is MOCKED (vendor → home interpolation).
 * TODO(backend): feed real courier GPS into `pos`.
 *
 * MAP PROVIDER: defaults to Apple Maps (renders with no API key).
 * When your Google key is in app.json AND you've rebuilt with
 * `npx expo run:ios` AND "Maps SDK for iOS" is enabled in Google Cloud
 * Console, flip USE_GOOGLE to true.
 */
const USE_GOOGLE = false;

const VENDOR = { latitude: 9.0643, longitude: 7.4892 };
const HOME = { latitude: 9.0765, longitude: 7.3986 };

const STEPS: { key: OrderStatus; label: string; icon: any }[] = [
  { key: "confirmed", label: "Confirmed", icon: "checkmark-circle" },
  { key: "preparing", label: "Preparing", icon: "restaurant" },
  { key: "on_the_way", label: "On the way", icon: "bicycle" },
  { key: "delivered", label: "Delivered", icon: "home" },
];

export function TrackOrderScreen({ orderId }: { orderId?: string }) {
  const { orders, advance } = useOrders();
  const order = orders.find((o) => o.id === orderId) ?? orders[0];

  const [t, setT] = useState(0);
  const tRef = useRef(0); // current progress, readable inside the interval
  const statusRef = useRef(order?.status); // avoids stale-closure status checks
  statusRef.current = order?.status;

  useEffect(() => {
    if (!order || order.status === "delivered") return;

    const iv = setInterval(() => {
      // 1. compute next progress OUTSIDE any state updater
      const next = Math.min(tRef.current + 0.04, 1);
      tRef.current = next;
      setT(next); // pure set — no side effects inside

      // 2. side effects happen here, in the interval callback (not render phase)
      const status = statusRef.current;
      if (next >= 1 && status === "on_the_way") advance(order.id);
      else if (next > 0.3 && status === "preparing") advance(order.id);
      else if (next > 0.1 && status === "confirmed") advance(order.id);
    }, 2000);

    return () => clearInterval(iv);
  }, [order?.id, order?.status]);

  if (!order) {
    return (
      <SafeAreaView style={s.root} edges={["top"]}>
        <ScreenHeader title="Track order" />
        <View style={s.center}>
          <Text style={type.body}>No order found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const pos = {
    latitude: VENDOR.latitude + (HOME.latitude - VENDOR.latitude) * t,
    longitude: VENDOR.longitude + (HOME.longitude - VENDOR.longitude) * t,
  };

  const activeIdx = STEPS.findIndex((st) => st.key === order.status);

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <ScreenHeader title={`Order #${order.reference.slice(-8)}`} />

      <MapView
        {...(USE_GOOGLE ? { provider: PROVIDER_GOOGLE } : {})}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: (VENDOR.latitude + HOME.latitude) / 2,
          longitude: (VENDOR.longitude + HOME.longitude) / 2,
          latitudeDelta: 0.09,
          longitudeDelta: 0.09,
        }}
      >
        <Marker coordinate={VENDOR} title="Vendor" pinColor={color.primary} />
        <Marker coordinate={HOME} title="You" pinColor={color.ink} />
        <Marker coordinate={pos} title="Courier">
          <View style={s.courier}>
            <Ionicons name="bicycle" size={16} color={color.onInk} />
          </View>
        </Marker>
        <Polyline
          coordinates={[VENDOR, HOME]}
          strokeColor={color.primary}
          strokeWidth={3}
        />
      </MapView>

      <View style={s.panel}>
        <View style={s.steps}>
          {STEPS.map((st, i) => (
            <View key={st.key} style={s.step}>
              <View style={[s.stepDot, i <= activeIdx && s.stepDotOn]}>
                <Ionicons
                  name={st.icon}
                  size={14}
                  color={i <= activeIdx ? color.onInk : color.textFaint}
                />
              </View>
              <Text
                style={[s.stepLabel, i <= activeIdx && { color: color.text }]}
              >
                {st.label}
              </Text>
            </View>
          ))}
        </View>
        <Text style={[type.body, { textAlign: "center", marginTop: space.md }]}>
          Delivering to: {order.address}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.canvas },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  courier: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: color.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: color.card,
  },
  panel: {
    backgroundColor: color.card,
    borderTopWidth: 1,
    borderColor: color.line,
    paddingHorizontal: space.gutter,
    paddingTop: space.lg,
    paddingBottom: 28,
  },
  steps: { flexDirection: "row", justifyContent: "space-between" },
  step: { alignItems: "center", flex: 1 },
  stepDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: color.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotOn: { backgroundColor: color.primary },
  stepLabel: {
    fontFamily: "Jakarta_500",
    fontSize: 11,
    color: color.textFaint,
    marginTop: 6,
  },
});
