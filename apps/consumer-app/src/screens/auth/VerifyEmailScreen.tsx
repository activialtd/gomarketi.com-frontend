import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, Pressable, Image, KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../lib/auth-context";
import { color, radius, type, space, HIT } from "../../theme/tokens";

const CELLS = 6;

export function VerifyEmailScreen({ email, onBack }: { email: string; onBack: () => void }) {
  const { verifyOtp, sendOtp, isLoading } = useAuth();
  const [digits, setDigits] = useState<string[]>(Array(CELLS).fill(""));
  const [left, setLeft] = useState(45);
  const refs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (left <= 0) return;
    const t = setInterval(() => setLeft((n) => n - 1), 1000);
    return () => clearInterval(t);
  }, [left]);

  const code = digits.join("");

  const set = (text: string, i: number) => {
    const ch = text.replace(/[^0-9]/g, "").slice(-1);
    const next = [...digits];
    next[i] = ch;
    setDigits(next);
    if (ch && i < CELLS - 1) refs.current[i + 1]?.focus();
  };

  const back = (key: string, i: number) => {
    if (key === "Backspace" && !digits[i] && i > 0) {
      const next = [...digits];
      next[i - 1] = "";
      setDigits(next);
      refs.current[i - 1]?.focus();
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

        <Image
          source={require("../../../assets/illustrations/verify-email.png")}
          style={{ width: 150, height: 150, alignSelf: "center", marginTop: 20 }}
          resizeMode="contain"
        />

        <Text style={[type.eyebrow, { marginTop: 20 }]}>VERIFY EMAIL</Text>
        <Text style={[type.display, { marginTop: space.sm }]}>Enter the code</Text>
        <Text style={[type.body, { marginTop: space.sm }]}>
          We sent a 6-digit code to {email}.
        </Text>

        <View style={s.cells}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(r) => { refs.current[i] = r; }}
              value={d}
              onChangeText={(t) => set(t, i)}
              onKeyPress={({ nativeEvent }) => back(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              accessibilityLabel={`Digit ${i + 1}`}
              style={[s.cell, !!d && { borderColor: color.primary }]}
            />
          ))}
        </View>

        <Button
          label="Verify"
          loading={isLoading}
          disabled={code.length < CELLS}
          onPress={() => verifyOtp(email, code)}
          style={{ marginTop: 32 }}
        />

        <View style={s.resend}>
          <Text style={type.meta}>Didn't get it? </Text>
          <Pressable
            onPress={() => { sendOtp(email); setLeft(45); }}
            disabled={left > 0}
            hitSlop={HIT}
          >
            <Text
              style={[
                type.meta,
                { fontFamily: "Jakarta_600", color: left > 0 ? color.muted : color.foreground },
              ]}
            >
              {left > 0 ? `Resend in ${left}s` : "Resend code"}
            </Text>
          </Pressable>
        </View>
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
  cells: { flexDirection: "row", justifyContent: "space-between", marginTop: 36 },
  cell: {
    width: 48,
    height: 56,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.background,
    textAlign: "center",
    fontFamily: "Jakarta_600",
    fontSize: 20,
    color: color.foreground,
  },
  resend: { flexDirection: "row", justifyContent: "center", marginTop: space.xl },
});
