import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Image,
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Reanimated, { useAnimatedStyle } from "react-native-reanimated";
import { StoreResult } from "../../lib/api-client";
import { useProductSearch } from "../../hooks/useProductSearch";
import { useCart } from "../../lib/cart-context";
import { useNav } from "../../navigation/nav-context";
import { ProductGrid } from "./ProductGrid";
import { VendorCarousel } from "./VendorCarousel";
import { useKeyboardHeight } from "../../hooks/useKeyboardHeight";
import { color, type, space, HIT } from "../../theme/tokens";

const { height } = Dimensions.get("window");
const SHEET_H = height * 0.9;

/**
 * Results sheet (90%). Opens ONLY after the walk-to-market animation finishes;
 * the initial search fires as soon as the walk starts (via useProductSearch's
 * own debounce) so results are ready by the time the door opens. Refining the
 * query inside the sheet re-resolves scope and re-queries — no walk replay,
 * the trip already happened.
 *
 * Product-first: a grid of matching products across vendors, with a
 * swipeable "who else has this" carousel above it when the query didn't
 * name a specific vendor or market (see useProductSearch/search-orchestrator).
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
  const reveal = useRef(new Animated.Value(0)).current;
  const keyboardHeight = useKeyboardHeight();
  const { add } = useCart();
  const { push } = useNav();

  const {
    gridProducts,
    vendors,
    relatedProducts,
    suggestions,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    carouselItems,
    showCarousel,
    vendorToStore,
  } = useProductSearch(query, { lat, lng });

  // The sheet rises by the keyboard's own height as it appears, so the
  // refine bar always ends up sitting just above the qwerty keys instead of
  // being covered or leaving an awkward gap.
  const keyboardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -keyboardHeight.value }],
  }));

  useEffect(() => {
    if (!visible) return;
    setQuery(initialQuery);
    reveal.setValue(0);
    Animated.timing(reveal, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible, initialQuery]);

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

  const heading = query ? `Products for "${query}"` : "Products near you";
  const nothingMatched = gridProducts.length === 0 && vendors.length === 0;

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
            onChangeText={setQuery}
            returnKeyType="search"
            placeholder="Refine your search"
            placeholderTextColor={color.textFaint}
            style={s.barInput}
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => setQuery("")}
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
            <Text style={[type.section, s.section]}>{heading}</Text>

            {loading ? (
              <View style={s.empty}>
                <ActivityIndicator color={color.primary} />
              </View>
            ) : nothingMatched ? (
              <View style={s.empty}>
                <Text style={[type.label, { fontFamily: "Jakarta_600" }]}>
                  Nothing matched
                </Text>
                <Text style={[type.body, { marginTop: 4 }]}>
                  {suggestions.length > 0
                    ? "Did you mean:"
                    : "Try a different word."}
                </Text>
                <View style={s.chipRow}>
                  {suggestions.map((sg) => (
                    <Pressable
                      key={sg}
                      onPress={() => setQuery(sg)}
                      style={s.chip}
                    >
                      <Text style={s.chipText}>{sg}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              <>
                {vendors.length > 0 && (
                  <View style={s.vendorWrap}>
                    <Text style={type.meta}>
                      {vendors.length === 1 ? "Vendor" : "Vendors"}
                    </Text>
                    {vendors.slice(0, 5).map((v) => (
                      <Pressable
                        key={v.id}
                        onPress={() => onOpenStore(vendorToStore(v))}
                        style={s.vendorRow}
                      >
                        <View style={s.vendorAvatar}>
                          {v.logo_url ? (
                            <Image
                              source={{ uri: v.logo_url }}
                              style={s.vendorLogo}
                              resizeMode="cover"
                            />
                          ) : (
                            <Ionicons
                              name="storefront-outline"
                              size={18}
                              color={color.primary}
                            />
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            numberOfLines={1}
                            style={[type.label, { fontFamily: "Jakarta_600" }]}
                          >
                            {v.name}
                          </Text>
                          <Text numberOfLines={1} style={type.meta}>
                            {[
                              v.market_name ?? v.city,
                              `${v.product_count} ${
                                v.product_count === 1 ? "product" : "products"
                              }`,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={color.textFaint}
                        />
                      </Pressable>
                    ))}
                  </View>
                )}

                {gridProducts.length > 0 && showCarousel && (
                  <View style={s.carouselWrap}>
                    <Text style={type.meta}>Also sold by</Text>
                    <View style={s.carouselBleed}>
                      <VendorCarousel
                        items={carouselItems}
                        onOpenStore={onOpenStore}
                      />
                    </View>
                  </View>
                )}
                <ProductGrid
                  products={gridProducts}
                  onAdd={(p) => add(p)}
                  onOpen={(p) =>
                    push("product", { productId: p.id, product: p })
                  }
                  onEndReached={hasMore ? loadMore : undefined}
                  loadingMore={loadingMore}
                />

                {relatedProducts.length > 0 && (
                  <>
                    <Text style={[type.section, s.section]}>
                      You might also like
                    </Text>
                    <ProductGrid
                      products={relatedProducts}
                      onAdd={(p) => add(p)}
                      onOpen={(p) =>
                        push("product", { productId: p.id, product: p })
                      }
                    />
                  </>
                )}
              </>
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
  carouselWrap: { marginBottom: space.lg },
  // VendorCarousel supplies its own space.gutter inset in its
  // contentContainerStyle (designed to sit full-bleed, per ProductCoverflow's
  // convention) — cancel the sheet's ambient paddingHorizontal here so it
  // isn't inset twice relative to the heading/grid around it.
  carouselBleed: { marginHorizontal: -space.gutter },

  empty: { alignItems: "center", paddingTop: 40 },

  vendorWrap: { marginBottom: space.lg, gap: space.sm },
  vendorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: 16,
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.line,
  },
  vendorLogo: { width: "100%", height: "100%", borderRadius: 18 },
  vendorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.canvas,
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: space.sm,
    marginTop: space.md,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.line,
  },
  chipText: { fontFamily: "Jakarta_500", fontSize: 13, color: color.text },
});
