// POST /api/studio/generate — no photo at hand? Invent ONE fresh, real-feeling
// problem for the chosen level/topic and return the same ProblemPack shape.

import { NextResponse } from "next/server";
import { jsonCall, sanitizePack, hasKey, PACK_MODEL, PACK_SPEC } from "@/lib/studio/ai";

export const maxDuration = 60;

const SYSTEM = `You are the problem author of Thebes AI — a learning tool where Korean students
solve math problems IN ENGLISH. Write ONE fresh math problem for the requested
school level and topic, then prepare it for study.

AUTHORING RULES:
- The situation must feel like real life for a Korean student (school, snacks,
  games, bus, allowance, sports) — never "철수가 사과 3개" filler.
- One clear question; solvable with reasoning at that level in a few minutes.
- Numbers chosen so the relationship is interesting (avoid trivially round results).
- If (and only if) the topic is geometric, include a matching figure.

${PACK_SPEC}`;

export async function POST(req: Request) {
  if (!hasKey()) {
    return NextResponse.json({ error: "no_key" }, { status: 503 });
  }

  let body: { level?: string; topic?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const level = body.level?.trim() || "중2";
  const topic = body.topic?.trim() || "랜덤";

  try {
    const raw = await jsonCall<Record<string, unknown>>({
      model: PACK_MODEL,
      system: SYSTEM,
      content: [
        {
          type: "text",
          text: `Level: ${level}\nTopic: ${topic === "랜덤" ? "your choice — pick something fun and level-appropriate" : topic}\n\nWrite the problem and prepare the JSON pack. Set "level" to exactly "${level}".`,
        },
      ],
      maxTokens: 3500,
    });

    const pack = sanitizePack(raw);
    if (!pack) {
      return NextResponse.json({ error: "ai_failed" }, { status: 502 });
    }
    return NextResponse.json(pack);
  } catch (err) {
    console.error("[studio/generate]", err);
    return NextResponse.json({ error: "ai_failed" }, { status: 502 });
  }
}
