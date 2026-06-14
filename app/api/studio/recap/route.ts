// POST /api/studio/recap — the student's plan lines → ONE clean English
// paragraph in THEIR voice. This paragraph is the prompt seed for the makers
// (game/video/quiz) and the trace-write exercise.

import { NextResponse } from "next/server";
import { jsonCall, hasKey, PACK_MODEL, englishBand } from "@/lib/studio/ai";

export const maxDuration = 30;

const SYSTEM = `You are the recap writer of Thebes AI. A Korean student planned how to solve a
math problem, line by line, in (imperfect) English. Stitch THEIR lines into ONE
flowing English paragraph.

Return STRICT JSON: { "paragraph": string }

RULES:
- 60–110 words, first person ("First, I ...").
- PRESERVE their ideas, their order, and their key words wherever possible —
  fix grammar and connect the steps, but it must still sound like THEIR plan,
  not a textbook solution.
- Translate any Korean fragments into simple English.
- Do NOT add new solution steps they didn't write. Do NOT state the final answer.
- Plain text only — no math delimiters, no markdown.`;

export async function POST(req: Request) {
  if (!hasKey()) {
    return NextResponse.json({ error: "no_key" }, { status: 503 });
  }

  let body: { english?: string; lines?: string[]; level?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const english = body.english?.trim();
  const lines = Array.isArray(body.lines)
    ? body.lines.map((l) => String(l).trim()).filter(Boolean)
    : [];
  if (!english || lines.length === 0) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const out = await jsonCall<{ paragraph: string }>({
      model: PACK_MODEL,
      system: SYSTEM,
      content: [
        {
          type: "text",
          text: `PROBLEM:\n${english}\n\nTHE STUDENT'S PLAN LINES:\n${lines
            .map((l, i) => `${i + 1}. ${l}`)
            .join("\n")}\n\nWrite the paragraph at this English level: ${englishBand(body.level).guide}`,
        },
      ],
      maxTokens: 500,
    });

    if (typeof out.paragraph !== "string" || !out.paragraph.trim()) {
      return NextResponse.json({ error: "ai_failed" }, { status: 502 });
    }
    return NextResponse.json({ paragraph: out.paragraph.trim() });
  } catch (err) {
    console.error("[studio/recap]", err);
    return NextResponse.json({ error: "ai_failed" }, { status: 502 });
  }
}
