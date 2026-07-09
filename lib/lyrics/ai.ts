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
  WordCardCore,
  WordExample,
  WordSectionData,
  WordSectionKey,
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
  /**
   * Few-shot VOICE example for card prose, written IN `say` — shows the target
   * register: short choppy sentences, friendly, talks TO the learner. Same
   * keep-in-sync rule as teaserExamples.
   */
  voiceExample: string;
}

function dir(direction: Direction): Dir {
  if (direction === "ko") {
    return {
      learn: "Korean",
      say: "English",
      audience:
        "a global K-pop fan (first language English, or comfortable reading English) learning the KOREAN used in the song",
      teaserExamples: `"it's not what it looks like 👀", "don't translate this literally 😅"`,
      voiceExample: `"Nunchi? Omg you NEED this word 👀 It's basically your social radar — reading the room before anyone says a thing. Koreans treat it like a low-key superpower 💫 And honestly? Once you feel it, you can't unsee it. So good."`,
    };
  }
  return {
    learn: "English",
    say: "Korean",
    audience: "a Korean K-pop fan learning the ENGLISH used in the song",
    teaserExamples: `"곤충 얘기가 아니야 👀", "직역하면 큰일 나 😅"`,
    voiceExample: `"레모네이드? 그냥 레몬 음료 아니야! 🍋 'When life gives you lemons, make lemonade'라는 완전 유명한 속담에서 딱 따온 거야. 인생이 시고 힘든 레몬을 던져도? 오히려 좋아~ 내가 달콤하게 블렌딩해서 마셔버리겠다는 당당 그 자체 선언이지! 💪 너네도 이 노래 들으면 힘 나지 않아?"`,
  };
}

// Shared guardrail appended to every prompt.
const GUARDRAIL = `HARD RULES:
- NEVER reproduce full lyrics or whole lines. Use only single words or SHORT phrases (≤4 words). You are teaching vocabulary, not printing the song.
- Be honest. Only state things you are genuinely confident about. If you do not actually know this song, say so and return empty results rather than inventing words, lines, quotes, or other songs.
- Treat "why the artist chose this word" as interpretation, never asserted fact. Do not fabricate artist quotes.`;

// The model is told "no markdown" but ignores that for emphasis inside prose
// fields (hook/meaning/why/slang/note/teaser) often enough to matter — those
// render as plain text in the UI, so a literal "**word**"/"*word*" would leak
// asterisks straight to the user. Strip markdown emphasis at the source.
function stripEmphasis(x: string): string {
  return x.replace(/\*\*(.+?)\*\*/g, "$1").replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "$1");
}

function s(x: unknown): string {
  return typeof x === "string" ? stripEmphasis(x.trim()) : "";
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
  "known": boolean,  // true if you actually recognize this song — even if it turns out to have NO ${d.learn} content (e.g. an all-Korean song asked for its English words). false ONLY if you genuinely don't know the song at all.
  "note": string,    // ONE short line in ${d.say} on how this song uses ${d.learn} (its vibe). If known=true but the song has little/no ${d.learn} content, say that plainly (e.g. "이 곡은 영어 가사가 거의 없어요"). If known=false, "" or a brief "not sure about this one" line.
  "words": [ { "term": string, "gloss": string, "kind": "word" | "phrase" | "slang", "line": string, "teaser": string } ]
}

- term: a single ${d.learn} word or a SHORT phrase (≤4 words). Never a full line.
- gloss: a SHORT meaning in ${d.say}.
- kind: "slang" if it is slang/trendy, "phrase" for multi-word, else "word".
- line: the short SUNG fragment a fan recognizes, containing "term" VERBATIM — e.g. "got me feelin' butterflies". Keep it to ~3–7 words; NEVER a full line/verse. Use "" if there's no natural short fragment.
- teaser: a SHORT curiosity hint, WRITTEN IN ${d.say} (≤8 words) ONLY when the word has a real twist — an idiom, slang, or hidden/cultural meaning — that makes the learner want to tap WITHOUT revealing the answer (e.g. ${d.teaserExamples} — matching that LANGUAGE, ${d.say}, not the words). For a literal/obvious word, set teaser to "" (do NOT force one). Never spoil the meaning.
- Only include items you are confident actually appear in THIS song. A known song can validly have zero words (see "known" above) — that is NOT the same as not knowing the song.

${GUARDRAIL}

${SEARCH_NOTE}`;

  const out = await groundedJson<{ known?: unknown; note?: unknown; words?: unknown }>(
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

  // A model that names actual words for the song obviously knows it — trust
  // that over a possibly-inconsistent "known" flag.
  const known = out.known === true || words.length > 0;

  return { known, note: s(out.note), words };
}

type WordChip = SongWords["words"][number];

// ── 2) Tapped word → card (core now, sections on demand) ─────────────────────
//
// The card is split so the first paint after a tap is FAST: the core call
// generates only hook + meaning (few tokens), and each folded section (why /
// slang / examples / cross-songs) is its own small call made when the learner
// opens that toggle. No web-search on any of these: the term already came from
// a grounded songWords pass.

// Shared register for all card prose — the user-facing voice of the product.
// The product voice is a hyped-up K-pop fan friend geeking out with you, not a
// tutor. High energy, lots of emojis, but still SHORT punchy sentences.
function voiceNote(d: Dir): string {
  return `VOICE: You are an excited K-pop fan bestie hyping up another fan — warm, bubbly, high-energy, playfully over-the-top. Talk TO the learner directly and pull them in (in Korean: 반말 + hype, e.g. "너네도 그랬지?", "완전 ~야!", "오히려 좋아~", "같이 파보자!"). Drop fitting emojis generously (🍋✨💪🥤💖😆). Keep SHORT punchy sentences — ONE idea per sentence, no long run-ons — but pack them with energy and exclamation. Intensifiers welcome (완전/진짜/딱/그냥/오히려). When a word comes from an idiom or has a backstory, GEEK OUT about it — explain where it comes from and why it's cool. Make the learner FEEL the vibe, not just read a definition. Big energy, short sentences, real insight. Target register (match this exact feel, written in ${d.say}): ${d.voiceExample}`;
}

