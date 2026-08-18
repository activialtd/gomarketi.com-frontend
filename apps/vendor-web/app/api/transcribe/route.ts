import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "STT not configured" }, { status: 500 });
  }

  try {
    // Consumer app sends multipart/form-data with the audio file
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Rebuild the form for Groq — same field names as OpenAI's Whisper API
    const groqForm = new FormData();
    groqForm.append("file", file);
    groqForm.append("model", "whisper-large-v3-turbo"); // fast + accurate
    groqForm.append("response_format", "json");
    groqForm.append("language", "en"); // hint: English (covers Nigerian accents well)
    // Optional: bias transcription toward marketplace terminology
    groqForm.append(
      "prompt",
      "Product search. Common terms: avocado, coffee, sneakers, pharmacy, groceries, fashion, jollof, tomatoes.",
    );

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: groqForm,
      },
    );

    if (!groqRes.ok) {
      const err = await groqRes.text();
      console.error("Groq error:", err);
      return NextResponse.json(
        { error: "Transcription failed" },
        { status: 502 },
      );
    }

    const { text } = await groqRes.json();
    return NextResponse.json({ text: text?.trim() ?? "" });
  } catch (e) {
    console.error("Transcribe route error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
