import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { SocialButton } from "../../components/ui/SocialButton";
import { useAuth } from "../../lib/auth-context";
import { color, type, space, HIT } from "../../theme/tokens";

export function LoginScreen({
  onGoToSignup,
  onForgotPassword,
}: {
  onGoToSignup: () => void;
  onForgotPassword: () => void;
}) {
  const { signInWithEmail, signInWithGoogle, signInWithApple, isLoading, authError } =
    useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const valid = email.includes("@") && password.length >= 8;

  return (
    <SafeAreaView style={s.root} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
        >
          <Text style={type.eyebrow}>WELCOME BACK</Text>
          <Text style={[type.display, { marginTop: space.sm }]}>Sign in</Text>

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
            <Input
              label="Password"
              placeholder="Your password"
              isPassword
              autoComplete="password"
              value={password}
              onChangeText={setPassword}
            />
            <Pressable
              hitSlop={HIT}
              style={{ alignSelf: "flex-end" }}
              onPress={onForgotPassword}
            >
              <Text
                style={[
                  type.meta,
                  { fontFamily: "Jakarta_500", color: color.text },
                ]}
              >
                Forgot password?
              </Text>
            </Pressable>
          </View>

          {authError && (
            <Text style={[type.meta, { color: color.danger, marginTop: space.sm }]}>
              {authError}
            </Text>
          )}

          <View style={s.divider}>
            <View style={s.rule} />
            <Text style={type.meta}>or continue with</Text>
            <View style={s.rule} />
          </View>

          <View style={s.social}>
            <SocialButton provider="google" onPress={signInWithGoogle} />
            <SocialButton provider="apple" onPress={signInWithApple} />
          </View>
        </ScrollView>

        {/* CTA pinned — always visible, never below the fold */}
        <View style={s.cta}>
          <Button
            label="Sign in"
            loading={isLoading}
            disabled={!valid}
            onPress={() => signInWithEmail(email, password).catch(() => {})}
          />
          <View style={s.foot}>
            <Text style={type.meta}>New to GoMarketi? </Text>
            <Pressable onPress={onGoToSignup} hitSlop={HIT}>
              <Text
                style={[
                  type.meta,
                  { fontFamily: "Jakarta_600", color: color.text },
                ]}
              >
                Create account
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.canvas },
  scroll: { paddingHorizontal: space.gutter, paddingTop: 40 },
  form: { marginTop: 32, gap: space.lg },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    marginVertical: space.xxl,
  },
  rule: { flex: 1, height: 1, backgroundColor: color.line },
  social: { flexDirection: "row", gap: space.md },
  cta: { paddingHorizontal: space.gutter, paddingTop: space.md, gap: space.lg },
  foot: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: space.sm,
  },
});
