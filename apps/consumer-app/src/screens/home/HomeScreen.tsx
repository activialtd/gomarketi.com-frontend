import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  Easing,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useAuth } from "../../lib/auth-context";
import { useLocation } from "../../hooks/useLocation";
import { SearchModal } from "../../components/ui/SearchModal";
import { VoiceSearchOverlay } from "../../components/ui/VoiceSearchOverlay";
import { WalkToMarketOverlay } from "../../components/ui/WalkToMarketOverlay";
import { Bouncy } from "../../components/ui/Bouncy";
import { useNav } from "../../navigation/AppNavigator";
import { color, space, HIT, stickerShadow } from "../../theme/tokens";
import { LinearGradient } from "expo-linear-gradient";

const PROMPTS: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: "Order groceries", icon: "basket-outline" },
  { label: "Refill pharmacy", icon: "medkit-outline" },
  { label: "Find a vendor", icon: "storefront-outline" },
];

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
  const { status, city, coords, request } = useLocation();
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

  /** submit on Home → play the walk → then open the modal (which fires the search itself) */
  const commitSearch = (q: string) => {
    const cleaned = q.trim();
    if (!cleaned) return;
    setCommittedQuery(cleaned);
    setWalking(true);
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
        <View style={s.heroWrap}>
        <KeyboardAvoidingView
          style={s.hero}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
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
                <Bouncy
                  key={p.label}
                  style={s.chip}
                  onPress={() => commitSearch(p.label.split(" ").pop()!)}
                >
                  <Ionicons name={p.icon} size={14} color={color.ink} />
                  <Text style={s.chipText}>{p.label}</Text>
                </Bouncy>
              ))}
            </Animated.View>

            <Animated.View style={riseIn(28)}>
              <Bouncy style={s.marketsTab} onPress={() => push("markets")}>
                <Ionicons name="storefront" size={16} color={color.onInk} />
                <Text style={s.marketsTabText}>Popular Markets</Text>
                <Ionicons name="chevron-forward" size={14} color={color.onInk} />
              </Bouncy>
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
              <View style={s.micWrap}>
                <MotiView
                  from={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.55, opacity: 0 }}
                  transition={{ type: "timing", duration: 1400, loop: true }}
                  style={s.micPulse}
                />
                <Bouncy
                  onPress={() => setListening(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Search by voice"
                  style={s.mic}
                  scaleTo={0.88}
                >
                  <Ionicons name="mic" size={22} color={color.onInk} />
                </Bouncy>
              </View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
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
        lat={coords?.latitude}
        lng={coords?.longitude}
        onClose={() => {
          setSearchOpen(false);
          setQuery("");
        }}
        onOpenStore={(st) => {
          setSearchOpen(false);
          push("store", { store: st });
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

  // Shadow lives on the outer wrapper — a hard offset shadow gets clipped
  // if it's on the same view as overflow:hidden, so the inner `hero` (which
  // needs overflow:hidden to contain AuroraField's blobs) can't carry it.
  heroWrap: {
    flex: 1,
    margin: space.lg,
    marginTop: space.sm,
    borderRadius: 32,
    shadowColor: color.ink900,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  hero: {
    flex: 1,
    borderRadius: 32,
    backgroundColor: color.card,
    borderWidth: 2.5,
    borderColor: color.ink900,
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
    fontFamily: "Fredoka_600",
    fontSize: 32,
    lineHeight: 40,
    color: color.text,
    marginTop: space.md,
    letterSpacing: -0.2,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    backgroundColor: color.card,
    justifyContent: "center",
    ...stickerShadow(color.ink900, 3),
  },
  chipText: { fontFamily: "Jakarta_500", fontSize: 13, color: color.text },
  marketsTab: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 8,
    marginTop: space.lg,
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: color.ink,
    ...stickerShadow(color.ink900, 3),
  },
  marketsTabText: { fontFamily: "Jakarta_600", fontSize: 13, color: color.onInk },

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
    ...stickerShadow(color.ink900, 5),
  },
  pillInput: {
    flex: 1,
    fontFamily: "Jakarta_500",
    fontSize: 15,
    color: color.text,
    padding: 0,
  },
  micWrap: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  micPulse: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: color.sunshine,
  },
  mic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: color.accent,
    alignItems: "center",
    justifyContent: "center",
    ...stickerShadow(color.ink900, 3),
  },
});
