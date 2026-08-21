import { useEffect } from "react";
import { Keyboard, Platform } from "react-native";
import { useSharedValue, withTiming, SharedValue } from "react-native-reanimated";

/**
 * Tracks the on-screen keyboard height as a Reanimated shared value, so a
 * sheet/input can animate in perfect sync with the keyboard rising instead
 * of jumping or being covered. iOS fires "will" events (pre-animation);
 * Android only fires "did" events.
 */
export function useKeyboardHeight(): SharedValue<number> {
  const height = useSharedValue(0);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      height.value = withTiming(e.endCoordinates.height, {
        duration: e.duration || 250,
      });
    });
    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      height.value = withTiming(0, { duration: e.duration || 250 });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [height]);

  return height;
}
