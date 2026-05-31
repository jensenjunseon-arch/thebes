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

// ── coach copy ─────────────────────────────────────────────────────────────

// Questions for stages that are NOT openers. (reframe & relevance are asked by
// the step greetings in lib/steps.ts.)
const ASK: Partial<Record<StageKind, string>> = {
  decompose:
    "Good. Now look closely — what are the key things or quantities in this situation? Name what matters.",
  relate:
    "Here's the interesting part — how do those things affect each other? If one changes, what happens to another?",
  transfer:
    "Last one — zoom all the way out. If lots of people could think like this, how might it change the people around you, or the future?",
};

const PRAISE: Record<StageKind, Record<Signal, string>> = {
  reframe: {
    strong: "Good — you described the situation in your own words, not the textbook's.",
    partial: "Okay — you're pointing at what this is about. Let's go deeper.",
    stuck: "No problem — we named what it's about together.",
  },
  decompose: {
    strong: "Nice — you pulled out the pieces that actually matter here.",
    partial: "Right, those are some of the moving parts.",
    stuck: "Good — now the key pieces are on the table.",
  },
  relate: {
    strong: "That's the real insight — you saw how the pieces push on each other.",
    partial: "Good — there's a connection there worth noticing.",
    stuck: "Exactly the kind of connection that matters.",
  },
  relevance: {
    strong: "Love that — you connected this to your own life, which is the whole point.",
    partial: "Good — I can see where this touches real life for you.",
    stuck: "That's a real place this kind of thinking shows up.",
  },
  transfer: {
    strong: "Beautiful — you took one situation and stretched it to the whole world.",
    partial: "Nice — you're seeing how this reaches beyond the page.",
    stuck: "That's a great way it could ripple outward.",
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
export const STARTER_FRAMES: Record<StageKind, string[]> = {
  reframe: ["This is about…", "Basically, it's asking…"],
  decompose: ["The key things are…", "What matters here is…"],
  relate: ["When ___ goes up,…", "These connect because…"],
  relevance: ["This would help me…", "In my life,…"],
  transfer: ["If everyone thought this way,…", "In the future,…"],
};

export function starterFramesFor(step: StepId, stageIndex: number): string[] {
  const stage = STAGES[step][Math.min(stageIndex, STAGES[step].length - 1)];
  return STARTER_FRAMES[stage.kind];
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

  const signal = classify(stage.kind, text);

  // Stuck on the first try → scaffold and give one more attempt.
  if (signal === "stuck" && attempts < 1) {
    return {
      reply: scaffold(stage.kind, coaching),
      construct: stage.construct,
      delta: 0,
      englishDelta: 0,
      rationale: RATIONALE[stage.kind],
      signal,
      recordEvidence: false,
      advanceStage: false,
      completeStep: false,
    };
  }

  const delta = signal === "strong" ? 4 : signal === "partial" ? 2 : 1;
  const englishDelta = signal === "stuck" ? 0 : englishBonus(text);
  const nextStage = STAGES[step][stageIndex + 1];
  const completeStep = !nextStage;

  const praise = PRAISE[stage.kind][signal];
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
    signal,
    recordEvidence: signal !== "stuck",
    advanceStage: true,
    completeStep,
  };
}
