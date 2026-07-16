import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProductCard } from "./ProductCard";
import { searchProducts, Product } from "../../lib/mock-products";
import { VENDORS } from "../../lib/mock-vendors";
import { useCart } from "../../lib/cart-context";
import { color, type, space, HIT } from "../../theme/tokens";

const { height } = Dimensions.get("window");
const SHEET_H = height * 0.9;

/**
 * Results sheet (90%). Opens ONLY after the walk-to-market animation finishes;
 * results are computed up-front so the door opens onto answers, not a spinner.
 * Vendors stack vertically; products sit in the grid below. Refining the query
 * inside the sheet updates results instantly (no walk replay — the trip
 * already happened).
 */
export function SearchModal({
  visible,
  initialQuery,
  onClose,
  onOpenProduct,
}: {
  visible: boolean;
  initialQuery: string;
  onClose: () => void;
  onOpenProduct: (p: Product) => void;
}) {
  const { add } = useCart();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const reveal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    setQuery(initialQuery);
    setResults(searchProducts(initialQuery)); // TODO(backend): results fetched during the walk
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
    setResults(searchProducts(q));
  };

  const q = query.trim().toLowerCase();
  const vendorHits = VENDORS.filter(
    (v) =>
      q &&
      (v.name.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)),
  );

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

      <View style={s.sheet}>
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
            {/* vendors — vertical stack */}
            {vendorHits.length > 0 && (
              <>
                <Text style={[type.section, s.section]}>Vendors</Text>
                {vendorHits.map((v) => (
                  <View key={v.id} style={s.vendorCard}>
                    <View style={[s.vendorChip, { backgroundColor: v.chipBg }]}>
                      <Text style={[s.vendorChipText, { color: v.chipText }]}>
                        {v.category}
                      </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: space.md }}>
                      <Text style={s.vendorName}>{v.name}</Text>
                      <Text style={type.meta}>{v.activity}</Text>
                    </View>
                    <View style={s.vendorRight}>
                      <View style={s.vendorRating}>
                        <Ionicons name="star" size={11} color={color.ink} />
                        <Text style={s.vendorRatingText}>
                          {v.rating.toFixed(1)}
                        </Text>
                      </View>
                      <Text style={type.meta}>{v.eta}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* products — grid */}
            <Text style={[type.section, s.section]}>
              {q ? `Results for “${query}”` : "Popular right now"}
            </Text>

            {results.length === 0 ? (
              <View style={s.empty}>
                <Text style={[type.label, { fontFamily: "Jakarta_600" }]}>
                  Nothing matched
                </Text>
                <Text style={[type.body, { marginTop: 4 }]}>
                  Try a different word.
                </Text>
              </View>
            ) : (
              <View style={s.grid}>
                {results.map((p) => (
                  <View key={p.id} style={s.cell}>
                    <ProductCard
                      product={p}
                      onAdd={(prod) => add(prod)}
                      onOpen={onOpenProduct}
                    />
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
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

  /* vendors — vertical rows, soft-morphism */
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
  vendorChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  vendorChipText: {
    fontFamily: "Jakarta_600",
    fontSize: 10,
    letterSpacing: 0.8,
  },
  vendorName: { fontFamily: "Jakarta_600", fontSize: 15, color: color.text },
  vendorRight: { alignItems: "flex-end", gap: 3 },
  vendorRating: { flexDirection: "row", alignItems: "center", gap: 3 },
  vendorRatingText: {
    fontFamily: "Jakarta_700",
    fontSize: 12,
    color: color.ink,
  },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  cell: { width: "47.6%" },
  empty: { alignItems: "center", paddingTop: 40 },
});
