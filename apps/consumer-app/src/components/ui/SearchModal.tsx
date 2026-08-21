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
import { StoreResult } from "../../lib/api-client";
import { useProductSearch } from "../../hooks/useProductSearch";
import { useCart } from "../../lib/cart-context";
import { useNav } from "../../navigation/AppNavigator";
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
    loading,
    loadingMore,
    hasMore,
    loadMore,
    carouselItems,
    showCarousel,
    matchType,
    matchedStore,
    matchedMarketName,
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

  const heading =
    matchType === "vendor" && matchedStore
      ? `Products at ${matchedStore.name}`
      : matchType === "market" && matchedMarketName
        ? `Products in ${matchedMarketName}`
        : query
          ? `Products for "${query}"`
          : "Products near you";

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
            ) : gridProducts.length === 0 ? (
              <View style={s.empty}>
                <Text style={[type.label, { fontFamily: "Jakarta_600" }]}>
                  Nothing matched
                </Text>
                <Text style={[type.body, { marginTop: 4 }]}>
                  Try a different word.
                </Text>
              </View>
            ) : (
              <>
                {showCarousel && (
                  <View style={s.carouselWrap}>
                    <Text style={type.meta}>Also sold by</Text>
                    <View style={s.carouselBleed}>
                      <VendorCarousel items={carouselItems} onOpenStore={onOpenStore} />
                    </View>
                  </View>
                )}
                <ProductGrid
                  products={gridProducts}
                  onAdd={(p) => add(p)}
                  onOpen={(p) => push("product", { productId: p.id, product: p })}
                  onEndReached={hasMore ? loadMore : undefined}
                  loadingMore={loadingMore}
                />
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
});
