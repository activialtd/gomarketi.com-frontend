import { createContext, useContext } from "react";

export type ScreenName =
  | "home"
  | "cart"
  | "checkout"
  | "orders"
  | "track"
  | "profile"
  | "settings"
  | "notifications"
  | "product"
  | "store"
  | "markets"
  | "marketDetail";

// Added 'id' here so the navigator can track unique stack entries
export type Route = {
  id: number;
  name: ScreenName;
  params?: Record<string, any>;
};

export type Nav = {
  push: (name: ScreenName, params?: Record<string, any>) => void;
  pop: () => void;
  reset: (name: ScreenName) => void;
  current: Route;
};

export const NavContext = createContext<Nav | undefined>(undefined);

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used inside AppNavigator");
  return ctx;
}
