// The content-aware diagnostic dialogue engine (zero-API, runs client-side).
//
// The arc widens the student's thinking OUTWARD instead of marching them toward
// an answer:
//   Step 1 — understand the situation:  reframe → decompose → relate
//   Step 2 — connect it to you & world:  relevance → transfer
// We never ask for the numeric answer. The coach reads the linguistic markers of
// each kind of thinking, classifies the reply (strong / partial / stuck), and
// branches — specific praise + the next (wider) question, or a problem-specific
// scaffold when stuck. Classification IS the measurement.

import type { ConstructId } from "@/lib/constructs";
import type { StepId } from "@/lib/steps";
import type { Coaching } from "@/lib/problems";

export type Signal = "strong" | "partial" | "stuck";
export type StageKind = "reframe" | "decompose" | "relate" | "relevance" | "transfer";

interface StageDef {
  kind: StageKind;
  construct: ConstructId;
}

const STAGES: Record<StepId, StageDef[]> = {
  1: [
    { kind: "reframe", construct: "redefine" },
    { kind: "decompose", construct: "decompose" },
    { kind: "relate", construct: "relate" },
  ],
  2: [
    { kind: "relevance", construct: "relevance" },
    { kind: "transfer", construct: "transfer" },
  ],
};

export function stagesForStep(step: StepId): StageDef[] {
  return STAGES[step];
}

// ── classification — the measurement ──────────────────────────────────────

