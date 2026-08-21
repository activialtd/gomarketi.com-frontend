import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../lib/auth-context";
import { color, radius, type, space, HIT } from "../../theme/tokens";

export function ForgotPasswordScreen({
  onBack,
  onCodeSent,
}: {
  onBack: () => void;
  onCodeSent: (email: string) => void;
}) {
  const { requestPasswordReset, isLoading, authError } = useAuth();
  const [email, setEmail] = useState("");

  const valid = email.includes("@");

  const submit = async () => {
    try {
      await requestPasswordReset(email);
      onCodeSent(email);
    } catch {
      // authError is already set by the context.
    }
  };

  return (
    <SafeAreaView style={s.root} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={s.body}
      >
        <Pressable onPress={onBack} hitSlop={HIT} accessibilityLabel="Back" style={s.back}>
          <Ionicons name="arrow-back" size={20} color={color.foreground} />
        </Pressable>

        <Text style={[type.eyebrow, { marginTop: 20 }]}>RESET PASSWORD</Text>
        <Text style={[type.display, { marginTop: space.sm }]}>Forgot password?</Text>
        <Text style={[type.body, { marginTop: space.sm }]}>
          Enter your email and we'll send you a code to reset your password.
        </Text>

        <View style={s.form}>
          <Input
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {authError && (
          <Text style={[type.meta, { color: color.danger, marginTop: space.sm }]}>
            {authError}
          </Text>
        )}

        <Button
          label="Send code"
          loading={isLoading}
          disabled={!valid}
          onPress={submit}
          style={{ marginTop: 32 }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.background },
  body: { flex: 1, paddingHorizontal: space.gutter, paddingTop: space.sm },
  back: {
    width: 40,
    height: 40,
    borderRadius: radius.chip,
    backgroundColor: color.background,
    borderWidth: 1,
    borderColor: color.border,
    alignItems: "center",
    justifyContent: "center",
  },
  form: { marginTop: 28, gap: space.lg },
});
