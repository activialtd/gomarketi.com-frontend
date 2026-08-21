import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { type SharedValue } from "react-native-reanimated";
import { CarouselItem } from "../../lib/search-orchestrator";
import { StoreResult } from "../../lib/api-client";
import { categoryMeta } from "../../lib/store-category";
import { color, tint, type, space } from "../../theme/tokens";
import { ITEM_GAP, useCoverflowScroll, useCoverflowItemStyle } from "./coverflow-scroll";

const CARD_WIDTH = 170;

/**
 * The "who else has this" strip above the product grid — one random
 * product per vendor carrying the searched term, so a buyer scoped to
 * "nearest to me" (rather than a named vendor/market) sees who's selling
 * it before diving into the full grid. Reuses ProductCoverflow's exact
 * scroll physics via coverflow-scroll.ts with its own vendor-card renderer.
 */
export function VendorCarousel({
  items,
  onOpenStore,
}: {
  items: CarouselItem[];
  onOpenStore: (s: StoreResult) => void;
}) {
  const { scrollX, onScroll } = useCoverflowScroll();

  return (
    <Animated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={CARD_WIDTH + ITEM_GAP}
      decelerationRate="fast"
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{
        paddingHorizontal: space.gutter,
        gap: ITEM_GAP,
        paddingVertical: space.sm,
      }}
    >
      {items.map((item, i) => (
        <VendorCard key={item.store.id} item={item} index={i} scrollX={scrollX} onPress={() => onOpenStore(item.store)} />
      ))}
    </Animated.ScrollView>
  );
}

function VendorCard({
  item,
  index,
  scrollX,
  onPress,
}: {
  item: CarouselItem;
  index: number;
  scrollX: SharedValue<number>;
  onPress: () => void;
}) {
  const [imgFailed, setImgFailed] = React.useState(false);
  const meta = categoryMeta(item.store.category);
  const cover = item.product.images[0];
  const showImage = !!cover && !imgFailed;
  const style = useCoverflowItemStyle(index, scrollX);

  return (
    <Animated.View style={[s.card, style]}>
      <Pressable onPress={onPress} style={{ flex: 1 }}>
        <View style={[s.thumb, { backgroundColor: tint[meta.tint] }]}>
          {showImage ? (
            <Image
              source={{ uri: cover }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <Ionicons name={meta.icon} size={30} color={color.ink} />
          )}
        </View>
        <View style={s.body}>
          <View style={s.storeRow}>
            <View style={[s.iconChip, { backgroundColor: tint[meta.tint] }]}>
              <Ionicons name="storefront-outline" size={12} color={color.ink} />
            </View>
            <Text numberOfLines={1} style={s.storeName}>
              {item.store.name}
            </Text>
          </View>
          <Text numberOfLines={1} style={[type.meta, { marginTop: 2 }]}>
            {item.store.city ?? meta.label}
            {typeof item.store.distance_km === "number" ? ` · ${item.store.distance_km.toFixed(1)} km` : ""}
          </Text>
          <Text numberOfLines={1} style={s.price}>
            {(item.product.price_kobo / 100).toLocaleString(undefined, { style: "currency", currency: "NGN", maximumFractionDigits: 0 })}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.line,
    overflow: "hidden",
    shadowColor: "#0A2E1A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  thumb: {
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  body: { padding: space.sm },
  storeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  iconChip: {
    width: 20,
    height: 20,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  storeName: { flex: 1, fontFamily: "Jakarta_700", fontSize: 13, color: color.text },
  price: { fontFamily: "Jakarta_700", fontSize: 13, color: color.text, marginTop: 4 },
});
