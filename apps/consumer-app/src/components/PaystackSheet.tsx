import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { color, space, HIT } from "../theme/tokens";

/**
 * Paystack Inline checkout inside a WebView.
 * SECURITY: only the PUBLIC key lives here. After onSuccess you MUST verify
 * the reference server-side (GET /transaction/verify/:reference with the
 * SECRET key) before fulfilling — client "success" alone is not proof.
 */
const PAYSTACK_PUBLIC_KEY = process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";

export function PaystackSheet({
  email,
  amountKobo,
  reference,
  onSuccess,
  onCancel,
}: {
  email: string;
  amountKobo: number;
  reference: string;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
}) {
  const html = `
    <!DOCTYPE html><html><head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <script src="https://js.paystack.co/v1/inline.js"></script>
    </head><body style="background:#F4F6F4">
      <script>
        var handler = PaystackPop.setup({
          key: "${PAYSTACK_PUBLIC_KEY}",
          email: "${email}",
          amount: ${amountKobo},
          currency: "NGN",
          ref: "${reference}",
          callback: function (response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ event: "success", reference: response.reference }));
          },
          onClose: function () {
            window.ReactNativeWebView.postMessage(JSON.stringify({ event: "cancel" }));
          }
        });
        handler.openIframe();
      </script>
    </body></html>`;

  return (
    <Modal animationType="slide" onRequestClose={onCancel}>
      <View style={s.root}>
        <View style={s.bar}>
          <Text style={s.title}>Secure payment</Text>
          <Pressable
            onPress={onCancel}
            hitSlop={HIT}
            accessibilityLabel="Close payment"
          >
            <Ionicons name="close" size={22} color={color.text} />
          </Pressable>
        </View>
        <WebView
          originWhitelist={["*"]}
          source={{ html, baseUrl: "https://paystack.com" }}
          onMessage={(e) => {
            try {
              const msg = JSON.parse(e.nativeEvent.data);
              if (msg.event === "success") onSuccess(msg.reference);
              else onCancel();
            } catch {
              onCancel();
            }
          }}
          style={{ flex: 1 }}
        />
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.canvas, paddingTop: 54 },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.gutter,
    paddingBottom: space.md,
  },
  title: { fontFamily: "Jakarta_700", fontSize: 16, color: color.text },
});
