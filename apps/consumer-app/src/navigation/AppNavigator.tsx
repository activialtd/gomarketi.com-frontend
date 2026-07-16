import React, { createContext, useContext, useState, ReactNode } from "react";
import { View } from "react-native";
import { useAuth } from "../lib/auth-context";
import { SplashScreen } from "../screens/SplashScreen";
import { OnboardingScreen } from "../screens/onboarding/OnboardingScreen";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { SignupScreen } from "../screens/auth/SignupScreen";
import { VerifyEmailScreen } from "../screens/auth/VerifyEmailScreen";
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

export type ScreenName =
  | "home"
  | "cart"
  | "checkout"
  | "orders"
  | "track"
  | "profile"
  | "settings"
  | "product"
  | "notifications";

type Route = { name: ScreenName; params?: Record<string, any> };

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

const SCREENS: Record<ScreenName, (p: any) => ReactNode> = {
  home: () => <HomeScreen />,
  cart: () => <CartScreen />,
  checkout: () => <CheckoutScreen />,
  orders: () => <OrdersScreen />,
  track: (p) => <TrackOrderScreen orderId={p?.orderId} />,
  profile: () => <ProfileScreen />,
  settings: () => <SettingsScreen />,
  notifications: () => <NotificationsScreen />,
  product: (p) => <ProductDetailScreen productId={p?.productId} />,
};

export function AppNavigator() {
  const { isAuthenticated } = useAuth();
  const [phase, setPhase] = useState<"splash" | "onboarding" | "auth">(
    "splash",
  );
  const [authScreen, setAuthScreen] = useState<"login" | "signup" | "verify">(
    "login",
  );
  const [pendingEmail, setPendingEmail] = useState("");
  const [stack, setStack] = useState<Route[]>([{ name: "home" }]);

  if (!isAuthenticated) {
    if (phase === "splash")
      return <SplashScreen onDone={() => setPhase("onboarding")} />;
    if (phase === "onboarding")
      return <OnboardingScreen onFinish={() => setPhase("auth")} />;
    if (authScreen === "signup")
      return (
        <SignupScreen
          onGoToLogin={() => setAuthScreen("login")}
          onNeedsVerification={(e) => {
            setPendingEmail(e);
            setAuthScreen("verify");
          }}
        />
      );
    if (authScreen === "verify")
      return (
        <VerifyEmailScreen
          email={pendingEmail}
          onBack={() => setAuthScreen("signup")}
        />
      );
    return <LoginScreen onGoToSignup={() => setAuthScreen("signup")} />;
  }

  const current = stack[stack.length - 1];
  const nav: Nav = {
    current,
    push: (name, params) => setStack((s) => [...s, { name, params }]),
    pop: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    reset: (name) => setStack([{ name }]),
  };

  return (
    <NavContext.Provider value={nav}>
      <View style={{ flex: 1 }}>
        {SCREENS[current.name](current.params)}
        {!HUB_HIDDEN.includes(current.name) && <FloatingHub />}
      </View>
    </NavContext.Provider>
  );
}
