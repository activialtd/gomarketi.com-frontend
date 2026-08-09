import React from "react";
import { View, ActivityIndicator, FlatList, StyleSheet } from "react-native";
import { ProductCard } from "./ProductCard";
import { Product } from "../../lib/mock-products";
import { color, space } from "../../theme/tokens";

/**
 * Uniform two-column product grid — the default results layout for
 * cross-vendor search (as opposed to ProductCoverflow's horizontal fan,
 * used for a single store's own catalog). onEndReached/hasMore follow the
 * same prefetch-ahead pagination as StoreDetailScreen.tsx.
 */
export function ProductGrid({
  products,
  onAdd,
  onOpen,
  onEndReached,
  loadingMore,
}: {
  products: Product[];
  onAdd: (p: Product) => void;
  onOpen: (p: Product) => void;
  onEndReached?: () => void;
  loadingMore?: boolean;
}) {
  return (
    <FlatList
      data={products}
      keyExtractor={(p) => p.id}
      numColumns={2}
      scrollEnabled={false}
      columnWrapperStyle={s.row}
      contentContainerStyle={s.list}
      renderItem={({ item }) => (
        <View style={s.cell}>
          <ProductCard product={item} onAdd={onAdd} onOpen={onOpen} />
        </View>
      )}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loadingMore ? (
          <View style={s.footer}>
            <ActivityIndicator color={color.primary} size="small" />
          </View>
        ) : null
      }
    />
  );
}

const s = StyleSheet.create({
  list: { gap: space.md },
  row: { gap: space.md },
  cell: { flex: 1 },
  footer: { paddingVertical: space.lg, alignItems: "center" },
});