export async function wordCardCore(
  song: string,
  artist: string,
  term: string,
  direction: Direction,
): Promise<WordCardCore> {
  const d = dir(direction);
  const system = `You help ${d.audience}.

The learner tapped the ${d.learn} term "${term}" from the song "${song}" by ${artist}. Give them the instant "oh!" — hook first, then the meaning. Write in ${d.say}.

${voiceNote(d)}

Return STRICT JSON (no markdown, no extra keys):
{
  "term": string,
  "hook": string,     // ONE short punchy ${d.say} line that flips expectation or reveals the hidden meaning/feeling. NOT a definition. ≤ 14 words, a fitting emoji is welcome.
  "reading": string,  // pronunciation or romanization; "" if not useful
  "meaning": string   // the meaning in ${d.say}, in the hyped voice above. 3–5 SHORT sentences. Like the lemonade example: literal sense first, then the idiom/backstory it comes from (geek out!), then the twist/feeling in THIS song. Punchy lines, emojis welcome — but every sentence stays short.
}

${GUARDRAIL}`;

  const out = await jsonCall<Record<string, unknown>>({
    model: LYRICS_MODEL,
    system,
    content: [{ type: "text", text: `TERM: "${term}"  SONG: "${song}" by ${artist}.` }],
    maxTokens: 800,
  });

  return {
    term: s(out.term) || term,
    hook: s(out.hook),
    reading: s(out.reading),
    meaning: s(out.meaning),
  };
}

// Per-section prompt bodies. Each returns a tiny JSON payload; the section
// call shares the same system framing + voice as the core call.
const SECTION_SPECS: Record<WordSectionKey, (d: Dir) => string> = {
  why: (d) => `Why does THIS word fit THIS song, and what's the song/artist vibe around it? Geek out like a fan: how the word ties into the song's message/energy, and — if you GENUINELY know it — the artist's concept or this era's vibe that makes it land. This is INTERPRETATION, not fact: no invented artist quotes, and if you're unsure of specifics (release dates, album numbers, concept details) stay vibe-level and never make them up — honest and hyped beats made-up.

Return STRICT JSON: { "text": string }  // 3–5 SHORT ${d.say} sentences in the hyped voice above`,
  slang: (d) => `Is this term slang or trendy right now? If yes: what it really means + why people say it. If it's NOT slang, say so honestly in one light friendly line (that's a fine answer).

Return STRICT JSON: { "text": string }  // 1–3 SHORT ${d.say} sentences in the voice above`,
  examples: (d) => `Give 2 short, natural ${d.learn} sentences a fan could actually say using this term, each with a ${d.say} gloss.

Return STRICT JSON: { "examples": [ { "text": string, "gloss": string } ] }`,
  cross: (d) => `Name OTHER well-known songs that use this same word/phrase. ONLY ones you are genuinely confident about — an empty list beats an invented one.

Return STRICT JSON: { "crossSongs": [ { "title": string, "artist": string, "note": string } ] }  // note = ONE short ${d.say} sentence in the voice above`,
};

export async function wordSection(
  section: WordSectionKey,
  song: string,
  artist: string,
  term: string,
  direction: Direction,
): Promise<WordSectionData> {
  const d = dir(direction);
  const system = `You help ${d.audience}. The learner is looking at the ${d.learn} term "${term}" from the song "${song}" by ${artist} and opened one more section of its card.

${voiceNote(d)}

${SECTION_SPECS[section](d)}

No markdown, no extra keys. ${GUARDRAIL}`;

  const out = await jsonCall<Record<string, unknown>>({
    model: LYRICS_MODEL,
    system,
    content: [{ type: "text", text: `TERM: "${term}"  SONG: "${song}" by ${artist}.` }],
    maxTokens: 700,
  });

  if (section === "examples") {
    const examples: WordExample[] = Array.isArray(out.examples)
      ? (out.examples as Array<Record<string, unknown>>)
          .map((e) => ({ text: s(e.text), gloss: s(e.gloss) }))
          .filter((e) => e.text.length > 0)
          .slice(0, 3)
      : [];
    return { examples };
  }
  if (section === "cross") {
    const crossSongs: CrossSong[] = Array.isArray(out.crossSongs)
      ? (out.crossSongs as Array<Record<string, unknown>>)
          .map((c) => ({ title: s(c.title), artist: s(c.artist), note: s(c.note) }))
          .filter((c) => c.title.length > 0)
          .slice(0, 5)
      : [];
    return { crossSongs };
  }
  return { text: s(out.text) };
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

Answer the learner's question in ${d.say}, concise (2–5 sentences), and honest (say so if you're unsure).

${voiceNote(d)}

${GUARDRAIL}`;

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
  return block && block.type === "text" ? stripEmphasis(block.text.trim()) : "";
}
