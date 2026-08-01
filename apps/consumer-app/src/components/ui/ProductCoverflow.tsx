import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
  runOnJS,
  type SharedValue,
} from "react-native-reanimated";
import { Product } from "../../lib/mock-products";
import { formatNaira } from "../../lib/cart-context";
import { color, tint, type, space } from "../../theme/tokens";

const ITEM_WIDTH = 210;
const ITEM_GAP = space.md;
const ITEM_SIZE = ITEM_WIDTH + ITEM_GAP;

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
  const scrollX = useSharedValue(0);
  const firedEndReached = useSharedValue(false);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
    if (!onEndReached) return;
    const distanceFromEnd =
      e.contentSize.width - e.layoutMeasurement.width - e.contentOffset.x;
    if (distanceFromEnd < ITEM_SIZE * 2 && !firedEndReached.value) {
      firedEndReached.value = true;
      runOnJS(onEndReached)();
    } else if (distanceFromEnd >= ITEM_SIZE * 2) {
      firedEndReached.value = false;
    }
  });

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

  const style = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * ITEM_SIZE, index * ITEM_SIZE, (index + 1) * ITEM_SIZE];
    const scale = interpolate(scrollX.value, inputRange, [0.86, 1, 0.86], Extrapolation.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [22, 0, 22], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.55, 1, 0.55], Extrapolation.CLAMP);
    return { transform: [{ scale }, { translateY }], opacity };
  });

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
