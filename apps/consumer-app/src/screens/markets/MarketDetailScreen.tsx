import React, { useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { BentoGrid } from "../../components/ui/BentoGrid";
import { BentoSkeleton } from "../../components/ui/BentoSkeleton";
import { StoreBentoCard } from "../../components/ui/StoreBentoCard";
import { searchStores, Market, StoreResult } from "../../lib/api-client";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import { useNav } from "../../navigation/AppNavigator";
import { color, type, space } from "../../theme/tokens";

const PAGE_SIZE = 8;
const NEAR_BOTTOM_PX = 400;

export function MarketDetailScreen({ market }: { market: Market }) {
  const { push } = useNav();

  const fetcher = useCallback(
    (offset: number, limit: number) =>
      searchStores({ marketId: market.id, limit, offset }).then((page) => ({
        items: page.stores,
        hasMore: page.hasMore,
      })),
    [market.id],
  );

  const { items, loading, loadingMore, hasMore, loadMore } = usePaginatedList<StoreResult>(
    fetcher,
    PAGE_SIZE,
    [market.id],
  );

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    if (distanceFromBottom < NEAR_BOTTOM_PX && hasMore && !loadingMore) {
      loadMore();
    }
  };

  return (
    <SafeAreaView style={s.root} edges={["top", "bottom"]}>
      <ScreenHeader title={market.name} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        onScroll={onScroll}
        scrollEventThrottle={200}
      >
        <View style={s.locationRow}>
          <Ionicons name="location-outline" size={14} color={color.textMuted} />
          <Text style={type.meta}>
            {market.city}, {market.state}
          </Text>
        </View>

        {loading ? (
          <BentoSkeleton count={6} />
        ) : items.length === 0 ? (
          <View style={s.empty}>
            <Text style={[type.label, { fontFamily: "Jakarta_600" }]}>No vendors yet</Text>
            <Text style={[type.body, { marginTop: 4 }]}>Check back soon.</Text>
          </View>
        ) : (
          <>
            <BentoGrid
              items={items}
              keyExtractor={(st) => st.id}
              renderItem={(st, size, height, index) => (
                <StoreBentoCard
                  store={st}
                  size={size}
                  height={height}
                  index={index}
                  onPress={() => push("store", { store: st })}
                />
              )}
            />
            {loadingMore && (
              <View style={s.loadingMore}>
                <ActivityIndicator color={color.primary} />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.canvas },
  scroll: { paddingHorizontal: space.gutter, paddingBottom: 60 },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: space.lg,
  },
  empty: { alignItems: "center", paddingTop: 60 },
  loadingMore: { paddingVertical: space.xl },
});
