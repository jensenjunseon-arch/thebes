// Server-side AI for the chart-lyric vocabulary explorer.
//
// Reuses the studio caller (anthropic() + jsonCall() with a repair retry). One
// engine, bidirectional via `Direction`. Three jobs: list a song's notable
// words (chips), explain one tapped word (card), and answer follow-ups (chat).
//
// Two hard rules from the validation research live in every prompt here:
//   1. NEVER reproduce full lyrics — words/short phrases only (licensing-safe).
//   2. The "why this word", cross-song, and slang claims are hallucination-prone,
//      so we frame "why" as interpretation, forbid invented quotes/songs, and
//      let cross-song lists be empty rather than fabricated.

import Anthropic from "@anthropic-ai/sdk";
import { anthropic, jsonCall } from "@/lib/studio/ai";
import { extractJson } from "@/lib/ai/extractJson";
import type {
  ChatTurn,
  CrossSong,
  Direction,
  SongWords,
  WordCard,
} from "@/lib/lyrics/types";

// Sonnet matches the studio "pack" tier: fast enough for a tap-to-explain
// interaction, capable enough for the cultural "why". Bump to "claude-opus-4-8"
// for deeper interpretation at higher latency/cost.
export const LYRICS_MODEL = "claude-sonnet-4-6";

interface Dir {
  /** The language being LEARNED from the song. */
  learn: string;
  /** The language explanations are written in (the learner's own). */
  say: string;
  audience: string;
  /**
   * Few-shot teaser examples, written IN `say` — a literal example in the
   * wrong language biases the model toward that language regardless of what
   * the instruction text says. Keep this in sync with `say`.
   */
  teaserExamples: string;
}

function dir(direction: Direction): Dir {
  if (direction === "ko") {
    return {
      learn: "Korean",
      say: "English",
      audience:
        "a global K-pop fan (first language English, or comfortable reading English) learning the KOREAN used in the song",
      teaserExamples: `"it's not what it looks like 👀", "don't translate this literally 😅"`,
    };
  }
  return {
    learn: "English",
    say: "Korean",
    audience: "a Korean K-pop fan learning the ENGLISH used in the song",
    teaserExamples: `"곤충 얘기가 아니야 👀", "직역하면 큰일 나 😅"`,
  };
}

// Shared guardrail appended to every prompt.
const GUARDRAIL = `HARD RULES:
- NEVER reproduce full lyrics or whole lines. Use only single words or SHORT phrases (≤4 words). You are teaching vocabulary, not printing the song.
- Be honest. Only state things you are genuinely confident about. If you do not actually know this song, say so and return empty results rather than inventing words, lines, quotes, or other songs.
- Treat "why the artist chose this word" as interpretation, never asserted fact. Do not fabricate artist quotes.`;

function s(x: unknown): string {
  return typeof x === "string" ? x.trim() : "";
}

// Keep the recognition fragment short — a sung snippet, never a reproduced
// line/verse. Defensive cap even if the model over-returns: drop to "" past
// ~9 words so we never render a long lyric chunk. Exported because the word
// book save route must enforce the same cap on anything it persists.
export function capLine(x: unknown): string {
  const v = s(x).replace(/\s+/g, " ");
  if (!v) return "";
  return v.split(" ").length > 9 ? "" : v;
}

// One JSON-returning call with server-side web search available, so the model
// can ground brand-new charting songs (past its training cutoff) in real info
// instead of guessing. tool_choice stays auto — the model searches only when it
// isn't sure, so songs it already knows stay fast. Handles the pause_turn the
// server-tool loop can emit; parses JSON from the final text.
const SEARCH_NOTE = `SEARCH: You have a web_search tool. If you are NOT fully certain of this song's ACTUAL words (e.g. a very recent release), search for it FIRST and teach only from what you verify. Never invent words that may not be in the song — an honest empty result beats a made-up one.`;

