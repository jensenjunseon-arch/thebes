// POST /api/studio/line — one plan line from the student → instant micro-
// feedback (Haiku for ~1s latency). The coach rewards the move, names what's
// missing, and never reveals the answer.

import { NextResponse } from "next/server";
import { jsonCall, hasKey, LINE_MODEL, englishBand } from "@/lib/studio/ai";
import type { LineFeedback } from "@/lib/studio/types";

export const maxDuration = 30;

const SYSTEM = `You are a warm, sharp math-thinking coach inside Thebes AI. A Korean student is
planning how to solve ONE math problem by writing their plan line by line, in
English (Korean fragments are okay — gently model the English).

You receive: the problem, the lines so far, and the NEW line. Judge ONLY the new
line as a step in the plan.

Return STRICT JSON:
{
  "verdict": "great" | "good" | "hint",
  "comment": string,        // 1–2 SHORT Korean lines, specific to THEIR line — name the move they made or the exact thing to look at next; never generic praise
  "betterEnglish": string,  // the same idea in one clean, natural English sentence (always include; if their English was already clean, polish lightly)
  "planComplete": boolean   // true when the plan as a whole now covers everything needed to solve the problem
}

RULES:
- "great" = a real reasoning move (identifies a quantity, a relationship, a strategy step).
- "good"  = on track but vague — say exactly what to sharpen.
- "hint"  = stuck or off track — give ONE pointed question to redirect, not the method.
- NEVER state the final answer or do the arithmetic for them.
- planComplete only when the lines truly chain start → finish.
- Korean comments must be specific: quote their own word/number when possible.`;

// Suggest mode: writing math in English is HARD at first — so on demand we
// hand the student ONE ideal next line to TRACE ("이렇게 써보는 건 어때요?"),
// with its Korean meaning. Tracing a good sentence teaches more than staring
// at an empty box.
const SUGGEST_SYSTEM = `You are a warm math-thinking coach inside Thebes AI. A Korean student is
planning how to solve ONE math problem line by line in English, and asked for a
model sentence to trace.

You receive the problem and their plan so far. Write the single best NEXT plan
line for them to trace.

Return STRICT JSON:
{
  "suggestion": string,    // ONE very short English sentence, ≤8 words, concrete to THIS problem (use its real numbers/objects). The student will REBUILD it by tapping word chips, so keep it short and the words common.
  "suggestionKo": string   // its Korean meaning, one short line
}

RULES:
- It must be the genuinely useful next step given the plan so far (first line → what we need to find; later → the next move).
- NEVER state the final answer or complete the last arithmetic step.
- Keep it the SIMPLEST possible English. No semicolons, no subclauses. Short is better than clever.`;

export async function POST(req: Request) {
  if (!hasKey()) {
    return NextResponse.json({ error: "no_key" }, { status: 503 });
  }

  let body: {
    english?: string;
    lines?: string[];
    line?: string;
    level?: string;
    mode?: "feedback" | "suggest";
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const english = body.english?.trim();
  if (!english) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const lines = Array.isArray(body.lines) ? body.lines.slice(0, 20) : [];
  const band = englishBand(body.level);

  // ── suggest: one ideal next line to trace ─────────────────────────────────
  if (body.mode === "suggest") {
    try {
      const out = await jsonCall<{ suggestion: string; suggestionKo: string }>({
        model: LINE_MODEL,
        system: SUGGEST_SYSTEM,
        content: [
          {
            type: "text",
            text: `PROBLEM:\n${english}\n\nPLAN SO FAR:\n${
              lines.length
                ? lines.map((l, i) => `${i + 1}. ${l}`).join("\n")
                : "(none yet — suggest the very first line)"
            }\n\nWRITE THE SUGGESTION AT THIS ENGLISH LEVEL: ${band.guide}`,
          },
        ],
        maxTokens: 250,
      });
      if (typeof out.suggestion !== "string" || !out.suggestion.trim()) {
        return NextResponse.json({ error: "ai_failed" }, { status: 502 });
      }
      return NextResponse.json({
        suggestion: out.suggestion.trim(),
        suggestionKo:
          typeof out.suggestionKo === "string" ? out.suggestionKo.trim() : "",
      });
    } catch (err) {
      console.error("[studio/line:suggest]", err);
      return NextResponse.json({ error: "ai_failed" }, { status: 502 });
    }
  }

  const line = body.line?.trim();
  if (!line) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const fb = await jsonCall<LineFeedback>({
      model: LINE_MODEL,
      system: SYSTEM,
      content: [
        {
          type: "text",
          text: `PROBLEM:\n${english}\n\nPLAN SO FAR:\n${
            lines.length ? lines.map((l, i) => `${i + 1}. ${l}`).join("\n") : "(none yet)"
          }\n\nNEW LINE:\n${line}\n\nWrite "betterEnglish" at this level: ${band.guide}`,
        },
      ],
      maxTokens: 400,
    });

    const verdict =
      fb.verdict === "great" || fb.verdict === "good" || fb.verdict === "hint"
        ? fb.verdict
        : "good";

    return NextResponse.json({
      verdict,
      comment: typeof fb.comment === "string" ? fb.comment : "좋아요 — 다음 줄로 이어가 볼까요?",
      betterEnglish: typeof fb.betterEnglish === "string" ? fb.betterEnglish : undefined,
      planComplete: Boolean(fb.planComplete),
    } satisfies LineFeedback);
  } catch (err) {
    console.error("[studio/line]", err);
    return NextResponse.json({ error: "ai_failed" }, { status: 502 });
  }
}
