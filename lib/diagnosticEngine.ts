// The content-aware diagnostic dialogue engine (zero-API, runs client-side).
//
// This is the heart of the product: it decides what the coach asks next, reads
// the LINGUISTIC MARKERS of reasoning in the student's reply, classifies the
// reply (strong / partial / stuck), and branches — specific praise + the next
// question when they reason well, a problem-specific scaffold when they're
// stuck. The classification IS the measurement: each construct earns points
// from the markers detected in the student's own words.
//
// Mapping of Pólya steps → stages → constructs:
//   Step 1 (Understand & Plan): restate→redefine, assume→assume, plan→paths
//   Step 2 (Solve & Check):     reason→logic,    verify→verify
//   english is a cross-cutting bonus scored on the quality of the English.

import type { ConstructId } from "@/lib/constructs";
import type { StepId } from "@/lib/steps";
import type { Coaching } from "@/lib/problems";

export type Signal = "strong" | "partial" | "stuck";
export type StageKind = "restate" | "assume" | "plan" | "reason" | "verify";

interface StageDef {
  kind: StageKind;
  construct: ConstructId;
}

const STAGES: Record<StepId, StageDef[]> = {
  1: [
    { kind: "restate", construct: "redefine" },
    { kind: "assume", construct: "assume" },
    { kind: "plan", construct: "paths" },
  ],
  2: [
    { kind: "reason", construct: "logic" },
    { kind: "verify", construct: "verify" },
  ],
};

export function stagesForStep(step: StepId): StageDef[] {
  return STAGES[step];
}

// ── classification — the measurement ──────────────────────────────────────

