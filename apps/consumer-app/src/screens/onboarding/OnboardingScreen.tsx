import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  Easing,
  Dimensions,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { color, space, HIT, stickerShadow } from "../../theme/tokens";

const { width } = Dimensions.get("window");

/* ---------- animation helper: endless 0→1→0 breathe ---------- */
function useFloat(duration: number, delay = 0) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
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
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return v;
}

const bobY = (v: Animated.Value, dist: number) => ({
  transform: [
    {
      translateY: v.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -dist],
      }),
    },
  ],
});

/* ---------- floating chip used across scenes ---------- */
function FloatChip({
  icon,
  tint: bg,
  size = 46,
  style,
  float,
  dist = 10,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  size?: number;
  style?: object;
  float: Animated.Value;
  dist?: number;
}) {
  return (
    <Animated.View
      style={[
        c.chip,
        {
          width: size,
          height: size,
          borderRadius: size / 2.6,
          backgroundColor: bg,
        },
        style,
        bobY(float, dist),
      ]}
    >
      <Ionicons name={icon} size={size * 0.46} color={color.ink} />
    </Animated.View>
  );
}
const c = StyleSheet.create({
  chip: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    ...stickerShadow(color.ink900, 3),
  },
});

/* ================= SCENE 1 — your market, floating ================= */
function MarketScene() {
  const f1 = useFloat(2200);
  const f2 = useFloat(2600, 300);
  const f3 = useFloat(2400, 600);
  const f4 = useFloat(2800, 150);

  return (
    <View style={sc.stage}>
      <LinearGradient
        colors={["#DFF4E6", "#F2FAF0", "#FFFFFF00"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={sc.bigBlob}
      />
      {/* hero card: storefront */}
      <Animated.View style={[sc.heroCard, bobY(f1, 12)]}>
        <LinearGradient colors={["#FFFFFF", "#EFF8F1"]} style={sc.heroInner}>
          <Ionicons name="storefront" size={64} color={color.ink} />
        </LinearGradient>
      </Animated.View>
      {/* orbiting category chips */}
      <FloatChip
        icon="leaf"
        tint="#DFF4E6"
        float={f2}
        style={{ top: 18, left: 34 }}
      />
      <FloatChip
        icon="medkit"
        tint="#E3EFF8"
        float={f3}
        style={{ top: 64, right: 26 }}
        dist={14}
      />
      <FloatChip
        icon="shirt"
        tint="#F3EDE0"
        float={f4}
        style={{ bottom: 40, left: 22 }}
        size={40}
      />
      <FloatChip
        icon="cafe"
        tint="#EDE8F5"
        float={f1}
        style={{ bottom: 12, right: 52 }}
        size={40}
        dist={8}
      />
    </View>
  );
}

/* ================= SCENE 2 — ask and it appears ================= */
function AskScene() {
  const pulse = useFloat(1800);
  const f1 = useFloat(2400, 200);
  const f2 = useFloat(2700, 500);

  const ringScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.9],
  });
  const ringFade = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  return (
    <View style={sc.stage}>
      <LinearGradient
        colors={["#E9F2C9", "#EAF7EE", "#FFFFFF00"]}
        start={{ x: 0.8, y: 0 }}
        end={{ x: 0.2, y: 1 }}
        style={sc.bigBlob}
      />
      {/* floating result cards */}
      <Animated.View style={[sc.miniCard, { top: 26, left: 30 }, bobY(f1, 12)]}>
        <Ionicons name="nutrition" size={20} color={color.ink} />
        <Text style={sc.miniText}>Avocados</Text>
      </Animated.View>
      <Animated.View
        style={[sc.miniCard, { top: 70, right: 24 }, bobY(f2, 15)]}
      >
        <Ionicons name="cafe" size={20} color={color.ink} />
        <Text style={sc.miniText}>Cold brew</Text>
      </Animated.View>

      {/* the pill with pulsing mic */}
      <View style={sc.pillWrap}>
        <View style={sc.pill}>
          <Text style={sc.pillText}>“fresh avocados”</Text>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Animated.View
              style={[
                sc.ring,
                { opacity: ringFade, transform: [{ scale: ringScale }] },
              ]}
            />
            <LinearGradient colors={["#2FD871", "#1CA24E"]} style={sc.mic}>
              <Ionicons name="mic" size={20} color="#fff" />
            </LinearGradient>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ================= SCENE 3 — to your door ================= */
function DeliverScene() {
  const ride = useRef(new Animated.Value(0)).current;
  const f1 = useFloat(2300, 100);
  const pin = useFloat(2000);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(ride, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(500),
        Animated.timing(ride, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const rideX = ride.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 190],
  });
  const rideFade = ride.interpolate({
    inputRange: [0, 0.06, 0.94, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <View style={sc.stage}>
      <LinearGradient
        colors={["#D8F0E0", "#F0F8EE", "#FFFFFF00"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={sc.bigBlob}
      />
      {/* home card with bouncing pin */}
      <Animated.View style={[sc.heroCard, { top: 14 }, bobY(f1, 8)]}>
        <LinearGradient colors={["#FFFFFF", "#EFF8F1"]} style={sc.heroInner}>
          <Ionicons name="home" size={54} color={color.ink} />
        </LinearGradient>
      </Animated.View>
      <Animated.View style={[sc.pin, bobY(pin, 14)]}>
        <LinearGradient colors={["#2FD871", "#1CA24E"]} style={sc.pinInner}>
          <Ionicons name="location" size={18} color="#fff" />
        </LinearGradient>
      </Animated.View>

      {/* road + rider */}
      <View style={sc.road}>
        <View style={sc.roadLine} />
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={[sc.dash, { left: 18 + i * 46 }]} />
        ))}
      </View>
      <Animated.View
        style={[
          sc.rider,
          { opacity: rideFade, transform: [{ translateX: rideX }] },
        ]}
      >
        <Ionicons name="bicycle" size={40} color={color.ink} />
        <View style={sc.parcel}>
          <Ionicons name="cube" size={11} color="#fff" />
        </View>
      </Animated.View>
    </View>
  );
}

const sc = StyleSheet.create({
  stage: {
    width: 280,
    height: 280,
    alignItems: "center",
    justifyContent: "center",
  },
  bigBlob: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    transform: [{ rotate: "-12deg" }],
  },
  heroCard: {
    shadowColor: "#0A2E1A",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 8,
  },
  heroInner: {
    width: 130,
    height: 130,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  miniCard: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    shadowColor: "#0A2E1A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  },
  miniText: { fontFamily: "Jakarta_600", fontSize: 12, color: color.text },
  pillWrap: { position: "absolute", bottom: 46, left: 10, right: 10 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingLeft: 20,
    paddingRight: 7,
    height: 58,
    shadowColor: "#0A2E1A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 7,
  },
  pillText: { fontFamily: "Jakarta_500", fontSize: 14, color: color.textMuted },
  mic: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: "#2FD871",
  },
  pin: { position: "absolute", top: 0, right: 52 },
  pinInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  road: {
    position: "absolute",
    bottom: 42,
    left: 12,
    right: 12,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#E6ECE7",
    overflow: "hidden",
  },
  roadLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#2FD87155",
  },
  dash: {
    position: "absolute",
    top: 13,
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: color.accent,
    opacity: 0.85,
  },
  rider: { position: "absolute", bottom: 54 },
  parcel: {
    position: "absolute",
    top: -6,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: color.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});

