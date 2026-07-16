import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  Easing,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { color, space } from "../../theme/tokens";

const { width, height } = Dimensions.get("window");

/**
 * Full-screen takeover after a Home search:
 * shopper walks the ground line → knocks (store shakes, ripples) → door flash
 * → onReveal() opens the modal UNDERNEATH → the whole scene fades/lifts away
 * → onGone() unmounts it. The modal slides up while this dissolves: a
 * cross-fade, not a hard cut.
 */

function Road() {
  const TILES = 9;
  return (
    <View style={r.road}>
      {/* pavement tiles */}
      <View style={r.tiles}>
        {Array.from({ length: TILES }).map((_, i) => (
          <View key={i} style={[r.tile, i % 2 === 1 && r.tileAlt]} />
        ))}
      </View>
      {/* green edge lines */}
      <View style={[r.edge, { top: 3 }]} />
      <View style={[r.edge, { bottom: 3 }]} />
      {/* dashed green center line */}
      <View style={r.center}>
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={i} style={r.dash} />
        ))}
      </View>
    </View>
  );
}

const r = StyleSheet.create({
  road: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
    height: 44,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#E6ECE7",
    borderWidth: 1,
    borderColor: color.lineStrong,
  },
  tiles: { ...StyleSheet.absoluteFill, flexDirection: "row" },
  tile: {
    flex: 1,
    borderRightWidth: 1.5,
    borderColor: "#D7DFD9",
    backgroundColor: "#E9EFEA",
  },
  tileAlt: { backgroundColor: "#E2E9E3" },
  edge: {
    position: "absolute",
    left: 6,
    right: 6,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: color.primary,
    opacity: 0.75,
  },
  center: {
    position: "absolute",
    left: 10,
    right: 10,
    top: "50%",
    marginTop: -1.5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dash: {
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: color.accent,
    opacity: 0.9,
  },
});

