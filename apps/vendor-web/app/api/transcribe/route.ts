import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Invalid file" }, { status: 400 });
    }

    // 1. Transcription (STT)
    const sttForm = new FormData();
    // CRITICAL: Groq Whisper requires a filename with a valid extension
    sttForm.append("file", file, file.name || "audio.m4a");
    sttForm.append("model", "whisper-large-v3-turbo");
    sttForm.append("response_format", "json");
    sttForm.append("language", "en");

    const sttRes = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: sttForm,
      },
    );

    if (!sttRes.ok) throw new Error("STT failed");
    const { text: transcript } = await sttRes.json();

    if (!transcript?.trim()) {
      return NextResponse.json({ text: "" });
    }

    // 2. Intent Extraction (NLP)
    const llmRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
              content:
                "You are a search intent extractor. Extract only the core product name the user wants to buy from the text. Ignore filler words. Return nothing but the product name.",
            },
            {
              role: "user",
              content: transcript.trim(),
            },
          ],
          temperature: 0,
        }),
      },
    );

    if (!llmRes.ok) {
      // Fallback to raw transcript if extraction fails
      return NextResponse.json({ text: transcript });
    }

    const llmData = await llmRes.json();
    const intent = llmData.choices?.[0]?.message?.content?.trim() || transcript;

    return NextResponse.json({ text: intent });
  } catch (e) {
    console.error("Transcribe route error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