/* ================= slides ================= */
type Part = { text: string; strong?: boolean };
const SLIDES: { key: string; title: Part[]; body: string; Scene: React.FC }[] =
  [
    {
      key: "market",
      title: [
        { text: "Your Whole Market, " },
        { text: "One App", strong: true },
      ],
      body: "Groceries, pharmacy, food and more — every vendor around you in your pocket.",
      Scene: MarketScene,
    },
    {
      key: "ask",
      title: [
        { text: "Just " },
        { text: "Say It", strong: true },
        { text: ", We Find It" },
      ],
      body: "Type or speak. GoMarketi finds the product and the best vendor near you.",
      Scene: AskScene,
    },
    {
      key: "deliver",
      title: [{ text: "Delivered To " }, { text: "Your Door", strong: true }],
      body: "Place the order and watch it travel live — shelf to doorstep.",
      Scene: DeliverScene,
    },
  ];

export function OnboardingScreen({ onFinish }: { onFinish: () => void }) {
  const ref = useRef<ScrollView>(null);
  const [i, setI] = useState(0);

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setI(Math.round(e.nativeEvent.contentOffset.x / width));

  const next = () =>
    i < SLIDES.length - 1
      ? ref.current?.scrollTo({ x: (i + 1) * width, animated: true })
      : onFinish();

  return (
    <View style={s.root}>
      {/* full-screen soft gradient field, like the reference */}
      <LinearGradient
        colors={["#EAF6EE", "#F6FAF4", "#DFF2E5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["#D3F0DC00", "#CDEBD8"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={s.bottomWash}
      />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <ScrollView
          ref={ref}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onEnd}
          style={{ flex: 1 }}
        >
          {SLIDES.map(({ key, title, body, Scene }) => (
            <View key={key} style={{ width, paddingHorizontal: 28 }}>
              <View style={s.sceneWrap}>
                <Scene />
              </View>
              <Text style={s.title}>
                {title.map((p, idx) => (
                  <Text key={idx} style={p.strong ? s.titleStrong : undefined}>
                    {p.text}
                  </Text>
                ))}
              </Text>
              <Text style={s.body}>{body}</Text>
            </View>
          ))}
        </ScrollView>

        {/* footer: Skip · progress · gradient orb */}
        <View style={s.footer}>
          <Pressable
            onPress={onFinish}
            hitSlop={HIT}
            accessibilityRole="button"
          >
            <Text style={s.skip}>Skip</Text>
          </Pressable>

          <View style={s.progressTrack}>
            <View
              style={[
                s.progressFill,
                { width: `${((i + 1) / SLIDES.length) * 100}%` },
              ]}
            />
          </View>

          <Pressable
            onPress={next}
            accessibilityRole="button"
            accessibilityLabel={
              i === SLIDES.length - 1 ? "Get started" : "Next"
            }
          >
            <LinearGradient
              colors={["#2FD871", "#0F7A3D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.orb}
            >
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#EAF6EE" },
  bottomWash: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 320,
  },

  sceneWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
  },

  title: {
    fontFamily: "Fredoka_500",
    fontSize: 30,
    lineHeight: 39,
    color: color.text,
    letterSpacing: -0.2,
  },
  titleStrong: { fontFamily: "Fredoka_700", color: color.ink },
  body: {
    fontFamily: "Jakarta_400",
    fontSize: 14.5,
    lineHeight: 22,
    color: color.textMuted,
    marginTop: 12,
    marginBottom: 16,
    maxWidth: 300,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingBottom: 10,
    paddingTop: 6,
    gap: 20,
  },
  skip: { fontFamily: "Jakarta_600", fontSize: 14, color: color.textMuted },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(10,46,26,0.12)",
    overflow: "hidden",
  },
  progressFill: { height: 4, borderRadius: 2, backgroundColor: color.coral },
  orb: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1CA24E",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
});
