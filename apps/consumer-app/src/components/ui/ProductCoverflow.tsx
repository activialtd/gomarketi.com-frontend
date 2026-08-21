import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { type SharedValue } from "react-native-reanimated";
import { Product } from "../../lib/mock-products";
import { formatNaira } from "../../lib/cart-context";
import { color, tint, type, space } from "../../theme/tokens";
import { ITEM_WIDTH, ITEM_GAP, ITEM_SIZE, useCoverflowScroll, useCoverflowItemStyle } from "./coverflow-scroll";

/**
 * A fanned "coverflow" carousel instead of a plain scroll — cards scale up,
 * rise, and go fully opaque as they near the center, and recede on either
 * side. Driven entirely by scroll position on the UI thread (no JS-thread
 * polling), so it stays smooth even while more pages are loading in.
 */
export function ProductCoverflow({
  products,
  onAdd,
  onOpen,
  onEndReached,
}: {
  products: Product[];
  onAdd: (p: Product) => void;
  onOpen: (p: Product) => void;
  /** Fires once when the scroll position comes within ~2 cards of the end. */
  onEndReached?: () => void;
}) {
  const { scrollX, onScroll } = useCoverflowScroll(onEndReached);

  return (
    <Animated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={ITEM_SIZE}
      decelerationRate="fast"
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{
        paddingHorizontal: space.gutter,
        gap: ITEM_GAP,
        paddingVertical: space.md,
      }}
    >
      {products.map((p, i) => (
        <CoverflowCard key={p.id} product={p} index={i} scrollX={scrollX} onAdd={onAdd} onOpen={onOpen} />
      ))}
    </Animated.ScrollView>
  );
}

function CoverflowCard({
  product,
  index,
  scrollX,
  onAdd,
  onOpen,
}: {
  product: Product;
  index: number;
  scrollX: SharedValue<number>;
  onAdd: (p: Product) => void;
  onOpen: (p: Product) => void;
}) {
  const [imgFailed, setImgFailed] = React.useState(false);
  const cover = product.images[0];
  const showImage = !!cover && !imgFailed;

  const style = useCoverflowItemStyle(index, scrollX);

  return (
    <Animated.View style={[s.card, style]}>
      <Pressable onPress={() => onOpen(product)} style={{ flex: 1 }}>
        <View style={[s.imageSlot, { backgroundColor: tint[product.tint] }]}>
          {showImage ? (
            <Image
              source={{ uri: cover }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <Ionicons name={product.icon} size={48} color={color.ink} />
          )}
        </View>
        <View style={s.body}>
          <Text numberOfLines={1} style={s.name}>
            {product.name}
          </Text>
          <Text numberOfLines={1} style={[type.meta, { marginTop: 2 }]}>
            {product.vendor}
          </Text>
          <View style={s.row}>
            <Text style={s.price}>{formatNaira(product.price)}</Text>
            <Pressable
              onPress={() => onAdd(product)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Add ${product.name} to cart`}
            >
              <View style={s.add}>
                <Ionicons name="add" size={20} color={color.onInk} />
              </View>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    width: ITEM_WIDTH,
    borderRadius: 24,
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.line,
    overflow: "hidden",
    shadowColor: "#0A2E1A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 5,
  },
  imageSlot: {
    height: 190,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  body: { padding: space.md },
  name: { fontFamily: "Jakarta_700", fontSize: 15, color: color.text },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: space.sm,
  },
  price: { fontFamily: "Jakarta_700", fontSize: 16, color: color.text },
  add: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: color.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});
