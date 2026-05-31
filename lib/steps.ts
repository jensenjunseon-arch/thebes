// The diagnostic spine — a compressed 2-step Pólya flow.
// Each step is a MERGED stage so that all six constructs are still measured
// across a ~5-minute session. See docs/diagnostic-redesign.md §9.
//
// Order is enforced: the coach must not advance until the current step's exit
// condition is satisfied.

export type StepId = 1 | 2;

// Total steps in the diagnostic — single source of truth for boundary checks.
export const TOTAL_STEPS = 2;

export interface PolyaStep {
  id: StepId;
  slug: "understand" | "solve";
  // English display label — the content language, never localized.
  englishLabel: string;
  // Korean supporting label — shown small.
  koreanSupport: string;
  // What the coach is trying to surface from the student at this step.
  intent: string;
  // Korean one-liner shown to the student under the step indicator.
  studentHint: string;
  // The coach's opening line for this step — seeds the chat so the student
  // never faces a blank box. English (the reasoning language).
  greeting: string;
  // What the scorer should be looking for as evidence at this step.
  primaryConstructs: ReadonlyArray<
    "redefine" | "assume" | "paths" | "verify" | "logic" | "english"
  >;
}

export const POLYA_STEPS: readonly PolyaStep[] = [
  {
    id: 1,
    slug: "understand",
    englishLabel: "Understand & Plan",
    koreanSupport: "문제를 다시 진술하고, 가정을 드러내고, 접근을 떠올린다",
    intent:
      "Make the student restate the problem in their own words, surface assumptions, and propose at least one approach.",
    studentHint:
      "답을 맞히는 게 아니라, ‘어떻게 생각하는지’를 봐요. 영어가 막히면 한국어로 시작해도 좋아요.",
    greeting:
      "Here's the thing — any AI can get the answer in 5 seconds, so I won't ask you for it. I want to see how YOU think. Don't solve it yet. Just tell me, in your own words: what is this problem really asking?",
    primaryConstructs: ["redefine", "assume", "paths", "english"],
  },
  {
    id: 2,
    slug: "solve",
    englishLabel: "Solve & Check",
    koreanSupport: "단계별로 비약 없이 풀고, 답을 검증한다",
    intent:
      "Walk through the solution one step at a time with no logical leaps, then verify the answer another way.",
    studentHint:
      "이제 한 단계씩 풀어봐. 답을 찾으면, 맞는지 다른 방법으로 확인해보자.",
    greeting:
      "Good — now let's work it out. Walk me through your first step. What do you do, and why that?",
    primaryConstructs: ["logic", "verify", "english"],
  },
] as const;

export function stepById(id: StepId): PolyaStep {
  return POLYA_STEPS[id - 1];
}
