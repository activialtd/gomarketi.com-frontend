import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from "@expo-google-fonts/fredoka";

/**
 * Loads both brand faces:
 *  - Plus Jakarta Sans for body copy and UI chrome (fontFamily: "Jakarta_*")
 *  - Fredoka for headlines/display type — its rounded shapes are what give
 *    the home screen and splash their playful, cartoon-ish feel
 *    (fontFamily: "Fredoka_*")
 */
export function useAppFonts() {
  const [loaded] = useFonts({
    Jakarta_400: PlusJakartaSans_400Regular,
    Jakarta_500: PlusJakartaSans_500Medium,
    Jakarta_600: PlusJakartaSans_600SemiBold,
    Jakarta_700: PlusJakartaSans_700Bold,
    Jakarta_800: PlusJakartaSans_800ExtraBold,
    Fredoka_400: Fredoka_400Regular,
    Fredoka_500: Fredoka_500Medium,
    Fredoka_600: Fredoka_600SemiBold,
    Fredoka_700: Fredoka_700Bold,
  });
  return loaded;
}
