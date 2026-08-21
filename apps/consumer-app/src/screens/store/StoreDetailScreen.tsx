import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Modal,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { ProductCoverflow } from "../../components/ui/ProductCoverflow";
import {
  getStoreProducts,
  StoreResult,
  CatalogueProduct,
} from "../../lib/api-client";
import { catalogueProductToAppProduct } from "../../lib/catalogue-adapter";
import { Product } from "../../lib/mock-products";
import { useCart } from "../../lib/cart-context";
import { useNav } from "../../navigation/AppNavigator";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import { categoryMeta } from "../../lib/store-category";
import { color, tint, type, space } from "../../theme/tokens";

const PAGE_SIZE = 10;

const PRICE_FILTERS = [
  { label: "Under ₦5,000", min: 0, max: 5000 },
  { label: "₦5,000 – ₦20,000", min: 5000, max: 20000 },
  { label: "₦20,000 – ₦50,000", min: 20000, max: 50000 },
  { label: "₦50,000 – ₦100,000", min: 50000, max: 100000 },
  { label: "Over ₦100,000", min: 100000, max: Infinity },
];

function CoverflowSkeleton() {
  return (
    <View style={s.skeletonRow}>
      {[0, 1, 2].map((i) => (
        <MotiView
          key={i}
          from={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "timing",
            duration: 700,
            loop: true,
            repeatReverse: true,
            delay: i * 100,
          }}
          style={s.skeletonCard}
        />
      ))}
    </View>
  );
}

