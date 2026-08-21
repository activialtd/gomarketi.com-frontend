import React, { useState } from "react";
import {
  View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { SocialButton } from "../../components/ui/SocialButton";
import { useAuth } from "../../lib/auth-context";
import { color, type, space, HIT } from "../../theme/tokens";

export function SignupScreen({
  onGoToLogin,
  onNeedsVerification,
}: {
  onGoToLogin: () => void;
  onNeedsVerification: (email: string) => void;
}) {
  const { signUpWithEmail, sendOtp, signInWithGoogle, signInWithApple, isLoading, authError } =
    useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const valid = fullName.trim().length > 1 && email.includes("@") && password.length >= 8;

  const submit = async () => {
    try {
      await signUpWithEmail(fullName, email, password);
      await sendOtp(email);
      onNeedsVerification(email);
    } catch {
      // authError is already set by the context — nothing else to do here.
    }
  };

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
          <Text style={type.eyebrow}>GET STARTED</Text>
          <Text style={[type.display, { marginTop: space.sm }]}>Create account</Text>

          <View style={s.form}>
            <Input
              label="Full name"
              placeholder="Ada Lovelace"
              autoCapitalize="words"
              autoComplete="name"
              value={fullName}
              onChangeText={setFullName}
            />
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
              placeholder="At least 8 characters"
              isPassword
              autoComplete="new-password"
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {authError && (
            <Text style={[type.meta, { color: color.danger, marginTop: space.sm }]}>
              {authError}
            </Text>
          )}

          <View style={s.divider}>
            <View style={s.rule} />
            <Text style={type.meta}>or sign up with</Text>
            <View style={s.rule} />
          </View>

          <View style={s.social}>
            <SocialButton provider="google" onPress={signInWithGoogle} />
            <SocialButton provider="apple" onPress={signInWithApple} />
          </View>
        </ScrollView>

        <View style={s.cta}>
          <Button label="Create account" loading={isLoading} disabled={!valid} onPress={submit} />
          <View style={s.foot}>
            <Text style={type.meta}>Already have an account? </Text>
            <Pressable onPress={onGoToLogin} hitSlop={HIT}>
              <Text style={[type.meta, { fontFamily: "Jakarta_600", color: color.text }]}>
                Sign in
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
  form: { marginTop: 28, gap: space.lg },
  divider: { flexDirection: "row", alignItems: "center", gap: space.md, marginVertical: space.xxl },
  rule: { flex: 1, height: 1, backgroundColor: color.line },
  social: { flexDirection: "row", gap: space.md },
  cta: { paddingHorizontal: space.gutter, paddingTop: space.md, gap: space.lg },
  foot: { flexDirection: "row", justifyContent: "center", paddingBottom: space.sm },
});