const STUCK_RE =
  /\b(idk|i don'?t know|dunno|no idea|not sure|help|stuck|what|huh)\b|^\?+$|모르|몰라|도와|어렵|글쎄/i;

const MARKERS: Record<StageKind, RegExp> = {
  restate:
    /\b(find|finding|asking|asks|want|wants|need|needs|average|total|sum|how many|how much|how long|how heavy|what is|fraction|left|each|per|price|cost|change|slope|hypotenuse|side|groups?|heavier|longer|taller|weighs?|weight|holds?|hold|finish|ends?|difference|altogether|together)\b/i,
  assume:
    /\b(assume|assuming|suppose|let'?s say|let|if|same|constant|equal|both|each|stays?|doesn'?t change|every|all)\b/i,
  plan:
    /\b(could|can|first|then|next|one way|another|way|method|use|try|set up|multiply|divide|add|subtract|ratio|equation|formula|over|per|root|factor)\b/i,
  reason:
    /\b(because|since|so|then|therefore|that gives|which gives|gives|equals?|=|multiply|divide|add|subtract|times|plus|minus|substitute|plug|step)\b/i,
  verify:
    /\b(check|checking|verify|make sure|makes sense|sense|units?|substitute|plug|sanity|double[- ]?check|again|reasonable|between|should be|same)\b/i,
};

function wordCount(t: string): number {
  return t.trim().split(/\s+/).filter(Boolean).length;
}

export function classify(kind: StageKind, text: string): Signal {
  const t = text.trim();
  const wc = wordCount(t);
  if (STUCK_RE.test(t) || wc <= 1) return "stuck";
  const hit = MARKERS[kind].test(t);
  if (kind === "restate") {
    // Restating needs both substance (length) and pointing at the goal.
    return wc >= 6 && hit ? "strong" : "partial";
  }
  return hit ? (wc >= 5 ? "strong" : "partial") : "partial";
}

// English reasoning bonus — kept modest so a reasoning construct headlines the
// result. Rewards a full, structured English sentence.
function englishBonus(text: string): number {
  return wordCount(text) >= 7 ? 1 : 0;
}

// ── coach copy ─────────────────────────────────────────────────────────────

// Questions for stages that are NOT openers. (restate & reason are asked by the
// step greetings in lib/steps.ts.)
const ASK: Partial<Record<StageKind, string>> = {
  assume:
    "Now — what are you assuming here that the problem doesn't say out loud?",
  plan: "Before you compute: how would you get there? Is there more than one way?",
  verify: "You've reached an answer. How could you check it a different way?",
};

const PRAISE: Record<StageKind, Record<Signal, string>> = {
  restate: {
    strong: "Good — you put it in your own words instead of copying the problem.",
    partial: "Okay — you're pointing at the right thing. Let's sharpen it.",
    stuck: "No problem — we framed it together. That counts.",
  },
  assume: {
    strong: "Nice — naming that assumption out loud is exactly what strong solvers do.",
    partial: "Right — there's an assumption hiding in there.",
    stuck: "Good — now that assumption is out on the table.",
  },
  plan: {
    strong: "That's a real plan — and you saw more than one route.",
    partial: "Good — that's a workable approach.",
    stuck: "Either route works — now you've got a plan.",
  },
  reason: {
    strong: "Clean — each step follows from the last, no leaps.",
    partial: "Good step. I also want to hear the *why* behind it.",
    stuck: "Let's take it one small move at a time.",
  },
  verify: {
    strong: "Excellent — checking another way is the habit most students skip.",
    partial: "Good instinct to check your work.",
    stuck: "That's a solid way to be sure.",
  },
};

function scaffold(kind: StageKind, c: Coaching): string {
  switch (kind) {
    case "restate":
      return `Try starting with this frame — "${c.restateFrame}"`;
    case "assume":
      return `Here's a nudge: ${c.keyAssumption} Are you taking that for granted?`;
    case "plan":
      return `Two ways you could go — (1) ${c.approaches[0]}, or (2) ${c.approaches[1]}. Which feels cleaner?`;
    case "reason":
      return "Start small — what's the very first thing you can write down from what you're given?";
    case "verify":
      return `One way to check: ${c.verifyHint} Want to try that?`;
  }
}

// Sentence-starter chips shown under the input — lower the barrier of the blank
// English box and teach the reasoning patterns the product is built on.
export const STARTER_FRAMES: Record<StageKind, string[]> = {
  restate: ["The problem gives me…", "It's asking me to find…"],
  assume: ["I'm assuming that…", "I think we can suppose…"],
  plan: ["One way is to…", "I could also…"],
  reason: ["First, I…", "This works because…"],
  verify: ["I can check by…", "It makes sense because…"],
};

export function starterFramesFor(step: StepId, stageIndex: number): string[] {
  const stage = STAGES[step][Math.min(stageIndex, STAGES[step].length - 1)];
  return STARTER_FRAMES[stage.kind];
}

// ── the turn evaluator ──────────────────────────────────────────────────────

export interface StageOutcome {
  reply: string; // coach message (praise/nudge, plus the next question when advancing)
  construct: ConstructId; // construct this stage scores
  delta: number; // construct delta
  englishDelta: number; // english bonus
  rationale: string; // Korean, for the live evidence card
  signal: Signal;
  recordEvidence: boolean; // whether to surface the student's quote as evidence
  advanceStage: boolean; // move to the next stage?
  completeStep: boolean; // was this the last stage of the step?
}

const RATIONALE: Record<StageKind, string> = {
  restate: "문제를 그대로 베끼지 않고 자기 언어로 다시 진술했어요.",
  assume: "숨어 있던 전제를 의식적으로 드러냈어요.",
  plan: "한 가지 이상의 접근을 떠올리고 방향을 정했어요.",
  reason: "단계 사이를 비약 없이 근거로 연결했어요.",
  verify: "답을 다른 방법으로 점검하려고 시도했어요.",
};

// ── bilingual on-ramp ───────────────────────────────────────────────────────
// First-timers who've never reasoned in English shouldn't hit a wall. If they
// answer in Korean, we accept the THINKING, mirror it back as a model English
// sentence (built from the problem's coaching, never a fake translation), give
// partial credit, and keep moving. This is the product's core loop made visible
// in turn one: a Korean thought becomes English in front of them.

const HANGUL_RE = /[가-힣]/;
const KOREAN_STUCK_RE = /모르|몰라|도와|글쎄|어렵|^\?+$/;

function stripDot(s: string): string {
  return s.replace(/[.\s]+$/, "");
}

function englishMirror(kind: StageKind, c: Coaching): string {
  switch (kind) {
    case "restate":
      return c.restateFrame;
    case "assume":
      return `I'm assuming that ${stripDot(c.keyAssumption)}.`;
    case "plan":
      return `One way is to ${stripDot(c.approaches[0])}.`;
    case "reason":
      return "First, I work out one step — and I can say why it follows.";
    case "verify":
      return `I can check it — ${stripDot(c.verifyHint)}.`;
  }
}

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

  // Stuck on the first try → scaffold and give one more attempt (don't advance).
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

  // Advancing (strong, partial, or a forced advance after a stuck retry).
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
