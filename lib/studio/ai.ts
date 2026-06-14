// Server-side AI helpers for the Studio routes — one JSON-disciplined caller
// (with a single repair retry) plus the shared ProblemPack prompt spec used by
// both ingest (photo/text) and generate.

import Anthropic from "@anthropic-ai/sdk";
import { extractJson } from "@/lib/ai/extractJson";
import type { FigureSpec, ProblemPack } from "@/lib/studio/types";

export const PACK_MODEL = "claude-sonnet-4-6";
export const LINE_MODEL = "claude-haiku-4-5-20251001";

export function anthropic(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export function hasKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// English-difficulty band, deliberately ONE step BELOW the grade label so the
// English never blocks the math thinking. Kindergarten English for lower-
// elementary problems … middle-school English for high-school. The math stays
// at grade; only the reading level drops. Order matters: check 초등 before 고
// (since "초등 고학년" contains "고").
export function englishBand(level?: string): { tier: string; guide: string } {
  const l = level ?? "";
  if (l.includes("초등")) {
    if (l.includes("저학년"))
      return {
        tier: "kindergarten",
        guide:
          "KINDERGARTEN-level English (a 5–6 year old): only the ~300 most common English words, sentences of 4–7 words, one idea each, present tense only, NO clauses, NO passive voice, NO rare or academic words.",
      };
    return {
      tier: "early-elementary",
      guide:
        "EARLY-ELEMENTARY English (a 7-year-old reader): common everyday words only, short sentences (6–9 words), avoid clauses, passive voice, and rare vocabulary.",
    };
  }
  if (l.includes("중"))
    return {
      tier: "elementary",
      guide:
        "ELEMENTARY-level English (a 9–10 year old reader): everyday words, short clear sentences (up to ~10 words). Avoid academic or rare vocabulary; if a math term is unavoidable keep it the simplest possible.",
    };
  if (l.includes("고"))
    return {
      tier: "middle-school",
      guide:
        "MIDDLE-SCHOOL-level English: clear everyday words, sentences up to ~12 words, a single light subordinate clause is okay but keep it simple.",
    };
  return {
    tier: "elementary",
    guide:
      "ELEMENTARY-level English — everyday words, short clear sentences (up to ~10 words).",
  };
}

type Content = Anthropic.MessageParam["content"];

// One call → parse JSON; on parse failure, one repair retry that feeds the
// broken output back with a strict reminder. Throws if still unparseable.
export async function jsonCall<T>(opts: {
  model: string;
  system: string;
  content: Content;
  maxTokens: number;
}): Promise<T> {
  const client = anthropic();

  async function once(extra?: string): Promise<string> {
    const res = await client.messages.create({
      model: opts.model,
      max_tokens: opts.maxTokens,
      system: [
        { type: "text", text: opts.system, cache_control: { type: "ephemeral" } },
        ...(extra ? [{ type: "text" as const, text: extra }] : []),
      ],
      messages: [{ role: "user", content: opts.content }],
    });
    const block = res.content.find((b) => b.type === "text");
    return block && block.type === "text" ? block.text : "";
  }

  const raw = await once();
  try {
    return JSON.parse(extractJson(raw)) as T;
  } catch {
    const retry = await once(
      "Your previous reply was not valid JSON. Return ONLY the JSON object — no prose, no markdown fences.",
    );
    return JSON.parse(extractJson(retry)) as T;
  }
}

// ── ProblemPack spec (shared by ingest + generate) ───────────────────────────

export const PACK_SPEC = `Return STRICT JSON exactly in this shape (no extra keys, no markdown):
{
  "english": string,   // the problem in natural textbook English; inline math as $...$ (KaTeX); keep EVERY number, unit, and name exact
  "korean": string,    // the Korean problem text (the original if given; otherwise a faithful Korean version)
  "topic": string,     // short Korean topic, e.g. "속력", "닮음", "확률"
  "level": string,     // one of: "초등 저학년","초등 고학년","중1","중2","중3","고1","고2","고3" — your best estimate
  "sentences": [ { "en": string, "ko": string } ],  // split the english into its sentences, in order, covering ALL of it; ko = natural Korean for that sentence
  "vocab": [ { "en": string, "ko": string } ],      // 8–14 key terms; each "en" must appear VERBATIM (case-insensitive) inside the english text; 1–3 words each; math-relevant words first
  "figure": <FigureSpec or null>,
  "firstHint": string  // ONE warm Korean line nudging the student to start their plan — ask what the situation is about; NEVER reveal a method or the answer
}

FigureSpec — include ONLY if the problem genuinely involves a drawable shape; otherwise null:
- polygon: {"kind":"polygon","points":[[x,y],...], "labels":["A","B",...], "sideLabels":["12 cm", ...]} — 0–100 normalized coordinates (y down), 3–8 vertices, sideLabels[i] labels edge points[i]→points[i+1] ("" for unlabeled)
- circle: {"kind":"circle","r":number(<=45),"label":"O","radiusLabel":"r = 5 cm"}
- angle: {"kind":"angle","deg":number,"labels":["O","A","B"]}
- solid: {"kind":"solid","solid":"cuboid"|"cylinder"|"cone"|"sphere","dims":{"w":?, "h":?, "d":?, "r":?},"dimLabels":["가로 6 cm","세로 4 cm","높이 3 cm"]} — dims in the problem's own numbers

QUALITY RULES:
- ENGLISH DIFFICULTY (very important): write the "english" MUCH simpler than the grade implies — about one reading band BELOW the grade. "초등 저학년" → kindergarten words; "초등 고학년" → early-elementary; "중1"~"중3" → elementary; "고1"~"고3" → middle-school. Short sentences, the most common words, ONE idea per sentence, present tense where possible, no rare/academic words. Keep every number and the math exactly the same — only the English gets easier. Still natural, never awkward.
- The sentences[].en must follow the SAME easy level (this is what the student reads and rebuilds word by word).
- Do NOT solve the problem anywhere. Do NOT include the answer.
- Figure labels may show ONLY values the problem GIVES. Never a derived/computed value — if a dimension is what the student must find (or an intermediate step), label it "?" or omit it.
- sentences[].ko must be natural Korean a student reads comfortably, not literal word-by-word.
- vocab: choose the words a Korean student would actually stumble on (math terms, verbs like "travels", "remaining", quantities). Glosses are short ("평균 속력", "남은").
- If the input is NOT a math problem (or unreadable), return exactly {"error":"not_math"} instead.`;

// Minimal runtime validation + repair — never let one bad field kill the whole
// experience. A malformed figure degrades to null; missing arrays become [].
export function sanitizePack(p: unknown): ProblemPack | null {
  if (!p || typeof p !== "object") return null;
  const o = p as Record<string, unknown>;
  if (typeof o.english !== "string" || !o.english.trim()) return null;
  if (typeof o.korean !== "string" || !o.korean.trim()) return null;

  const sentences = Array.isArray(o.sentences)
    ? (o.sentences as Array<Record<string, unknown>>)
        .filter((s) => typeof s?.en === "string" && typeof s?.ko === "string")
        .map((s) => ({ en: s.en as string, ko: s.ko as string }))
    : [];
  const vocab = Array.isArray(o.vocab)
    ? (o.vocab as Array<Record<string, unknown>>)
        .filter((v) => typeof v?.en === "string" && typeof v?.ko === "string")
        .map((v) => ({ en: (v.en as string).trim(), ko: (v.ko as string).trim() }))
        .filter((v) => v.en.length > 0 && v.en.length <= 40)
    : [];

  return {
    english: (o.english as string).trim(),
    korean: (o.korean as string).trim(),
    topic: typeof o.topic === "string" && o.topic.trim() ? o.topic.trim() : "수학",
    level: typeof o.level === "string" && o.level.trim() ? o.level.trim() : "중2",
    sentences: sentences.length
      ? sentences
      : [{ en: (o.english as string).trim(), ko: (o.korean as string).trim() }],
    vocab,
    figure: sanitizeFigure(o.figure),
    firstHint:
      typeof o.firstHint === "string" && o.firstHint.trim()
        ? o.firstHint.trim()
        : "이 상황이 '무엇에 대한 이야기'인지, 첫 줄로 적어볼까요?",
  };
}

function num(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function sanitizeFigure(f: unknown): FigureSpec | null {
  if (!f || typeof f !== "object") return null;
  const o = f as Record<string, unknown>;
  try {
    switch (o.kind) {
      case "polygon": {
        const pts = Array.isArray(o.points)
          ? (o.points as unknown[])
              .filter((p) => Array.isArray(p) && num(p[0]) && num(p[1]))
              .map((p) => {
                const q = p as [number, number];
                return [
                  Math.max(0, Math.min(100, q[0])),
                  Math.max(0, Math.min(100, q[1])),
                ] as [number, number];
              })
          : [];
        if (pts.length < 3 || pts.length > 10) return null;
        return {
          kind: "polygon",
          points: pts,
          labels: Array.isArray(o.labels) ? (o.labels as string[]).map(String) : undefined,
          sideLabels: Array.isArray(o.sideLabels)
            ? (o.sideLabels as string[]).map(String)
            : undefined,
        };
      }
      case "circle": {
        if (!num(o.r) || o.r <= 0) return null;
        return {
          kind: "circle",
          r: Math.min(45, o.r),
          label: typeof o.label === "string" ? o.label : undefined,
          radiusLabel: typeof o.radiusLabel === "string" ? o.radiusLabel : undefined,
        };
      }
      case "angle": {
        if (!num(o.deg) || o.deg <= 0 || o.deg >= 360) return null;
        return {
          kind: "angle",
          deg: o.deg,
          labels: Array.isArray(o.labels) ? (o.labels as string[]).map(String) : undefined,
        };
      }
      case "solid": {
        const solid = o.solid;
        if (
          solid !== "cuboid" &&
          solid !== "cylinder" &&
          solid !== "cone" &&
          solid !== "sphere"
        )
          return null;
        const dims = (o.dims && typeof o.dims === "object" ? o.dims : {}) as Record<
          string,
          unknown
        >;
        return {
          kind: "solid",
          solid,
          dims: {
            w: num(dims.w) ? dims.w : undefined,
            h: num(dims.h) ? dims.h : undefined,
            d: num(dims.d) ? dims.d : undefined,
            r: num(dims.r) ? dims.r : undefined,
          },
          dimLabels: Array.isArray(o.dimLabels)
            ? (o.dimLabels as string[]).map(String)
            : undefined,
        };
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}
