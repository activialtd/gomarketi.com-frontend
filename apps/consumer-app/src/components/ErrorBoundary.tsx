import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { reportClientError } from "../lib/api-client";
import { color, type, space } from "../theme/tokens";

/**
 * Catches render errors and prints them on screen.
 *
 * Without this, a throw inside any screen unmounts the tree and you get a
 * blank white view with nothing in the terminal — which is exactly the failure
 * you hit. Keep this mounted in dev.
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
    reportClientError({
      service: "consumer-app",
      message: error.message,
      stack: error.stack,
      context: { componentStack: info.componentStack, kind: "render-error-boundary" },
    });
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <ScrollView style={s.wrap} contentContainerStyle={{ padding: space.gutter, paddingTop: 80 }}>
        <Text style={[type.title, { marginBottom: space.md }]}>Something threw</Text>
        <Text style={[type.body, { marginBottom: space.lg }]}>
          {error.message}
        </Text>
        <Text style={[type.meta, { fontFamily: "Jakarta_400" }]}>
          {error.stack?.split("\n").slice(0, 12).join("\n")}
        </Text>
      </ScrollView>
    );
  }
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: color.background },
});
