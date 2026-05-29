// Pólya's 4 steps — the spine of every learning session.
// Order is enforced: the coach must not advance until the current step's exit
// condition is satisfied. See PRD §2.2 and Appendix A.

export type StepId = 1 | 2 | 3 | 4;

export interface PolyaStep {
  id: StepId;
  slug: "frame" | "plan" | "work" | "lookback";
  // Serif italic display label — English only, never localized.
  englishLabel: string;
  // Korean supporting label — shown small, never in italics.
  koreanSupport: string;
  // What the coach is trying to surface from the student at this step.
  intent: string;
  // What the scorer should be looking for as evidence at this step.
  primaryConstructs: ReadonlyArray<
    "redefine" | "assume" | "paths" | "verify" | "logic" | "english"
  >;
}

export const POLYA_STEPS: readonly PolyaStep[] = [
  {
    id: 1,
    slug: "frame",
    englishLabel: "Frame it",
    koreanSupport: "문제를 다시 진술하고, 가정을 드러낸다",
    intent:
      "Make the student restate the problem in their own words and surface assumptions.",
    primaryConstructs: ["redefine", "assume", "english"],
  },
  {
    id: 2,
    slug: "plan",
    englishLabel: "Plan it",
    koreanSupport: "2–3가지 다른 접근을 제안한다",
    intent:
      "Get the student to articulate multiple distinct approaches before committing to one.",
    primaryConstructs: ["paths", "english"],
  },
  {
    id: 3,
    slug: "work",
    englishLabel: "Work it",
    koreanSupport: "단계별로, 비약 없이 푼다",
    intent: "Walk through the solution one step at a time with no logical leaps.",
    primaryConstructs: ["logic", "english"],
  },
  {
    id: 4,
    slug: "lookback",
    englishLabel: "Look back",
    koreanSupport: "왜 그 답인가, 일반화 가능한가",
    intent: "Verify the answer, search for edge cases, and attempt generalization.",
    primaryConstructs: ["verify", "english"],
  },
] as const;
