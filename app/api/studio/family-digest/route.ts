// POST /api/studio/family-digest — turn a finished study session into a warm,
// SIMPLE digest for the student's parent, written entirely in the parent's HOME
// LANGUAGE. Built for Korea's multicultural families: the parent may have
// limited Korean (or limited literacy in any school language), so this lets them
// finally SEE what their child studied, see HOW their child reasoned, and get
// two questions to talk about it tonight. The route returns FamilyDigest JSON;
// the client assembles the shareable page (with read-aloud) from a safe template.

import { NextResponse } from "next/server";
import { jsonCall, hasKey, PACK_MODEL } from "@/lib/studio/ai";
import { homeLang } from "@/lib/studio/homeLang";
import { sanitizeDigest } from "@/lib/studio/familyDigest";

export const maxDuration = 45;

const SYSTEM = `You turn a Korean student's math-study session into a SHORT, warm digest for
their PARENT. Korea's multicultural families often have a parent whose first
language is not Korean and whose literacy in any school language may be limited.
So every line must be short, warm, and use the most common everyday words.

Your goals, in order:
1) The parent SEES that their child studied today, and roughly WHAT.
2) The parent sees HOW their child thought — honest, specific, not generic.
3) The parent gets a gentle way to TALK with their child about it tonight
   (this directly heals the conversation gap many of these families feel).

Return STRICT JSON, and write EVERY string value ENTIRELY in the requested
language — no other language mixed in (no Korean unless the target IS Korean):
{
  "heading": string,        // ≤6 words, warm, e.g. "Today your child studied math"
  "intro": string,          // ONE warm line: your child solved a math problem by reasoning through it in English
  "problemLine": string,    // ONE simple sentence: what the problem was about (the gist, not heavy with numbers)
  "thinkingHeading": string,// short heading, e.g. "How your child thought"
  "thinking": string[],     // 2–4 SHORT lines describing how the child reasoned, in order (their real plan, simplified)
  "didWellHeading": string, // short heading, e.g. "What your child did well"
  "didWell": string[],      // 2–3 short, CONCRETE praises — name the actual thinking move, never empty praise
  "talkHeading": string,    // short heading, e.g. "Talk together"
  "talkPrompts": string[],  // EXACTLY 2 warm questions the parent can ask the child tonight
  "listenLabel": string,    // 1–2 word button label meaning "Listen"
  "closing": string,        // one warm closing line of encouragement to the parent
  "playLabel": string       // short label meaning "See what your child made" (always include)
}

RULES:
- EVERY value in the requested language. Short sentences. Plain, warm words.
- No math jargon, no markdown, no emojis, no numbers-heavy sentences.
- Base everything ONLY on what the student actually did below. Never invent steps.
- NEVER state the final answer.
- "didWell" must be specific to THIS student's reasoning.`;

export async function POST(req: Request) {
  if (!hasKey()) {
    return NextResponse.json({ error: "no_key" }, { status: 503 });
  }

  let body: {
    lang?: string;
    english?: string;
    korean?: string;
    topic?: string;
    level?: string;
    paragraph?: string;
    lines?: string[];
    quotes?: string[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const lang = homeLang(body.lang);
  const paragraph = body.paragraph?.trim();
  const lines = Array.isArray(body.lines)
    ? body.lines.map((l) => String(l).trim()).filter(Boolean).slice(0, 12)
    : [];
  if (!paragraph && lines.length === 0) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const quotes = Array.isArray(body.quotes)
    ? body.quotes.map((q) => String(q).trim()).filter(Boolean).slice(0, 3)
    : [];

  const ctx = [
    `WRITE EVERYTHING IN: ${lang.english} (${lang.native}).`,
    body.topic ? `Math topic: ${body.topic}` : "",
    body.level ? `School level: ${body.level}` : "",
    body.korean ? `The problem (Korean): ${body.korean}` : "",
    body.english ? `The problem (English): ${body.english}` : "",
    paragraph ? `\nThe child's reasoning, in their own words:\n${paragraph}` : "",
    lines.length ? `\nThe child's plan, line by line:\n${lines.map((l, i) => `${i + 1}. ${l}`).join("\n")}` : "",
    quotes.length ? `\nThe child's best lines (quote-worthy):\n${quotes.map((q) => `- ${q}`).join("\n")}` : "",
    `\nNow write the digest as JSON, every value in ${lang.english}.`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const raw = await jsonCall<Record<string, unknown>>({
      model: PACK_MODEL,
      system: SYSTEM,
      content: [{ type: "text", text: ctx }],
      maxTokens: 1600,
    });
    const digest = sanitizeDigest(raw);
    if (!digest) {
      return NextResponse.json({ error: "ai_failed" }, { status: 502 });
    }
    return NextResponse.json({ digest });
  } catch (err) {
    console.error("[studio/family-digest]", err);
    return NextResponse.json({ error: "ai_failed" }, { status: 502 });
  }
}
