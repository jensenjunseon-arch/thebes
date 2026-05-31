// The diagnostic spine — a widening arc, not a solve-the-problem procedure.
//
// Step 1 understands the SITUATION (reframe → decompose → relate).
// Step 2 connects it to the STUDENT and the WORLD (relevance → transfer).
// The numeric answer is never asked for — any AI can compute it. We measure how
// the student sees, structures, and extends the situation.

export type StepId = 1 | 2;

// Total Pólya-style phases — single source of truth for boundary checks.
export const TOTAL_STEPS = 2;

export interface PolyaStep {
  id: StepId;
  slug: "understand" | "connect";
  englishLabel: string;
  koreanSupport: string;
  intent: string;
  // Korean one-liner shown under the step indicator.
  studentHint: string;
  // The coach's opening line — seeds the chat so the student never faces a
  // blank box. English (the reasoning language); Korean reassurance is in the hint.
  greeting: string;
  primaryConstructs: ReadonlyArray<
    "redefine" | "decompose" | "relate" | "relevance" | "transfer" | "english"
  >;
}

export const POLYA_STEPS: readonly PolyaStep[] = [
  {
    id: 1,
    slug: "understand",
    englishLabel: "Understand the situation",
    koreanSupport: "상황을 다시 진술하고, 구성 요소와 그 관계를 본다",
    intent:
      "Get the student to restate the situation, name its key components, and see how those components relate — without computing anything.",
    studentHint:
      "정답을 맞히는 게 아니에요. 이 상황이 ‘무엇에 대한 건지’ 자신의 눈으로 보면 돼요. 한 문장이면 충분하고, 영어가 막히면 한국어로 시작해도 괜찮아요.",
    greeting:
      "Here's the thing — any AI can compute the answer in 5 seconds, so forget the answer. I want to see how YOU see this. In your own words: what is this situation actually about?",
    primaryConstructs: ["redefine", "decompose", "relate", "english"],
  },
  {
    id: 2,
    slug: "connect",
    englishLabel: "Connect it to you & the world",
    koreanSupport: "이 사고가 나에게, 그리고 주변·미래에 어떤 의미인지 넓힌다",
    intent:
      "Widen the student's thinking outward — why understanding this helps them personally, and how the idea extends to the people around them and their future.",
    studentHint:
      "이제 숫자에서 벗어나, 이 생각이 ‘나’와 ‘세상’에 어떤 의미인지 편하게 넓혀가요. 정답은 없으니 떠오르는 대로 적으면 돼요.",
    greeting:
      "Now let's zoom out. Step away from the numbers for a moment — if you really understood a situation like this, where in your own life would it actually help you?",
    primaryConstructs: ["relevance", "transfer", "english"],
  },
] as const;

export function stepById(id: StepId): PolyaStep {
  return POLYA_STEPS[id - 1];
}
