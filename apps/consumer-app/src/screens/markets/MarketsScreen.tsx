import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { BentoGrid } from "../../components/ui/BentoGrid";
import { BentoSkeleton } from "../../components/ui/BentoSkeleton";
import { MarketBentoCard } from "../../components/ui/MarketBentoCard";
import { getMarkets, Market } from "../../lib/api-client";
import { LoadError } from "../../components/ui/LoadError";
import { useNav } from "../../navigation/nav-context";
import { color, type, space } from "../../theme/tokens";

export function MarketsScreen() {
  const { push } = useNav();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // A failure used to read as "No markets yet", which isn't true.
  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getMarkets()
      .then(setMarkets)
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load markets"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  return (
    <SafeAreaView style={s.root} edges={["top", "bottom"]}>
      <ScreenHeader title="Popular Markets" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <Text style={[type.body, s.intro]}>
          Browse well-known markets and see everything vendors there are
          selling.
        </Text>

        {loading ? (
          <BentoSkeleton count={8} />
        ) : error ? (
          <LoadError title="Couldn't load markets" message={error} onRetry={load} />
        ) : markets.length === 0 ? (
          <View style={s.empty}>
            <Text style={[type.label, { fontFamily: "Jakarta_600" }]}>
              No markets yet
            </Text>
          </View>
        ) : (
          <BentoGrid
            items={markets}
            keyExtractor={(m) => m.id}
            renderItem={(m, size, height, index) => (
              <MarketBentoCard
                market={m}
                size={size}
                height={height}
                index={index}
                onPress={() => push("marketDetail", { market: m })}
              />
            )}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.canvas },
  scroll: { paddingHorizontal: space.gutter, paddingBottom: 60 },
  intro: { marginBottom: space.lg },
  empty: { alignItems: "center", paddingTop: 60 },
});
