import { useState, useRef, useCallback } from "react";
import { Audio } from "expo-av";
import { Alert } from "react-native";

const TRANSCRIBE_ENDPOINT = "https://vendor.gomarketi.com/api/transcribe";
// const TRANSCRIBE_ENDPOINT = "http://localhost:3000/api/transcribe";

export function useVoiceSearch(onResult: (text: string) => void) {
  const [state, setState] = useState<
    "idle" | "recording" | "processing" | "error"
  >("idle");
  const recordingRef = useRef<Audio.Recording | null>(null);

  const start = useCallback(async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status !== "granted") {
        Alert.alert(
          "Microphone access needed",
          "Enable microphone permission in Settings to search by voice.",
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      await rec.startAsync();

      recordingRef.current = rec;
      setState("recording");
    } catch (e) {
      console.error("Recording start failed:", e);
      setState("error");
    }
  }, []);

  const stop = useCallback(async () => {
    const rec = recordingRef.current;
    if (!rec) return;

    try {
      setState("processing");
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      recordingRef.current = null;

      if (!uri) throw new Error("No recording URI");

      // Send to backend as multipart/form-data
      const form = new FormData();
      form.append("file", {
        uri,
        name: "search.m4a",
        type: "audio/m4a",
      } as any);

      const res = await fetch(TRANSCRIBE_ENDPOINT, {
        method: "POST",
        body: form,
      });

      if (!res.ok) throw new Error(`STT ${res.status}`);
      const { text } = await res.json();

      if (text) onResult(text);
      setState("idle");
    } catch (e) {
      console.error("Transcription failed:", e);
      setState("error");
      Alert.alert(
        "Voice search unavailable",
        "Couldn't hear you clearly. Try typing your search instead.",
      );
      setTimeout(() => setState("idle"), 500);
    }
  }, [onResult]);

  const cancel = useCallback(async () => {
    const rec = recordingRef.current;
    if (rec) {
      try {
        await rec.stopAndUnloadAsync();
      } catch {}
      recordingRef.current = null;
    }
    setState("idle");
  }, []);

  return { state, start, stop, cancel };
}
