// The 6 thinking constructs that drive the diagnostic and the parent report.
//
// These are deliberately NOT "steps of solving a math problem." The diagnostic
// never asks for the numeric answer (any AI can compute that). Instead it widens
// the student's thinking outward — from the situation, to its parts, to how the
// parts relate, to why it matters to them, to how it extends to their world.
// That arc is what AI cannot do for you, and it is the thing worth measuring.
//
// Definitions are stable contracts — once a student has score history under one
// of these IDs, do not rename the ID without a migration.

export type ConstructId =
  | "redefine"
  | "decompose"
  | "relate"
  | "relevance"
  | "transfer"
  | "english";

export interface Construct {
  id: ConstructId;
  koreanName: string;
  englishName: string;
  definition: string;
}

export const CONSTRUCTS: readonly Construct[] = [
  {
    id: "redefine",
    koreanName: "문제 재정의력",
    englishName: "Reframing",
    definition: "주어진 상황을 자기 언어로 다시 진술하는 능력",
  },
  {
    id: "decompose",
    koreanName: "구성 요소 분해",
    englishName: "Decomposition",
    definition: "상황 속 핵심 요소(양·조건·변수)를 짚어내는 능력",
  },
  {
    id: "relate",
    koreanName: "관계 파악",
    englishName: "Relational Thinking",
    definition: "요소들이 서로 어떻게 영향을 주고받는지 보는 능력",
  },
  {
    id: "relevance",
    koreanName: "실생활 연결",
    englishName: "Relevance",
    definition: "이 사고가 자신의 삶에 어떤 의미·이득인지 연결하는 능력",
  },
  {
    id: "transfer",
    koreanName: "확장적 사고",
    englishName: "Transfer",
    definition: "한 상황의 원리를 주변과 미래로 넓혀 적용하는 능력",
  },
  {
    id: "english",
    koreanName: "영어 추론 표현력",
    englishName: "Reasoning in English",
    definition: "위 과정 전체를 영어로 명료히 표현하는 능력",
  },
] as const;