export function WalkToMarketOverlay({
  query,
  onReveal,
  onGone,
}: {
  query: string;
  onReveal: () => void;
  onGone: () => void;
}) {
  const walk = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const knock = useRef(new Animated.Value(0)).current;
  const ripple = useRef(new Animated.Value(0)).current;
  const door = useRef(new Animated.Value(0)).current;
  const scene = useRef(new Animated.Value(0)).current; // 0 hidden → 1 shown → back to 0
  const ambient = useRef(new Animated.Value(0)).current; // background drift

  useEffect(() => {
    const stepLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    );
    const ambientLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(ambient, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ambient, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    stepLoop.start();
    ambientLoop.start();

    Animated.sequence([
      Animated.timing(scene, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(walk, {
        toValue: 1,
        duration: 1600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.sequence([
          Animated.timing(knock, {
            toValue: 1,
            duration: 90,
            useNativeDriver: true,
          }),
          Animated.timing(knock, {
            toValue: -1,
            duration: 90,
            useNativeDriver: true,
          }),
          Animated.timing(knock, {
            toValue: 1,
            duration: 90,
            useNativeDriver: true,
          }),
          Animated.timing(knock, {
            toValue: 0,
            duration: 90,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(ripple, {
          toValue: 1,
          duration: 430,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(door, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onReveal(); // modal starts sliding up now…
      Animated.timing(scene, {
        toValue: 0,
        duration: 480,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        stepLoop.stop();
        ambientLoop.stop();
        onGone(); // …and only then do we unmount
      });
    });
  }, []);

  const trackW = width - 170;
  const translateX = walk.interpolate({
    inputRange: [0, 1],
    outputRange: [0, trackW],
  });
  const stepY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });
  const lean = bob.interpolate({
    inputRange: [0, 1],
    outputRange: ["-4deg", "7deg"],
  });
  const shake = knock.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-6deg", "6deg"],
  });
  const rippleScale = ripple.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 2.1],
  });
  const rippleFade = ripple.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 0],
  });
  const doorScale = door.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1.7],
  });
  const doorFade = door.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0, 0.55, 0],
  });
  const sceneLift = scene.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 0],
  });
  const ambDrift = ambient.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 18],
  });
  const sunPulse = ambient.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  return (
    <Animated.View
      style={[
        s.overlay,
        { opacity: scene, transform: [{ translateY: sceneLift }] },
      ]}
      pointerEvents="auto"
    >
      {/* ambience: sun + drifting washes */}
      <Animated.View style={[s.sun, { transform: [{ scale: sunPulse }] }]} />
      <Animated.View
        style={[s.wash, s.washA, { transform: [{ translateX: ambDrift }] }]}
      />
      <Animated.View
        style={[
          s.wash,
          s.washB,
          { transform: [{ translateX: Animated.multiply(ambDrift, -1) }] },
        ]}
      />

      {/* caption up top */}
      <View style={s.captionWrap}>
        <Text style={s.captionEyebrow}>GOMARKETI</Text>
        <Text style={s.caption}>
          Off to the market{"\n"}for “{query}”…
        </Text>
      </View>

      {/* ground scene pinned to lower third */}
      <View style={s.scene}>
        <Road />

        <Animated.View style={[s.store, { transform: [{ rotate: shake }] }]}>
          <Animated.View
            style={[
              s.doorFlash,
              { opacity: doorFade, transform: [{ scale: doorScale }] },
            ]}
          />
          <Animated.View
            style={[
              s.ripple,
              { opacity: rippleFade, transform: [{ scale: rippleScale }] },
            ]}
          />
          <View style={s.storeBody}>
            <Ionicons name="storefront" size={58} color={color.ink} />
          </View>
          <Text style={s.storeLabel}>Market</Text>
        </Animated.View>

        <Animated.View
          style={[
            s.walker,
            {
              transform: [
                { translateX },
                { translateY: stepY },
                { rotate: lean },
              ],
            },
          ]}
        >
          <Ionicons name="walk" size={52} color={color.ink} />
          <View style={s.bag}>
            <Ionicons name="bag-handle" size={15} color={color.onInk} />
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: color.canvas, // fully opaque takeover
    zIndex: 40,
  },

  sun: {
    position: "absolute",
    top: height * 0.12,
    right: 44,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E9F2A8",
  },
  wash: { position: "absolute", borderRadius: 200 },
  washA: {
    top: height * 0.28,
    left: -80,
    width: 300,
    height: 160,
    backgroundColor: "#DFF2E5",
    opacity: 0.7,
    transform: [{ rotate: "-12deg" }],
  },
  washB: {
    top: height * 0.05,
    left: width * 0.15,
    width: 260,
    height: 130,
    backgroundColor: "#EAF6EE",
    opacity: 0.8,
    transform: [{ rotate: "8deg" }],
  },

  captionWrap: {
    position: "absolute",
    top: height * 0.2,
    alignSelf: "center",
    alignItems: "center",
  },
  captionEyebrow: {
    fontFamily: "Jakarta_600",
    fontSize: 11,
    letterSpacing: 2,
    color: color.textFaint,
  },
  caption: {
    fontFamily: "Jakarta_700",
    fontSize: 26,
    lineHeight: 34,
    color: color.text,
    textAlign: "center",
    marginTop: 10,
    letterSpacing: -0.3,
  },

  scene: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: height * 0.18,
    height: 170,
  },
  ground: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: color.lineStrong,
  },
  path: {
    position: "absolute",
    left: 28,
    right: 120,
    bottom: 26,
    borderBottomWidth: 2,
    borderColor: color.lineStrong,
    borderStyle: "dashed",
  },

  walker: { position: "absolute", left: 24, bottom: 6 },
  bag: {
    position: "absolute",
    right: -10,
    bottom: 4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: color.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  store: { position: "absolute", right: 30, bottom: 2, alignItems: "center" },
  storeBody: {
    width: 92,
    height: 92,
    borderRadius: 26,
    backgroundColor: color.card,
    borderWidth: 1.5,
    borderColor: color.line,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0A2E1A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 5,
  },
  storeLabel: {
    fontFamily: "Jakarta_600",
    fontSize: 12,
    color: color.textMuted,
    marginTop: 8,
  },
  ripple: {
    position: "absolute",
    top: -6,
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: color.primary,
  },
  doorFlash: {
    position: "absolute",
    top: -6,
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: color.accent,
  },
});
