import React, { useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/ui/Button";
import { PRODUCTS, Product } from "../../lib/mock-products";
import { useCart, formatNaira } from "../../lib/cart-context";
import { useNav } from "../../navigation/AppNavigator";
import { color, type, space, tint, HIT } from "../../theme/tokens";

const { width } = Dimensions.get("window");
const GALLERY_H = 400;

/**
 * Product detail.
 * - Gallery: story-style progress bars + swipeable pager + thumbnail rail.
 * - Variants: color swatches; Sizes: chips.
 * - CTA is two-stage: "Add to cart" → after adding, becomes "Checkout · ₦total"
 *   with a quiet "Add another" beneath it.
 */
export function ProductDetailScreen({
  productId,
  product: productProp,
}: {
  productId?: string;
  product?: Product;
}) {
  const { pop, push } = useNav();
  const { add, count, totalUsd } = useCart();
  // A real (API-backed) product is passed directly since it won't exist in
  // the mock PRODUCTS array; only fall back to the mock lookup by id when
  // no product object was handed over.
  const product: Product | undefined = productProp ?? PRODUCTS.find((p) => p.id === productId);

  const pager = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const [qty, setQty] = useState(1);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const [variant, setVariant] = useState<string | undefined>(
    product?.variants?.[0]?.name,
  );
  const [size, setSize] = useState<string | undefined>(product?.sizes?.[0]);
  const [inCart, setInCart] = useState(false); // drives the CTA morph

  if (!product) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.center}>
          <Text style={type.body}>Product not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const images = product.images.filter((_, i) => !failed[i]);
  const hasImages = images.length > 0;

  const onPageEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));

  const jump = (i: number) => {
    pager.current?.scrollTo({ x: i * width, animated: true });
    setPage(i);
  };

  const addToCart = () => {
    add(product, { variant, size, qty });
    setInCart(true);
    setQty(1); // reset for a potential second add
  };

  // Selection changed after adding? Let them add the new combo too.
  const addAnother = () => setInCart(false);

  return (
    <View style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* ---------------- gallery ---------------- */}
        <View
          style={{ height: GALLERY_H, backgroundColor: tint[product.tint] }}
        >
          {hasImages ? (
            <ScrollView
              ref={pager}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onPageEnd}
            >
              {images.map((uri, i) => (
                <Image
                  key={uri}
                  source={{ uri }}
                  style={{ width, height: GALLERY_H }}
                  resizeMode="cover"
                  onError={() => setFailed((f) => ({ ...f, [i]: true }))}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={s.center}>
              <Ionicons name={product.icon} size={84} color={color.ink} />
            </View>
          )}

          {/* story-style progress bars */}
          {hasImages && images.length > 1 && (
            <View style={s.bars} pointerEvents="none">
              {images.map((_, i) => (
                <View key={i} style={[s.bar, i === page && s.barOn]} />
              ))}
            </View>
          )}

          {/* floating: back + cart count */}
          <SafeAreaView
            style={s.overlayTop}
            edges={["top"]}
            pointerEvents="box-none"
          >
            <Pressable onPress={pop} hitSlop={HIT} accessibilityLabel="Back">
              <View style={s.floatBtn}>
                <Ionicons name="arrow-back" size={20} color={color.text} />
              </View>
            </Pressable>
            {count > 0 && (
              <Pressable
                onPress={() => push("cart")}
                hitSlop={HIT}
                accessibilityLabel="Open cart"
              >
                <View style={s.floatBtn}>
                  <Ionicons name="cart-outline" size={19} color={color.text} />
                  <View style={s.badge}>
                    <Text style={s.badgeText}>{count}</Text>
                  </View>
                </View>
              </Pressable>
            )}
          </SafeAreaView>

          {/* thumbnail rail */}
          {hasImages && images.length > 1 && (
            <View style={s.thumbRail}>
              {images.map((uri, i) => (
                <Pressable
                  key={uri}
                  onPress={() => jump(i)}
                  accessibilityLabel={`Image ${i + 1}`}
                >
                  <Image
                    source={{ uri }}
                    style={[s.thumb, i === page && s.thumbOn]}
                  />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* ---------------- detail sheet ---------------- */}
        <View style={s.sheet}>
          <View style={s.grabber} />

          <View style={s.headRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{product.name}</Text>
              <Text style={[type.body, { marginTop: 2 }]}>
                {product.vendor} · {product.unit}
              </Text>
            </View>
            <View style={s.ratingChip}>
              <Ionicons name="star" size={12} color={color.ink} />
              <Text style={s.ratingText}>{product.rating.toFixed(1)}</Text>
              <Text style={s.reviews}>({product.reviews})</Text>
            </View>
          </View>

          <Text style={[type.section, { marginTop: space.xl }]}>About</Text>
          <Text style={[type.body, { marginTop: space.sm }]}>
            {product.description}
          </Text>

          {/* variants: color swatches */}
          {product.variants && (
            <>
              <View style={s.varHead}>
                <Text style={type.section}>Color</Text>
                <Text style={type.body}>{variant}</Text>
              </View>
              <View style={s.swatches}>
                {product.variants.map((v) => (
                  <Pressable
                    key={v.name}
                    onPress={() => setVariant(v.name)}
                    accessibilityRole="button"
                    accessibilityLabel={`Color ${v.name}`}
                    accessibilityState={{ selected: variant === v.name }}
                  >
                    <View
                      style={[
                        s.swatchRing,
                        variant === v.name && s.swatchRingOn,
                      ]}
                    >
                      <View style={[s.swatch, { backgroundColor: v.hex }]} />
                    </View>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* sizes */}
          {product.sizes && (
            <>
              <Text style={[type.section, { marginTop: space.xl }]}>Size</Text>
              <View style={s.sizes}>
                {product.sizes.map((sz) => (
                  <Pressable
                    key={sz}
                    onPress={() => setSize(sz)}
                    accessibilityRole="button"
                    accessibilityLabel={`Size ${sz}`}
                    accessibilityState={{ selected: size === sz }}
                  >
                    <View style={[s.sizeChip, size === sz && s.sizeChipOn]}>
                      <Text
                        style={[
                          s.sizeText,
                          size === sz && { color: color.onInk },
                        ]}
                      >
                        {sz}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* qty stepper */}
          <View style={s.qtyRow}>
            <Text style={type.section}>Quantity</Text>
            <View style={s.qty}>
              <Pressable
                onPress={() => setQty(Math.max(1, qty - 1))}
                hitSlop={HIT}
                accessibilityLabel="Decrease quantity"
              >
                <View style={s.qtyBtn}>
                  <Ionicons name="remove" size={17} color={color.text} />
                </View>
              </Pressable>
              <Text style={s.qtyNum}>{qty}</Text>
              <Pressable
                onPress={() => setQty(qty + 1)}
                hitSlop={HIT}
                accessibilityLabel="Increase quantity"
              >
                <View style={s.qtyBtn}>
                  <Ionicons name="add" size={17} color={color.text} />
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ---------------- sticky CTA (two-stage) ---------------- */}
      <View style={s.cta}>
        {!inCart ? (
          <>
            <View>
              <Text style={type.meta}>Price</Text>
              <Text style={s.ctaPrice}>{formatNaira(product.price * qty)}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: space.lg }}>
              <Button label="Add to cart" onPress={addToCart} />
            </View>
          </>
        ) : (
          <View style={{ flex: 1 }}>
            <Pressable
              onPress={() => push("cart")}
              accessibilityRole="button"
              accessibilityLabel={`Checkout, total ${formatNaira(totalUsd)}`}
            >
              <View style={s.checkoutBtn}>
                <Ionicons name="cart" size={18} color={color.onInk} />
                <Text style={s.checkoutText}>
                  Checkout · {formatNaira(totalUsd)}
                </Text>
              </View>
            </Pressable>
            <Pressable
              onPress={addAnother}
              hitSlop={HIT}
              accessibilityLabel="Add another"
            >
              <Text style={s.addAnother}>+ Add another</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.canvas },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  bars: {
    position: "absolute",
    top: 58,
    left: space.gutter,
    right: space.gutter,
    flexDirection: "row",
    gap: 5,
  },
  bar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  barOn: { backgroundColor: color.card },

  overlayTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: space.gutter,
    paddingTop: space.md,
  },
  floatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: color.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontFamily: "Jakarta_700", fontSize: 10, color: color.onInk },

  thumbRail: { position: "absolute", right: space.md, top: 90, gap: 8 },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
  },
  thumbOn: { borderColor: color.accent, borderWidth: 2.5 },

  sheet: {
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: color.canvas,
    paddingHorizontal: space.gutter,
    paddingTop: space.md,
  },
  grabber: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.lineStrong,
    marginBottom: space.lg,
  },
  headRow: { flexDirection: "row", alignItems: "flex-start", gap: space.md },
  name: {
    fontFamily: "Jakarta_700",
    fontSize: 22,
    color: color.text,
    letterSpacing: -0.3,
  },
  ratingChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: color.panel,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ratingText: { fontFamily: "Jakarta_700", fontSize: 13, color: color.ink },
  reviews: { fontFamily: "Jakarta_400", fontSize: 11, color: color.textMuted },

  varHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: space.xxl,
  },
  swatches: { flexDirection: "row", gap: 12, marginTop: space.md },
  swatchRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 3,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  swatchRingOn: { borderColor: color.ink },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: color.line,
  },

  sizes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: space.md,
  },
  sizeChip: {
    minWidth: 48,
    height: 42,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: color.lineStrong,
    backgroundColor: color.card,
    alignItems: "center",
    justifyContent: "center",
  },
  sizeChipOn: { backgroundColor: color.ink, borderColor: color.ink },
  sizeText: { fontFamily: "Jakarta_600", fontSize: 14, color: color.text },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: space.xxl,
  },
  qty: { flexDirection: "row", alignItems: "center", gap: 12 },
  qtyBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.lineStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyNum: {
    fontFamily: "Jakarta_700",
    fontSize: 16,
    color: color.text,
    minWidth: 20,
    textAlign: "center",
  },

  cta: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.card,
    borderTopWidth: 1,
    borderColor: color.line,
    paddingHorizontal: space.gutter,
    paddingTop: space.md,
    paddingBottom: 34,
  },
  ctaPrice: { fontFamily: "Jakarta_700", fontSize: 18, color: color.text },

  checkoutBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: color.primary, // brighter green = state change is unmistakable
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  checkoutText: { fontFamily: "Jakarta_600", fontSize: 16, color: color.onInk },
  addAnother: {
    fontFamily: "Jakarta_600",
    fontSize: 13,
    color: color.textMuted,
    textAlign: "center",
    marginTop: 10,
  },
});
