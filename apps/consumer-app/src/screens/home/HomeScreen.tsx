import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../lib/auth-context";
import { useLocation } from "../../hooks/useLocation";
import { SearchModal } from "../../components/ui/SearchModal";
import { VoiceSearchOverlay } from "../../components/ui/VoiceSearchOverlay";
import { WalkToMarketOverlay } from "../../components/ui/WalkToMarketOverlay";
import { useNav } from "../../navigation/AppNavigator";
import { color, space, HIT } from "../../theme/tokens";
import { LinearGradient } from "expo-linear-gradient";

const PROMPTS = ["Order groceries", "Refill pharmacy", "Find a vendor"];

/**
 * Bold Niva-style bloom: concentric brand-hue discs centered behind the pill,
 * breathing (scale+opacity loop) so it reads alive and tangible.
 */
function AuroraField() {
  const t1 = useRef(new Animated.Value(0)).current;
  const t2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (v: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    loop(t1, 5200);
    loop(t2, 7000);
  }, []);

  const drift = (
    v: Animated.Value,
    x: number,
    y: number,
    r1: string,
    r2: string,
    s1 = 1,
    s2 = 1.08,
  ) => ({
    transform: [
      {
        translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, x] }),
      },
      {
        translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, y] }),
      },
      { rotate: v.interpolate({ inputRange: [0, 1], outputRange: [r1, r2] }) },
      { scale: v.interpolate({ inputRange: [0, 1], outputRange: [s1, s2] }) },
    ],
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* wide green base — anchored low, where the pill lives */}
      <Animated.View
        style={[
          b.layer,
          { bottom: -40, alignSelf: "center", width: 430, height: 320 },
          drift(t2, 16, -10, "-10deg", "-2deg"),
        ]}
      >
        <LinearGradient
          colors={["#8FDCA600", "#8FDCA6", "#4FC97A"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={b.fill}
        />
      </Animated.View>

      {/* lime sweep crossing from the upper right */}
      <Animated.View
        style={[
          b.layer,
          { top: "30%", right: -120, width: 360, height: 180, opacity: 0.55 },
          drift(t1, -26, 14, "24deg", "34deg", 1, 0.94),
        ]}
      >
        <LinearGradient
          colors={["#E9F2A800", "#E9F2A8", "#E9F2A800"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={b.fill}
        />
      </Animated.View>

      {/* mint whisper, upper left */}
      <Animated.View
        style={[
          b.layer,
          { top: 60, left: -100, width: 300, height: 160, opacity: 0.6 },
          drift(t2, 22, 10, "-18deg", "-8deg"),
        ]}
      >
        <LinearGradient
          colors={["#CFEBD800", "#CFEBD8", "#CFEBD800"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={b.fill}
        />
      </Animated.View>

      {/* white melt so the pill floats on softness */}
      <Animated.View
        style={[
          b.layer,
          {
            bottom: 40,
            alignSelf: "center",
            width: 360,
            height: 140,
            opacity: 0.85,
          },
          drift(t1, 8, 5, "-2deg", "3deg"),
        ]}
      >
        <LinearGradient
          colors={["#FFFFFF00", "#FFFFFF", "#FFFFFF00"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={b.fill}
        />
      </Animated.View>
    </View>
  );
}
const b = StyleSheet.create({
  layer: { position: "absolute", borderRadius: 200, overflow: "hidden" },
  fill: { flex: 1 },
});

export function HomeScreen() {
  const { user } = useAuth();
  const { status, city, request } = useLocation();
  const { push } = useNav();

  const [query, setQuery] = useState("");
  const [walking, setWalking] = useState(false); // animation phase
  const [searchOpen, setSearchOpen] = useState(false); // modal phase
  const [committedQuery, setCommittedQuery] = useState("");
  const [listening, setListening] = useState(false);

  // entrance: greeting rises, chips follow, pill blooms in
  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);
  const riseIn = (from: number) => ({
    opacity: enter,
    transform: [
      {
        translateY: enter.interpolate({
          inputRange: [0, 1],
          outputRange: [from, 0],
        }),
      },
    ],
  });

  const firstName = (user?.fullName?.split(" ")[0] ?? "there").toUpperCase();
  const locationLabel =
    status === "granted"
      ? (city ?? "Current location")
      : status === "denied"
        ? "Set location"
        : "Locating…";

  /** submit on Home → play the walk → then open the modal */
  const commitSearch = (q: string) => {
    const cleaned = q.trim();
    if (!cleaned) return;
    setCommittedQuery(cleaned);
    setWalking(true);
    // TODO(backend): fire the search request HERE so results are ready post-walk
  };

  const onWalkDone = () => {
    setWalking(false);
    setSearchOpen(true);
  };

  return (
    <View style={s.root}>
      <SafeAreaView style={s.root} edges={["top"]}>
        {/* top bar */}
        <View style={s.topBar}>
          <Pressable
            hitSlop={HIT}
            accessibilityLabel="Order history"
            onPress={() => push("orders")}
            style={s.iconBtn}
          >
            <Ionicons name="time-outline" size={21} color={color.text} />
          </Pressable>
          <Pressable
            onPress={status === "denied" ? request : undefined}
            hitSlop={HIT}
            accessibilityRole="button"
            accessibilityLabel={`Delivery location: ${locationLabel}`}
            style={s.loc}
          >
            <Text style={s.locText}>{locationLabel}</Text>
            <Ionicons name="chevron-down" size={15} color={color.text} />
          </Pressable>
          <Pressable
            onPress={() => push("profile")}
            hitSlop={HIT}
            accessibilityLabel="Profile"
            style={s.iconBtn}
          >
            <Ionicons
              name="person-circle-outline"
              size={23}
              color={color.text}
            />
          </Pressable>
        </View>

        {/* fixed hero */}
        <View style={s.hero}>
          {/* upper block: greeting + chips */}
          <View style={s.top}>
            <Animated.Text style={[s.eyebrow, riseIn(14)]}>
              HELLO {firstName}!
            </Animated.Text>
            <Animated.Text style={[s.display, riseIn(20)]}>
              What can I get{"\n"}you today?
            </Animated.Text>
            <Animated.View style={[s.chips, riseIn(26)]}>
              {PROMPTS.map((p) => (
                <Pressable
                  key={p}
                  onPress={() => commitSearch(p.split(" ").pop()!)}
                >
                  <View style={s.chip}>
                    <Text style={s.chipText}>{p}</Text>
                  </View>
                </Pressable>
              ))}
            </Animated.View>
          </View>

          {/* center block: bloom + pill, dead-center of remaining space */}
          <View style={s.centerZone}>
            <AuroraField />
            <Animated.View style={[s.pill, riseIn(32)]}>
              <TextInput
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={() => commitSearch(query)}
                returnKeyType="search"
                placeholder="Ask GoMarketi anything"
                placeholderTextColor={color.textMuted}
                accessibilityLabel="Search products"
                style={s.pillInput}
              />
              <Pressable
                onPress={() => setListening(true)}
                accessibilityRole="button"
                accessibilityLabel="Search by voice"
              >
                <View style={s.mic}>
                  <Ionicons name="mic" size={22} color={color.onInk} />
                </View>
              </Pressable>
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>

      {/* walk-to-market plays first… */}
      {walking && (
        <WalkToMarketOverlay
          query={committedQuery}
          onReveal={() => setSearchOpen(true)} // modal slides up under the scene
          onGone={() => setWalking(false)} // scene has fully dissolved
        />
      )}

      {/* …then the results modal */}
      <SearchModal
        visible={searchOpen}
        initialQuery={committedQuery}
        onClose={() => {
          setSearchOpen(false);
          setQuery("");
        }}
        onOpenProduct={(p) => {
          setSearchOpen(false);
          push("product", { productId: p.id });
        }}
      />

      {listening && (
        <VoiceSearchOverlay
          onResult={(q) => {
            setListening(false);
            setQuery(q);
            commitSearch(q);
          }}
          onCancel={() => setListening(false)}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.canvas },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.gutter,
    paddingVertical: space.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loc: { flexDirection: "row", alignItems: "center", gap: 4 },
  locText: { fontFamily: "Jakarta_600", fontSize: 16, color: color.text },

  hero: {
    flex: 1,
    margin: space.lg,
    marginTop: space.sm,
    borderRadius: 32,
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.line,
    overflow: "hidden",
  },
  top: { paddingTop: 48 },
  eyebrow: {
    textAlign: "center",
    fontFamily: "Jakarta_600",
    fontSize: 11,
    letterSpacing: 1.4,
    color: color.textFaint,
  },
  display: {
    textAlign: "center",
    fontFamily: "Jakarta_700",
    fontSize: 32,
    lineHeight: 40,
    color: color.text,
    marginTop: space.md,
    letterSpacing: -0.4,
  },
  chips: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: space.sm,
    marginTop: space.xl,
    paddingHorizontal: space.lg,
  },
  chip: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: color.lineStrong,
    backgroundColor: color.card,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: { fontFamily: "Jakarta_500", fontSize: 13, color: color.text },

  centerZone: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center", // pill sits at the true center of remaining space
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    height: 64,
    alignSelf: "stretch",
    marginHorizontal: space.xl,
    paddingLeft: space.xl,
    paddingRight: 8,
    borderRadius: 32,
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: "rgba(10,46,26,0.08)",
    shadowColor: "#0A2E1A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  pillInput: {
    flex: 1,
    fontFamily: "Jakarta_500",
    fontSize: 15,
    color: color.text,
    padding: 0,
  },
  mic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: color.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
  },
});
