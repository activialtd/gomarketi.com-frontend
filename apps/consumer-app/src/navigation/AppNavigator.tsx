import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { View } from "react-native";
import { MotiView } from "moti";
import { Easing } from "react-native-reanimated";
import { useAuth } from "../lib/auth-context";
import { SplashScreen } from "../screens/SplashScreen";
import { OnboardingScreen } from "../screens/onboarding/OnboardingScreen";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { SignupScreen } from "../screens/auth/SignupScreen";
import { VerifyEmailScreen } from "../screens/auth/VerifyEmailScreen";
import { ForgotPasswordScreen } from "../screens/auth/ForgotPasswordScreen";
import { ResetPasswordScreen } from "../screens/auth/ResetPasswordScreen";
import { HomeScreen } from "../screens/home/HomeScreen";
import { CartScreen } from "../screens/cart/CartScreen";
import { CheckoutScreen } from "../screens/checkout/CheckoutScreen";
import { OrdersScreen } from "../screens/orders/OrdersScreen";
import { TrackOrderScreen } from "../screens/orders/TrackOrderScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { SettingsScreen } from "../screens/settings/SettingsScreen";
import { NotificationsScreen } from "../screens/notifications/NotificationsScreen";
import { FloatingHub } from "../components/ui/FloatingHub";
import { ProductDetailScreen } from "../screens/product/ProductDetailsScreen";
import { StoreDetailScreen } from "../screens/store/StoreDetailScreen";
import { MarketsScreen } from "../screens/markets/MarketsScreen";
import { MarketDetailScreen } from "../screens/markets/MarketDetailScreen";

export type ScreenName =
  | "home"
  | "cart"
  | "checkout"
  | "orders"
  | "track"
  | "profile"
  | "settings"
  | "product"
  | "store"
  | "markets"
  | "marketDetail"
  | "notifications";

type Route = { id: number; name: ScreenName; params?: Record<string, any> };

let nextRouteID = 1;

type Nav = {
  push: (name: ScreenName, params?: Record<string, any>) => void;
  pop: () => void;
  reset: (name: ScreenName) => void;
  current: Route;
};

const NavContext = createContext<Nav | undefined>(undefined);
export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used inside AppNavigator");
  return ctx;
}

/** Screens where the floating hub stays hidden (payment/tracking need the space). */
const HUB_HIDDEN: ScreenName[] = ["checkout", "track"];

/**
 * Cross-fade + rise wrapper for a screen swap. Keyed by routeKey so Moti
 * remounts (and replays its entrance animation) every time the route
 * changes — this app uses a custom stack instead of react-navigation, so
 * there's no navigator-level transition to hook into otherwise.
 */
function Transition({ routeKey, children }: { routeKey: string; children: ReactNode }) {
  return (
    <MotiView
      key={routeKey}
      style={{ flex: 1 }}
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 280, easing: Easing.out(Easing.cubic) }}
    >
      {children}
    </MotiView>
  );
}

const SCREENS: Record<ScreenName, (p: any) => ReactNode> = {
  home: () => <HomeScreen />,
  cart: () => <CartScreen />,
  checkout: () => <CheckoutScreen />,
  orders: () => <OrdersScreen />,
  track: (p) => <TrackOrderScreen orderId={p?.orderId} />,
  profile: () => <ProfileScreen />,
  settings: () => <SettingsScreen />,
  notifications: () => <NotificationsScreen />,
  product: (p) => <ProductDetailScreen productId={p?.productId} product={p?.product} />,
  store: (p) => <StoreDetailScreen store={p?.store} />,
  markets: () => <MarketsScreen />,
  marketDetail: (p) => <MarketDetailScreen market={p?.market} />,
};

export function AppNavigator() {
  const { isAuthenticated, isRestoring } = useAuth();
  const [phase, setPhase] = useState<"splash" | "onboarding" | "auth">(
    "splash",
  );
  const [splashTimerDone, setSplashTimerDone] = useState(false);
  const [authScreen, setAuthScreen] = useState<
    "login" | "signup" | "verify" | "forgot" | "reset"
  >("login");
  const [pendingEmail, setPendingEmail] = useState("");
  const [stack, setStack] = useState<Route[]>([{ id: 0, name: "home" }]);

  // Hold on the splash screen until both the brand-hold timer AND the
  // session restore check have finished, so a returning user never sees a
  // flash of the login screen before restoreSession resolves them in.
  useEffect(() => {
    if (phase === "splash" && splashTimerDone && !isRestoring) {
      setPhase("onboarding");
    }
  }, [phase, splashTimerDone, isRestoring]);

  if (!isAuthenticated) {
    if (phase === "splash") {
      return <SplashScreen onDone={() => setSplashTimerDone(true)} />;
    }
    if (phase === "onboarding")
      return (
        <Transition routeKey="onboarding">
          <OnboardingScreen onFinish={() => setPhase("auth")} />
        </Transition>
      );
    if (authScreen === "signup")
      return (
        <Transition routeKey="signup">
          <SignupScreen
            onGoToLogin={() => setAuthScreen("login")}
            onNeedsVerification={(e) => {
              setPendingEmail(e);
              setAuthScreen("verify");
            }}
          />
        </Transition>
      );
    if (authScreen === "verify")
      return (
        <Transition routeKey="verify">
          <VerifyEmailScreen
            email={pendingEmail}
            onBack={() => setAuthScreen("signup")}
          />
        </Transition>
      );
    if (authScreen === "forgot")
      return (
        <Transition routeKey="forgot">
          <ForgotPasswordScreen
            onBack={() => setAuthScreen("login")}
            onCodeSent={(e) => {
              setPendingEmail(e);
              setAuthScreen("reset");
            }}
          />
        </Transition>
      );
    if (authScreen === "reset")
      return (
        <Transition routeKey="reset">
          <ResetPasswordScreen
            email={pendingEmail}
            onBack={() => setAuthScreen("forgot")}
            onDone={() => setAuthScreen("login")}
          />
        </Transition>
      );
    return (
      <Transition routeKey="login">
        <LoginScreen
          onGoToSignup={() => setAuthScreen("signup")}
          onForgotPassword={() => setAuthScreen("forgot")}
        />
      </Transition>
    );
  }

  const current = stack[stack.length - 1];
  const nav: Nav = {
    current,
    push: (name, params) => setStack((s) => [...s, { id: nextRouteID++, name, params }]),
    pop: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    reset: (name) => setStack([{ id: nextRouteID++, name }]),
  };

  const routeKey = `${current.name}:${current.id}`;

  return (
    <NavContext.Provider value={nav}>
      <View style={{ flex: 1 }}>
        <Transition routeKey={routeKey}>
          {SCREENS[current.name](current.params)}
        </Transition>
        {!HUB_HIDDEN.includes(current.name) && <FloatingHub />}
      </View>
    </NavContext.Provider>
  );
}