// NOTE: deliberately excludes "help"/"what" — they collide with relevance/reframe
// answers ("this would help me…", "what matters is…"). A lone "help"/"what" is
// still caught by the word-count <= 1 check below.
const STUCK_RE =
  /\b(idk|i don'?t know|dunno|no idea|not sure|stuck)\b|^\?+$|모르|몰라|도와|어렵|글쎄/i;

const MARKERS: Record<StageKind, RegExp> = {
  reframe:
    /\b(about|asking|asks|situation|find|finding|want|wants|need|trying|figure|story|happening|trip|problem|means|basically|so)\b/i,
  decompose:
    /\b(speed|distance|time|weight|heavy|length|long|money|cost|price|won|number|angle|amount|liters?|cm|kg|values?|quantit|things|parts|elements|each|two|sides|rows|total|how many|how much)\b/i,
  relate:
    /\b(if|when|then|because|so|more|less|faster|slower|bigger|smaller|increase|decrease|goes up|goes down|the more|the less|affects?|changes?|depends|related|connected|proportional|same time|opposite)\b/i,
  relevance:
    /\b(i |i'?m|me|my|myself|help|helps|useful|use|using|life|everyday|every day|real|plan|planning|decide|deciding|save|saving|budget|when i|need to|figure out)\b/i,
  transfer:
    /\b(future|everyone|people|world|society|others|around|community|could|would|change|jobs?|career|school|family|friends|smarter|better|if everyone|grow)\b/i,
};

function wordCount(t: string): number {
  return t.trim().split(/\s+/).filter(Boolean).length;
}

export function classify(kind: StageKind, text: string): Signal {
  const t = text.trim();
  const wc = wordCount(t);
  if (STUCK_RE.test(t) || wc <= 1) return "stuck";
  const hit = MARKERS[kind].test(t);
  if (kind === "reframe") {
    return wc >= 6 && hit ? "strong" : "partial";
  }
  return hit ? (wc >= 5 ? "strong" : "partial") : "partial";
}

// English reasoning bonus — kept modest so a thinking construct headlines the
// result, not "expressed it in English".
function englishBonus(text: string): number {
  return wordCount(text) >= 7 ? 1 : 0;
}

// Graduated quality (1–5) — replaces the old flat strong=4/partial=2 (which gave
// almost every reply a 4). A richer answer — on-topic, a real sentence,
// elaborated, with a concrete detail/example — scores higher, so the report
// actually differentiates students.
function qualityScore(kind: StageKind, text: string): number {
  const t = text.trim();
  const wc = wordCount(t);
  const hasMarker = MARKERS[kind].test(t);
  const hasDetail = /\d|because|since|for example|such as|,|—/i.test(t);

  let q = 1; // any genuine attempt floors at 1
  if (hasMarker) q += wc >= 3 ? 2 : 1; // on-topic (more if not a bare word)
  if (wc >= 6) q += 1; // a real sentence
  if (wc >= 12) q += 1; // elaborated
  if (hasMarker && hasDetail) q += 1; // gives a reason, example, or specifics

  return Math.max(1, Math.min(5, q));
}

// ── coach copy ─────────────────────────────────────────────────────────────

// Questions for stages that are NOT openers. (reframe & relevance are asked by
// the step greetings in lib/steps.ts.)
const ASK: Partial<Record<StageKind, string>> = {
  decompose:
    "Nice. Now — what are the important things or numbers in this? (Things like an amount, a speed, a length, a time…) Even naming just one is a great start.",
  relate:
    "Here's the fun part — how do those things affect each other? For example, when one gets bigger, does another get bigger or smaller? Your best guess is totally fine.",
  transfer:
    "Last one, and there's no wrong answer — zoom way out: if lots of people learned to think like this, how might it help the people around them, or the future?",
};

// Three warmth tiers (strong / partial / gentle). The 'stuck' slot is the gentle
// tier — it covers both a short-but-genuine answer and a forced advance, so it's
// written to be encouraging, never dismissive.
const PRAISE: Record<StageKind, Record<Signal, string>> = {
  reframe: {
    strong: "Love it — you put the whole situation in your own words.",
    partial: "Good start — you're looking right at what this is about.",
    stuck: "That's perfectly okay — we've got a starting point together.",
  },
  decompose: {
    strong: "Yes — you spotted the pieces that really matter.",
    partial: "Nice — that's one of the key pieces.",
    stuck: "Good — even one piece is a great start.",
  },
  relate: {
    strong: "That's the real insight — you saw how the pieces push on each other.",
    partial: "Good — there's a real connection there.",
    stuck: "That's exactly the kind of link that matters — nice.",
  },
  relevance: {
    strong: "I love that — you tied this straight to your own life.",
    partial: "Good — I can see how this touches your life.",
    stuck: "That's a real place this shows up — nice connection.",
  },
  transfer: {
    strong: "Beautiful — you stretched one idea out to the whole world.",
    partial: "Nice — you're seeing how this reaches beyond the page.",
    stuck: "That's a lovely way it could ripple outward.",
  },
};

function scaffold(kind: StageKind, c: Coaching): string {
  switch (kind) {
    case "reframe":
      return `No rush — this is basically about ${stripDot(c.summary)}. Try saying that in your own words.`;
    case "decompose":
      return `Look for the moving parts — here it's ${stripDot(c.components)}. Which of those matter most?`;
    case "relate":
      return `For example: ${stripDot(c.relationship)}. Can you see a connection like that?`;
    case "relevance":
      return `Think everyday — this kind of thinking shows up in ${stripDot(c.realWorld)}. Does that connect for you?`;
    case "transfer":
      return "There's no wrong answer here — picture your future self, or your friends. Where could this way of thinking matter?";
  }
}

// Sentence-starter chips — lower the blank-box barrier and teach the patterns.
// (Partial: the student finishes the sentence themselves → counts as composition.)
export const STARTER_FRAMES: Record<StageKind, string[]> = {
  reframe: ["This is about…", "Basically, it's asking…", "The situation is…"],
  decompose: ["The key things are…", "What matters here is…", "The important parts are…"],
  relate: ["When ___ goes up,…", "These connect because…", "If one changes,…"],
  relevance: ["This would help me…", "In my life,…", "I could use this when…"],
  transfer: ["If everyone thought this way,…", "In the future,…", "This could help people…"],
};

export function starterFramesFor(step: StepId, stageIndex: number): string[] {
  const stage = STAGES[step][Math.min(stageIndex, STAGES[step].length - 1)];
  return STARTER_FRAMES[stage.kind];
}

// Complete, submittable example answers — the click-only safety net for a
// student who finds writing math in English too daunting. Picking one VERBATIM
// earns the stage's THINKING credit but NO English-expression credit (see
// SessionView): the report then honestly shows that writing is the gap, because
// they never actually composed a sentence themselves.
export const EXAMPLE_ANSWERS: Record<StageKind, string[]> = {
  reframe: [
    "This problem is basically about how two amounts are related to each other.",
    "It's asking me to compare two situations and figure out the result.",
  ],
  decompose: [
    "The important things here are the numbers given and what each of them means.",
    "The key pieces are the two values and the units they are measured in.",
  ],
  relate: [
    "When one of these gets bigger, the other one changes as well.",
    "These connect because changing one value affects the final result.",
  ],
  relevance: [
    "This would help me make smarter decisions in my everyday life.",
    "In my life, I could use this when I compare prices or plan my time.",
  ],
  transfer: [
    "If everyone thought this way, people would make better choices together.",
    "In the future, this kind of thinking could help solve bigger problems.",
  ],
};

export function exampleAnswersFor(step: StepId, stageIndex: number): string[] {
  const stage = STAGES[step][Math.min(stageIndex, STAGES[step].length - 1)];
  return EXAMPLE_ANSWERS[stage.kind];
}

// ── bilingual on-ramp ───────────────────────────────────────────────────────
// A Korean answer is accepted: the THINKING earns partial credit and the coach
// mirrors it back as a model English sentence built from the problem's coaching.
// The core loop — Korean thought → English expression — happens in turn one.

const HANGUL_RE = /[가-힣]/;
const KOREAN_STUCK_RE = /모르|몰라|도와|글쎄|어렵|^\?+$/;

function stripDot(s: string): string {
  return s.replace(/[.\s]+$/, "");
}

function englishMirror(kind: StageKind, c: Coaching): string {
  switch (kind) {
    case "reframe":
      return `This is about ${stripDot(c.summary)}.`;
    case "decompose":
      return `The key things here are ${stripDot(c.components)}.`;
    case "relate":
      return `For example, ${stripDot(c.relationship)}.`;
    case "relevance":
      return `This kind of thinking helps with ${stripDot(c.realWorld)}.`;
    case "transfer":
      return "If everyone could think like this, the world would work a little smarter.";
  }
}

// ── the turn evaluator ──────────────────────────────────────────────────────

export interface StageOutcome {
  reply: string;
  construct: ConstructId;
  delta: number;
  englishDelta: number;
  rationale: string;
  signal: Signal;
  recordEvidence: boolean;
  advanceStage: boolean;
  completeStep: boolean;
}

const RATIONALE: Record<StageKind, string> = {
  reframe: "상황을 자기 언어로 다시 진술했어요.",
  decompose: "상황 속 핵심 요소를 짚어냈어요.",
  relate: "요소들이 서로 어떻게 영향을 주는지 연결했어요.",
  relevance: "이 사고를 자신의 삶과 연결했어요.",
  transfer: "원리를 주변과 미래로 넓혀 생각했어요.",
};

export function evaluate(
  step: StepId,
  stageIndex: number,
  attempts: number,
  text: string,
  coaching: Coaching,
): StageOutcome {
  const stage = STAGES[step][stageIndex];

  // Korean answer (and not an "I'm stuck" phrase) → bilingual on-ramp.
  if (HANGUL_RE.test(text) && !KOREAN_STUCK_RE.test(text.trim()) && text.trim().length >= 2) {
    const nextStage = STAGES[step][stageIndex + 1];
    const completeStep = !nextStage;
    const ask = !completeStep && nextStage ? ASK[nextStage.kind] : undefined;
    const mirror = englishMirror(stage.kind, coaching);
    const reply =
      `좋아요 — 생각은 제대로예요. 영어로는 이렇게 말할 수 있어요: “${mirror}”` +
      (ask ? ` ${ask}` : " 다음엔 영어로도 한 줄 시도해볼까요?");
    return {
      reply,
      construct: stage.construct,
      delta: 2,
      englishDelta: 0,
      rationale: "한국어로 사고를 표현했어요 — 이제 영어로 옮기는 연습이에요.",
      signal: "partial",
      recordEvidence: true,
      advanceStage: true,
      completeStep,
    };
  }

  // Stuck on the first try → scaffold and give one more attempt.
  if (classify(stage.kind, text) === "stuck" && attempts < 1) {
    return {
      reply: scaffold(stage.kind, coaching),
      construct: stage.construct,
      delta: 0,
      englishDelta: 0,
      rationale: RATIONALE[stage.kind],
      signal: "stuck",
      recordEvidence: false,
      advanceStage: false,
      completeStep: false,
    };
  }

  // Graduated score, and a warmth tier derived from it.
  const delta = qualityScore(stage.kind, text);
  const tier: Signal = delta >= 4 ? "strong" : delta === 3 ? "partial" : "stuck";
  const englishDelta = englishBonus(text);
  const nextStage = STAGES[step][stageIndex + 1];
  const completeStep = !nextStage;

  const praise = PRAISE[stage.kind][tier];
  const reply =
    !completeStep && nextStage && ASK[nextStage.kind]
      ? `${praise} ${ASK[nextStage.kind]}`
      : praise;

  return {
    reply,
    construct: stage.construct,
    delta,
    englishDelta,
    rationale: RATIONALE[stage.kind],
    signal: tier,
    recordEvidence: delta >= 3,
    advanceStage: true,
    completeStep,
  };
}
