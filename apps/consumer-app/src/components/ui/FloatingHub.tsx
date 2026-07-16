import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNav, ScreenName } from "../../navigation/AppNavigator";
import { useCart } from "../../lib/cart-context";
import { color } from "../../theme/tokens";

/**
 * Floating hub — replaces a tab bar. Collapsed: one dark-green orb.
 * Expanded: vertical stack of destinations. Cart shows a live badge.
 */
const ACTIONS: {
  name: ScreenName;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}[] = [
  { name: "cart", icon: "cart-outline", label: "Cart" },
  { name: "orders", icon: "receipt-outline", label: "Orders" },
  { name: "notifications", icon: "notifications-outline", label: "Alerts" },
  { name: "profile", icon: "person-outline", label: "Profile" },
];

export function FloatingHub() {
  const [open, setOpen] = useState(false);
  const { push, current, reset } = useNav();
  const { count } = useCart();

  const go = (name: ScreenName) => {
    setOpen(false);
    if (name !== current.name) push(name);
  };

  return (
    <View pointerEvents="box-none" style={s.layer}>
      {open && (
        <Pressable
          style={s.scrim}
          onPress={() => setOpen(false)}
          accessibilityLabel="Close menu"
        />
      )}

      <View style={s.column} pointerEvents="box-none">
        {open &&
          ACTIONS.map((a) => (
            <Pressable
              key={a.name}
              onPress={() => go(a.name)}
              accessibilityRole="button"
              accessibilityLabel={a.label}
            >
              <View style={s.item}>
                <Text style={s.itemLabel}>{a.label}</Text>
                <View style={s.itemIcon}>
                  <Ionicons name={a.icon} size={20} color={color.ink} />
                  {a.name === "cart" && count > 0 && (
                    <View style={s.badge}>
                      <Text style={s.badgeText}>{count}</Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          ))}

        {open && current.name !== "home" && (
          <Pressable
            onPress={() => {
              setOpen(false);
              reset("home");
            }}
            accessibilityLabel="Home"
          >
            <View style={s.item}>
              <Text style={s.itemLabel}>Home</Text>
              <View style={s.itemIcon}>
                <Ionicons name="home-outline" size={20} color={color.ink} />
              </View>
            </View>
          </Pressable>
        )}

        <Pressable
          onPress={() => setOpen(!open)}
          accessibilityRole="button"
          accessibilityLabel={open ? "Close menu" : "Open menu"}
        >
          <View style={s.orb}>
            <Ionicons
              name={open ? "close" : "grid-outline"}
              size={24}
              color={color.onInk}
            />
            {!open && count > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{count}</Text>
              </View>
            )}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFill },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(12,20,15,0.25)",
  },
  column: {
    position: "absolute",
    right: 20,
    bottom: 40,
    alignItems: "flex-end",
    gap: 10,
  },

  orb: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: color.ink,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0A2E1A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
  },

  item: { flexDirection: "row", alignItems: "center", gap: 10 },
  itemLabel: {
    fontFamily: "Jakarta_600",
    fontSize: 13,
    color: color.card,
    backgroundColor: "rgba(10,46,26,0.85)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: color.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: color.lineStrong,
  },

  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: color.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontFamily: "Jakarta_700", fontSize: 11, color: color.onInk },
});
