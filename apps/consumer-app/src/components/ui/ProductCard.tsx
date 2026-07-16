import React, { useState } from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "../../lib/mock-products";
import { color, type, space, tint, HIT } from "../../theme/tokens";

export function ProductCard({
  product,
  onAdd,
  onOpen,
}: {
  product: Product;
  onAdd?: (p: Product) => void;
  onOpen?: (p: Product) => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const cover = product.images[0];
  const showImage = !!cover && !imgFailed;

  return (
    <Pressable
      onPress={() => onOpen?.(product)}
      accessibilityRole="button"
      accessibilityLabel={`View ${product.name} by ${product.vendor}`}
    >
      <View style={s.card}>
        <View style={[s.slot, { backgroundColor: tint[product.tint] }]}>
          {showImage ? (
            <Image
              source={{ uri: cover }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <Ionicons name={product.icon} size={36} color={color.ink} />
          )}
          {product.images.length > 1 && showImage && (
            <View style={s.count}>
              <Ionicons name="images-outline" size={11} color={color.onInk} />
              <Text style={s.countText}>{product.images.length}</Text>
            </View>
          )}
        </View>

        <View style={s.meta}>
          <Text numberOfLines={1} style={s.name}>
            {product.name}
          </Text>
          <Text numberOfLines={1} style={[type.meta, { marginTop: 2 }]}>
            {product.vendor} · {product.rating.toFixed(1)}★
          </Text>

          <View style={s.row}>
            <Text style={s.price}>${product.price.toFixed(2)}</Text>
            <Pressable
              onPress={() => onAdd?.(product)}
              hitSlop={HIT}
              accessibilityRole="button"
              accessibilityLabel={`Add ${product.name} to cart`}
            >
              <View style={s.add}>
                <Ionicons name="add" size={18} color={color.onInk} />
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.line,
    overflow: "hidden",
  },
  slot: {
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  count: {
    position: "absolute",
    right: 8,
    bottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(10,46,26,0.75)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countText: { fontFamily: "Jakarta_600", fontSize: 10, color: color.onInk },
  meta: { padding: space.md },
  name: { fontFamily: "Jakarta_600", fontSize: 14, color: color.text },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: space.sm,
  },
  price: { fontFamily: "Jakarta_700", fontSize: 15, color: color.text },
  add: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: color.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});
