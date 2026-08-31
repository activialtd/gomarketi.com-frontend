import React from "react";
import { View, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/lib/auth-context";
import { CartProvider } from "./src/lib/cart-context";
import { OrdersProvider } from "./src/lib/orders-context";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { installGlobalErrorHandler } from "./src/lib/error-reporting";
import { useAppFonts } from "./src/hooks/useAppFonts";
import { color } from "./src/theme/tokens";

installGlobalErrorHandler();

export default function App() {
  const fontsLoaded = useAppFonts();
  if (!fontsLoaded)
    return <View style={{ flex: 1, backgroundColor: color.canvas }} />;

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={color.canvas} />
      <ErrorBoundary>
        <AuthProvider>
          <OrdersProvider>
            <CartProvider>
              <AppNavigator />
            </CartProvider>
          </OrdersProvider>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
