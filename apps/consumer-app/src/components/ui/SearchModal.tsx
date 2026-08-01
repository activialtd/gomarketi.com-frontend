import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Reanimated, { useAnimatedStyle } from "react-native-reanimated";
import { searchStores, StoreResult } from "../../lib/api-client";
import { categoryMeta } from "../../lib/store-category";
import { useKeyboardHeight } from "../../hooks/useKeyboardHeight";
import { color, tint, type, space, HIT } from "../../theme/tokens";

const { height } = Dimensions.get("window");
const SHEET_H = height * 0.9;
const REFINE_DEBOUNCE_MS = 350;

/**
 * Results sheet (90%). Opens ONLY after the walk-to-market animation finishes;
 * the initial search fires as soon as the walk starts so results are ready
 * by the time the door opens. Refining the query inside the sheet re-queries
 * (debounced) — no walk replay, the trip already happened.
 */
export function SearchModal({
  visible,
  initialQuery,
  lat,
  lng,
  onClose,
  onOpenStore,
}: {
  visible: boolean;
  initialQuery: string;
  lat?: number;
  lng?: number;
  onClose: () => void;
  onOpenStore: (s: StoreResult) => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<StoreResult[]>([]);
  const [loading, setLoading] = useState(false);
  const reveal = useRef(new Animated.Value(0)).current;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyboardHeight = useKeyboardHeight();

  // The sheet rises by the keyboard's own height as it appears, so the
  // refine bar always ends up sitting just above the qwerty keys instead of
  // being covered or leaving an awkward gap.
  const keyboardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -keyboardHeight.value }],
  }));

  const runSearch = (q: string) => {
    setLoading(true);
    searchStores({ q: q || undefined, lat, lng })
      .then((page) => setResults(page.stores))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!visible) return;
    setQuery(initialQuery);
    runSearch(initialQuery);
    reveal.setValue(0);
    Animated.timing(reveal, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible, initialQuery]);

  const refine = (q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(q), REFINE_DEBOUNCE_MS);
  };

  const rise = {
    opacity: reveal,
    transform: [
      {
        translateY: reveal.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={s.scrim}
        onPress={onClose}
        accessibilityLabel="Close search"
      />

      <Reanimated.View style={[s.sheet, keyboardStyle]}>
        <View style={s.grabber} />

        {/* refine bar */}
        <View style={s.bar}>
          <Ionicons name="search" size={18} color={color.textMuted} />
          <TextInput
            value={query}
            onChangeText={refine}
            returnKeyType="search"
            placeholder="Refine your search"
            placeholderTextColor={color.textFaint}
            style={s.barInput}
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => refine("")}
              hitSlop={HIT}
              accessibilityLabel="Clear"
            >
              <Ionicons name="close-circle" size={18} color={color.textFaint} />
            </Pressable>
          )}
        </View>

        <Animated.View style={[{ flex: 1 }, rise]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60 }}
          >
            <Text style={[type.section, s.section]}>
              {query ? `Stores for "${query}"` : "Stores near you"}
            </Text>

            {loading ? (
              <View style={s.empty}>
                <ActivityIndicator color={color.primary} />
              </View>
            ) : results.length === 0 ? (
              <View style={s.empty}>
                <Text style={[type.label, { fontFamily: "Jakarta_600" }]}>
                  Nothing matched
                </Text>
                <Text style={[type.body, { marginTop: 4 }]}>
                  Try a different word.
                </Text>
              </View>
            ) : (
              results.map((st) => {
                const meta = categoryMeta(st.category);
                return (
                  <Pressable
                    key={st.id}
                    style={s.vendorCard}
                    onPress={() => onOpenStore(st)}
                  >
                    <View style={[s.vendorChip, { backgroundColor: tint[meta.tint] }]}>
                      <Ionicons name={meta.icon} size={20} color={color.ink} />
                    </View>
                    <View style={{ flex: 1, marginLeft: space.md }}>
                      <Text style={s.vendorName}>{st.name}</Text>
                      <Text style={type.meta} numberOfLines={1}>
                        {st.tagline ?? st.address ?? meta.label}
                      </Text>
                    </View>
                    <View style={s.vendorRight}>
                      <Text style={[type.meta, { fontFamily: "Jakarta_600", color: color.ink }]}>
                        {meta.label}
                      </Text>
                      {typeof st.distance_km === "number" && (
                        <Text style={type.meta}>{st.distance_km.toFixed(1)} km away</Text>
                      )}
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </Animated.View>
      </Reanimated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: "rgba(12,20,15,0.35)" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: SHEET_H,
    backgroundColor: color.canvas,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: space.gutter,
    shadowColor: "#0A2E1A",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.lineStrong,
    marginTop: 10,
    marginBottom: space.md,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    height: 52,
    borderRadius: 26,
    paddingHorizontal: space.lg,
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.line,
    shadowColor: "#0A2E1A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  barInput: {
    flex: 1,
    fontFamily: "Jakarta_500",
    fontSize: 15,
    color: color.text,
    padding: 0,
  },

  section: { marginTop: space.xl, marginBottom: space.md },

  vendorCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: space.lg,
    borderRadius: 20,
    marginBottom: space.md,
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.line,
    shadowColor: "#0A2E1A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  vendorChip: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: color.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  vendorName: { fontFamily: "Jakarta_600", fontSize: 15, color: color.text },
  vendorRight: { alignItems: "flex-end", gap: 3 },

  empty: { alignItems: "center", paddingTop: 40 },
});