export function StoreDetailScreen({ store }: { store: StoreResult }) {
  const { add } = useCart();
  const { push } = useNav();

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Use TypeScript generic < > for the typing, initialized to null
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activePrice, setActivePrice] = useState<
    (typeof PRICE_FILTERS)[0] | null
  >(null);

  const [pendingCategory, setPendingCategory] = useState<string | null>(null);
  const [pendingPrice, setPendingPrice] = useState<
    (typeof PRICE_FILTERS)[0] | null
  >(null);

  const openFilters = () => {
    setPendingCategory(activeCategory);
    setPendingPrice(activePrice);
    setIsFilterModalOpen(true);
  };

  const applyFilters = () => {
    setActiveCategory(pendingCategory);
    setActivePrice(pendingPrice);
    setIsFilterModalOpen(false);
  };

  const clearPending = () => {
    setPendingCategory(null);
    setPendingPrice(null);
  };

  const pendingCount = (pendingCategory ? 1 : 0) + (pendingPrice ? 1 : 0);

  const fetcher = useCallback(
    (offset: number, limit: number) => {
      const page = Math.floor(offset / limit) + 1;
      return getStoreProducts(store.id, page, limit).then((res) => ({
        items: res.products.map((p: CatalogueProduct) =>
          catalogueProductToAppProduct(p, store),
        ),
        hasMore: res.hasMore,
      }));
    },
    [store.id],
  );

  const {
    items: products,
    loading,
    loadingMore,
    hasMore,
    loadMore,
  } = usePaginatedList<Product>(fetcher, PAGE_SIZE, [store.id]);

  const availableCategories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(cats);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (
        activePrice &&
        (p.price < activePrice.min || p.price >= activePrice.max)
      )
        return false;
      return true;
    });
  }, [products, activeCategory, activePrice]);

  const meta = categoryMeta(store.category);
  const isFiltering = activeCategory !== null || activePrice !== null;

  return (
    <SafeAreaView style={s.root} edges={["top", "bottom"]}>
      <ScreenHeader title={store.name} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <View style={[s.banner, { backgroundColor: tint[meta.tint] }]}>
          <Ionicons name={meta.icon} size={40} color={color.ink} />
        </View>

        <View style={s.headerBlock}>
          <Text style={type.eyebrow}>{meta.label.toUpperCase()}</Text>
          <Text style={[type.display, { fontSize: 22, marginTop: 4 }]}>
            {store.name}
          </Text>
          {store.tagline && (
            <Text style={[type.body, { marginTop: space.xs }]}>
              {store.tagline}
            </Text>
          )}
          {(store.address || store.city) && (
            <View style={s.locationRow}>
              <Ionicons
                name="location-outline"
                size={14}
                color={color.textMuted}
              />
              <Text style={type.meta}>
                {[store.address, store.city].filter(Boolean).join(", ")}
              </Text>
            </View>
          )}
        </View>

        <View style={s.sectionHeader}>
          <View>
            <Text style={[type.section, s.section]}>Products</Text>
            <Text style={[type.meta, { marginBottom: space.sm }]}>
              Swipe through — tap a card to open it
            </Text>
          </View>

          <Pressable
            style={[s.filterTrigger, isFiltering && s.filterTriggerActive]}
            onPress={openFilters}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={isFiltering ? color.canvas : color.ink}
            />
            {isFiltering && <View style={s.filterDot} />}
          </Pressable>
        </View>
      </ScrollView>

      <View style={s.coverflowWrap}>
        {loading ? (
          <CoverflowSkeleton />
        ) : filteredProducts.length === 0 ? (
          <View style={s.empty}>
            <Text style={[type.label, { fontFamily: "Jakarta_600" }]}>
              {isFiltering ? "No matches found" : "No products yet"}
            </Text>
            <Text
              style={[
                type.body,
                {
                  marginTop: 4,
                  textAlign: "center",
                  paddingHorizontal: space.lg,
                },
              ]}
            >
              {isFiltering
                ? "Try adjusting your filters or loading more products."
                : "Check back soon."}
            </Text>
            {isFiltering && hasMore && (
              <Pressable style={s.loadMoreBtn} onPress={loadMore}>
                <Text style={s.loadMoreBtnText}>Load More Products</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <>
            <ProductCoverflow
              products={filteredProducts}
              onAdd={(p) => add(p)}
              onOpen={(p) => push("product", { productId: p.id, product: p })}
              onEndReached={hasMore && !isFiltering ? loadMore : undefined}
            />
            {loadingMore && (
              <View style={s.loadingMore}>
                <ActivityIndicator color={color.primary} size="small" />
              </View>
            )}
          </>
        )}
      </View>

      <Modal
        visible={isFilterModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsFilterModalOpen(false)}
      >
        <View style={s.modalOverlay}>
          <Pressable
            style={s.modalBackdrop}
            onPress={() => setIsFilterModalOpen(false)}
          />

          <View style={s.modalContent}>
            <View style={s.handle} />

            <View style={s.modalHeader}>
              <View>
                <Text style={s.modalTitle}>Filters</Text>
                <Text style={[type.meta, { marginTop: 2 }]}>
                  {pendingCount === 0
                    ? "Refine what you see"
                    : `${pendingCount} filter${pendingCount > 1 ? "s" : ""} selected`}
                </Text>
              </View>
              <Pressable
                onPress={() => setIsFilterModalOpen(false)}
                style={s.closeBtn}
                hitSlop={10}
              >
                <Ionicons name="close" size={20} color={color.ink} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: space.md }}
            >
              {availableCategories.length > 0 && (
                <View style={s.filterGroup}>
                  <Text style={s.filterGroupLabel}>Product type</Text>
                  <View style={s.filterOptionsWrap}>
                    {availableCategories.map((cat) => {
                      const isActive = pendingCategory === cat;
                      return (
                        <Pressable
                          key={cat}
                          style={[s.pill, isActive && s.pillActive]}
                          onPress={() =>
                            setPendingCategory(isActive ? null : cat)
                          }
                        >
                          <Text
                            style={[s.pillText, isActive && s.pillTextActive]}
                          >
                            {cat}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              <View style={s.filterGroup}>
                <Text style={s.filterGroupLabel}>Price range</Text>
                <View style={s.priceStack}>
                  {PRICE_FILTERS.map((pf) => {
                    const isActive = pendingPrice?.label === pf.label;
                    return (
                      <Pressable
                        key={pf.label}
                        style={[s.priceRow, isActive && s.priceRowActive]}
                        onPress={() => setPendingPrice(isActive ? null : pf)}
                      >
                        <Text
                          style={[s.priceLabel, isActive && s.priceLabelActive]}
                        >
                          {pf.label}
                        </Text>
                        <View style={[s.radio, isActive && s.radioActive]}>
                          {isActive && (
                            <Ionicons
                              name="checkmark"
                              size={13}
                              color={color.canvas}
                            />
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            <View style={s.modalFooter}>
              <Pressable style={s.clearBtn} onPress={clearPending}>
                <Text style={s.clearBtnText}>Clear all</Text>
              </Pressable>
              <Pressable style={s.applyBtn} onPress={applyFilters}>
                <Text style={s.applyBtnText}>
                  {pendingCount > 0 ? `Apply · ${pendingCount}` : "Apply"}
                </Text>
              </Pressable>
            </View>
            <RNSafeAreaView edges={["bottom"]} />
          </View>
        </View>
      </Modal>
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

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: space.xl,
    marginBottom: space.sm,
  },
  section: { marginTop: 0, marginBottom: 4 },
  filterTrigger: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: color.line,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  filterTriggerActive: {
    backgroundColor: color.ink,
  },
  filterDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.primary,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 20, 15, 0.45)",
  },
  modalContent: {
    backgroundColor: color.canvas,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: space.gutter,
    paddingTop: space.sm,
    maxHeight: "82%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.line,
    alignSelf: "center",
    marginBottom: space.md,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: space.lg,
  },
  modalTitle: {
    ...type.display,
    fontSize: 22,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: color.line,
    alignItems: "center",
    justifyContent: "center",
  },

  filterGroup: {
    marginBottom: space.xl,
  },
  filterGroupLabel: {
    ...type.label,
    fontFamily: "Jakarta_600",
    marginBottom: space.md,
  },
  filterOptionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: color.canvas,
    borderWidth: 1.5,
    borderColor: color.line,
  },
  pillActive: {
    backgroundColor: color.ink,
    borderColor: color.ink,
  },
  pillText: {
    ...type.meta,
    fontFamily: "Jakarta_600",
    color: color.ink,
  },
  pillTextActive: {
    color: color.canvas,
  },

  priceStack: {
    gap: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: color.line,
    backgroundColor: color.canvas,
  },
  priceRowActive: {
    borderColor: color.ink,
    backgroundColor: tint.produce,
  },
  priceLabel: {
    ...type.label,
    fontFamily: "Jakarta_600",
    color: color.ink,
  },
  priceLabelActive: {
    color: color.ink,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: color.line,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: {
    borderColor: color.ink,
    backgroundColor: color.ink,
  },

  modalFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderColor: color.line,
    marginTop: space.sm,
  },
  clearBtn: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 100,
    backgroundColor: color.line,
  },
  clearBtnText: {
    ...type.label,
    fontFamily: "Jakarta_600",
    color: color.ink,
  },
  applyBtn: {
    flex: 1,
    backgroundColor: color.ink,
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: "center",
  },
  applyBtnText: {
    ...type.label,
    fontFamily: "Jakarta_700",
    color: color.canvas,
    fontSize: 15,
  },

  empty: { alignItems: "center", paddingTop: 20, paddingBottom: 60 },
  loadMoreBtn: {
    marginTop: space.md,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: color.line,
    borderRadius: 100,
  },
  loadMoreBtnText: {
    ...type.meta,
    fontFamily: "Jakarta_600",
    color: color.ink,
  },

  coverflowWrap: { paddingBottom: 40 },
  loadingMore: { alignItems: "center", paddingTop: space.sm },
  skeletonRow: {
    flexDirection: "row",
    gap: space.md,
    paddingHorizontal: space.gutter,
  },
  skeletonCard: {
    width: 210,
    height: 300,
    borderRadius: 24,
    backgroundColor: color.line,
  },
});