async function searchGroundedJson<T>(
  system: string,
  user: string,
  maxTokens: number,
): Promise<T> {
  const client = anthropic();
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: user }];
  let text = "";
  for (let round = 0; round < 4; round++) {
    const res = await client.messages.create({
      model: LYRICS_MODEL,
      max_tokens: maxTokens,
      system: [{ type: "text", text: system }],
      // Older SDK typings may not include this tool; the wire format is valid.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 4 } as any],
      messages,
    });
    const t = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    if (t.trim()) text = t;
    if (res.stop_reason === "pause_turn") {
      messages.push({
        role: "assistant",
        content: res.content as unknown as Anthropic.ContentBlockParam[],
      });
      continue;
    }
    break;
  }
  return JSON.parse(extractJson(text)) as T;
}

// Grounded first; if web search is unavailable on this plan (or errors), fall
// back to the plain single call so the feature degrades gracefully.
async function groundedJson<T>(system: string, user: string, maxTokens: number): Promise<T> {
  try {
    return await searchGroundedJson<T>(system, user, maxTokens);
  } catch (err) {
    console.error("[lyrics] web_search grounding unavailable — plain call", err);
    return jsonCall<T>({
      model: LYRICS_MODEL,
      system,
      content: [{ type: "text", text: user }],
      maxTokens,
    });
  }
}

// ── 1) Song → notable words (the chips) ──────────────────────────────────────

export async function songWords(
  song: string,
  artist: string,
  direction: Direction,
): Promise<Omit<SongWords, "song" | "artist" | "direction">> {
  const d = dir(direction);
  const system = `You help ${d.audience}.

List the most notable ${d.learn} words and short phrases a fan keeps hearing in ONE specific song — the ones genuinely worth learning. Aim for 6–10 items.

Return STRICT JSON (no markdown, no extra keys):
{
  "note": string,   // ONE short line in ${d.say} on how this song uses ${d.learn} (its vibe). "" if you don't know the song.
  "words": [ { "term": string, "gloss": string, "kind": "word" | "phrase" | "slang", "line": string, "teaser": string } ]
}

- term: a single ${d.learn} word or a SHORT phrase (≤4 words). Never a full line.
- gloss: a SHORT meaning in ${d.say}.
- kind: "slang" if it is slang/trendy, "phrase" for multi-word, else "word".
- line: the short SUNG fragment a fan recognizes, containing "term" VERBATIM — e.g. "got me feelin' butterflies". Keep it to ~3–7 words; NEVER a full line/verse. Use "" if there's no natural short fragment.
- teaser: a SHORT curiosity hint, WRITTEN IN ${d.say} (≤8 words) ONLY when the word has a real twist — an idiom, slang, or hidden/cultural meaning — that makes the learner want to tap WITHOUT revealing the answer (e.g. ${d.teaserExamples} — matching that LANGUAGE, ${d.say}, not the words). For a literal/obvious word, set teaser to "" (do NOT force one). Never spoil the meaning.
- Only include items you are confident actually appear in THIS song. If you do not know the song, return {"note": "<say in ${d.say} that you're not sure of this song>", "words": []}.

${GUARDRAIL}

${SEARCH_NOTE}`;

  const out = await groundedJson<{ note?: unknown; words?: unknown }>(
    system,
    `SONG: "${song}" by ${artist}.`,
    1400,
  );

  const words = Array.isArray(out.words)
    ? (out.words as Array<Record<string, unknown>>)
        .map((w) => {
          const term = s(w.term);
          const kind = w.kind === "slang" || w.kind === "phrase" ? w.kind : "word";
          const teaser = s(w.teaser);
          return {
            term,
            gloss: s(w.gloss),
            kind: kind as WordChip["kind"],
            line: capLine(w.line),
            teaser: teaser.length <= 60 ? teaser : "",
          };
        })
        .filter((w) => w.term.length > 0 && w.term.length <= 40)
        .slice(0, 12)
    : [];

  return { note: s(out.note), words };
}

