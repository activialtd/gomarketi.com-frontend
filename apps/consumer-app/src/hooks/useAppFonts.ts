import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";

/**
 * Loads Plus Jakarta Sans (the GoMarketi brand face) in every weight we use.
 * Reference these family names in fontFamily, e.g. style={{ fontFamily: "Jakarta_700" }}
 * or via the `font-*` classes wired in tailwind.config.js.
 */
export function useAppFonts() {
  const [loaded] = useFonts({
    Jakarta_400: PlusJakartaSans_400Regular,
    Jakarta_500: PlusJakartaSans_500Medium,
    Jakarta_600: PlusJakartaSans_600SemiBold,
    Jakarta_700: PlusJakartaSans_700Bold,
    Jakarta_800: PlusJakartaSans_800ExtraBold,
  });
  return loaded;
}
