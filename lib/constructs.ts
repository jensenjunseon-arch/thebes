// The 6 thinking constructs that drive the parent-facing report.
// Definitions are stable contracts — once a student has score history under
// one of these IDs, do not rename the ID without a migration.
// See PRD §2.4.

export type ConstructId =
  | "redefine"
  | "assume"
  | "paths"
  | "verify"
  | "logic"
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
    englishName: "Problem Reframing",
    definition: "문제를 자기 언어로 정확히 다시 진술하는 능력",
  },
  {
    id: "assume",
    koreanName: "가정 명시화",
    englishName: "Assumption Surfacing",
    definition: "암묵적 전제를 의식적으로 드러내는 능력",
  },
  {
    id: "paths",
    koreanName: "경로 다양성",
    englishName: "Path Diversity",
    definition: "한 문제에 대해 서로 다른 접근을 생성하는 능력",
  },
  {
    id: "verify",
    koreanName: "검증 습관",
    englishName: "Verification Habit",
    definition: "답 도출 후 점검·반례·일반화를 시도하는 빈도",
  },
  {
    id: "logic",
    koreanName: "논리적 연결성",
    englishName: "Logical Continuity",
    definition: "단계 사이에 비약 없이 근거를 잇는 능력",
  },
  {
    id: "english",
    koreanName: "영어 추론 표현력",
    englishName: "Reasoning in English",
    definition: "위 과정 전체를 영어로 명료히 서술하는 능력",
  },
] as const;