type WordChip = SongWords["words"][number];

// ── 2) Tapped word → deep card ───────────────────────────────────────────────

export async function wordCard(
  song: string,
  artist: string,
  term: string,
  direction: Direction,
): Promise<WordCard> {
  const d = dir(direction);
  const system = `You help ${d.audience}.

The learner tapped the ${d.learn} term "${term}" from the song "${song}" by ${artist}. Explain it richly but honestly. Write every explanation in ${d.say}; keep example sentences in ${d.learn}.

Lead with a HOOK, not a dictionary entry. The first thing the learner sees should make them go "oh!".

Return STRICT JSON (no markdown, no extra keys):
{
  "term": string,
  "hook": string,           // ONE punchy ${d.say} line that flips expectation or reveals the hidden meaning/feeling — the "oh!" moment. e.g. the word isn't what it literally says; or the emotion behind it. NOT a definition. Keep it to one sentence, vivid, a fitting emoji is welcome.
  "reading": string,        // pronunciation or romanization; "" if not useful
  "meaning": string,        // clear meaning in ${d.say}
  "why": string,            // INTERPRETATION (label it as such) of why this word suits the song's mood/theme, in ${d.say}. No invented quotes.
  "slang": string,          // if slang/trending: what it means + why people use it, in ${d.say}. "" if not slang.
  "crossSongs": [ { "title": string, "artist": string, "note": string } ],  // OTHER well-known songs using this same word/phrase. Only confident ones. [] if unsure — never invent.
  "examples": [ { "text": string, "gloss": string } ]   // 1–2 short, natural ${d.learn} sentences a fan could actually say, each with a ${d.say} gloss
}

Warm and concise. ${GUARDRAIL}

${SEARCH_NOTE}`;

  const out = await groundedJson<Record<string, unknown>>(
    system,
    `TERM: "${term}"  SONG: "${song}" by ${artist}.`,
    1500,
  );

  const crossSongs: CrossSong[] = Array.isArray(out.crossSongs)
    ? (out.crossSongs as Array<Record<string, unknown>>)
        .map((c) => ({ title: s(c.title), artist: s(c.artist), note: s(c.note) }))
        .filter((c) => c.title.length > 0)
        .slice(0, 5)
    : [];

  const examples = Array.isArray(out.examples)
    ? (out.examples as Array<Record<string, unknown>>)
        .map((e) => ({ text: s(e.text), gloss: s(e.gloss) }))
        .filter((e) => e.text.length > 0)
        .slice(0, 3)
    : [];

  return {
    term: s(out.term) || term,
    hook: s(out.hook),
    reading: s(out.reading),
    meaning: s(out.meaning),
    why: s(out.why),
    slang: s(out.slang),
    crossSongs,
    examples,
  };
}

// ── 3) Follow-up chat about a tapped word ────────────────────────────────────

export async function chatAnswer(opts: {
  song: string;
  artist: string;
  term: string;
  direction: Direction;
  history: ChatTurn[];
  question: string;
}): Promise<string> {
  const d = dir(opts.direction);
  const system = `You are a friendly ${d.learn} tutor for ${d.audience}. You are discussing the term "${opts.term}" from the song "${opts.song}" by ${opts.artist}.

Answer the learner's question in ${d.say}, concise (2–5 sentences), warm, and honest (say so if you're unsure). ${GUARDRAIL}`;

  const history = opts.history
    .filter((t) => (t.role === "user" || t.role === "assistant") && s(t.text))
    .slice(-8)
    .map((t) => ({ role: t.role, content: t.text }));

  const client = anthropic();
  const res = await client.messages.create({
    model: LYRICS_MODEL,
    max_tokens: 700,
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages: [...history, { role: "user", content: opts.question }],
  });
  const block = res.content.find((b) => b.type === "text");
  return block && block.type === "text" ? block.text.trim() : "";
}
