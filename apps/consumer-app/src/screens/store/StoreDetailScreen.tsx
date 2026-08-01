import React, { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { ProductCoverflow } from "../../components/ui/ProductCoverflow";
import { getStoreProducts, StoreResult, CatalogueProduct } from "../../lib/api-client";
import { catalogueProductToAppProduct } from "../../lib/catalogue-adapter";
import { Product } from "../../lib/mock-products";
import { useCart } from "../../lib/cart-context";
import { useNav } from "../../navigation/AppNavigator";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import { categoryMeta } from "../../lib/store-category";
import { color, tint, type, space } from "../../theme/tokens";

const PAGE_SIZE = 10;

function CoverflowSkeleton() {
  return (
    <View style={s.skeletonRow}>
      {[0, 1, 2].map((i) => (
        <MotiView
          key={i}
          from={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 700, loop: true, repeatReverse: true, delay: i * 100 }}
          style={s.skeletonCard}
        />
      ))}
    </View>
  );
}

export function StoreDetailScreen({ store }: { store: StoreResult }) {
  const { add } = useCart();
  const { push } = useNav();

  const fetcher = useCallback(
    (offset: number, limit: number) => {
      const page = Math.floor(offset / limit) + 1;
      return getStoreProducts(store.id, page, limit).then((res) => ({
        items: res.products.map((p: CatalogueProduct) => catalogueProductToAppProduct(p, store)),
        hasMore: res.hasMore,
      }));
    },
    [store.id],
  );

  const { items: products, loading, loadingMore, hasMore, loadMore } = usePaginatedList<Product>(
    fetcher,
    PAGE_SIZE,
    [store.id],
  );

  const meta = categoryMeta(store.category);

  return (
    <SafeAreaView style={s.root} edges={["top", "bottom"]}>
      <ScreenHeader title={store.name} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={[s.banner, { backgroundColor: tint[meta.tint] }]}>
          <Ionicons name={meta.icon} size={40} color={color.ink} />
        </View>

        <View style={s.headerBlock}>
          <Text style={type.eyebrow}>{meta.label.toUpperCase()}</Text>
          <Text style={[type.display, { fontSize: 22, marginTop: 4 }]}>{store.name}</Text>
          {store.tagline && (
            <Text style={[type.body, { marginTop: space.xs }]}>{store.tagline}</Text>
          )}
          {(store.address || store.city) && (
            <View style={s.locationRow}>
              <Ionicons name="location-outline" size={14} color={color.textMuted} />
              <Text style={type.meta}>
                {[store.address, store.city].filter(Boolean).join(", ")}
              </Text>
            </View>
          )}
        </View>

        <Text style={[type.section, s.section]}>Products</Text>
        <Text style={[type.meta, { marginBottom: space.sm }]}>Swipe through — tap a card to open it</Text>
      </ScrollView>

      {/* The coverflow owns its own horizontal scroll, so it sits outside the
          page's vertical ScrollView rather than nested inside it. */}
      <View style={s.coverflowWrap}>
        {loading ? (
          <CoverflowSkeleton />
        ) : products.length === 0 ? (
          <View style={s.empty}>
            <Text style={[type.label, { fontFamily: "Jakarta_600" }]}>No products yet</Text>
            <Text style={[type.body, { marginTop: 4 }]}>Check back soon.</Text>
          </View>
        ) : (
          <>
            <ProductCoverflow
              products={products}
              onAdd={(p) => add(p)}
              onOpen={(p) => push("product", { productId: p.id, product: p })}
              onEndReached={hasMore ? loadMore : undefined}
            />
            {loadingMore && (
              <View style={s.loadingMore}>
                <ActivityIndicator color={color.primary} size="small" />
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.canvas },
  scroll: { paddingHorizontal: space.gutter, paddingBottom: space.md },
  banner: {
    height: 120,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBlock: { marginTop: space.lg },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: space.sm,
  },
  section: { marginTop: space.xl, marginBottom: space.xs },
  empty: { alignItems: "center", paddingTop: 20, paddingBottom: 60 },
  coverflowWrap: { paddingBottom: 40 },
  loadingMore: { alignItems: "center", paddingTop: space.sm },
  skeletonRow: { flexDirection: "row", gap: space.md, paddingHorizontal: space.gutter },
  skeletonCard: { width: 210, height: 300, borderRadius: 24, backgroundColor: color.line },
});
