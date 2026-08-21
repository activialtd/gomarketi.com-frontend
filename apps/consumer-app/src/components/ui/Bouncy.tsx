import React, { ReactNode } from "react";
import { Pressable, PressableProps, ViewStyle, StyleProp } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * A Pressable that springs down slightly on press and back on release —
 * the tactile "squish" that makes taps feel alive instead of flat.
 * Wrap chips, buttons, cards — anything meant to feel interactive.
 */
export function Bouncy({
  children,
  style,
  scaleTo = 0.93,
  ...pressableProps
}: PressableProps & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...pressableProps}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, { damping: 14, stiffness: 320 });
        pressableProps.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 10, stiffness: 220 });
        pressableProps.onPressOut?.(e);
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
