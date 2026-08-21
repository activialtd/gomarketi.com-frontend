import {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
  runOnJS,
  type SharedValue,
} from "react-native-reanimated";
import { space } from "../../theme/tokens";

export const ITEM_WIDTH = 210;
export const ITEM_GAP = space.md;
export const ITEM_SIZE = ITEM_WIDTH + ITEM_GAP;

/**
 * Drives a fanned "coverflow" carousel from scroll position alone (UI
 * thread, no JS-thread polling) — cards scale up, rise, and go fully
 * opaque near the center, receding on either side. Extracted out of
 * ProductCoverflow so VendorCarousel can reuse the exact same physics with
 * its own card renderer, instead of duplicating the interpolation math.
 */
export function useCoverflowScroll(onEndReached?: () => void) {
  const scrollX = useSharedValue(0);
  const firedEndReached = useSharedValue(false);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
    if (!onEndReached) return;
    const distanceFromEnd =
      e.contentSize.width - e.layoutMeasurement.width - e.contentOffset.x;
    if (distanceFromEnd < ITEM_SIZE * 2 && !firedEndReached.value) {
      firedEndReached.value = true;
      runOnJS(onEndReached)();
    } else if (distanceFromEnd >= ITEM_SIZE * 2) {
      firedEndReached.value = false;
    }
  });

  return { scrollX, onScroll };
}

export function useCoverflowItemStyle(index: number, scrollX: SharedValue<number>) {
  return useAnimatedStyle(() => {
    const inputRange = [(index - 1) * ITEM_SIZE, index * ITEM_SIZE, (index + 1) * ITEM_SIZE];
    const scale = interpolate(scrollX.value, inputRange, [0.86, 1, 0.86], Extrapolation.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [22, 0, 22], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.55, 1, 0.55], Extrapolation.CLAMP);
    // Reanimated's transform style type is a strict discriminated union (each
    // variant requires every other transform key set to `undefined`), which
    // rejects the common { scale }, { translateY } pattern outright — a known
    // friction point with no non-cast fix. Same code as before extraction;
    // this cast is narrowly scoped to just the transform array.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transform = [{ scale }, { translateY }] as any;
    return { transform, opacity };
  });
}
