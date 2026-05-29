// Hardcoded demo state for v0 — single problem, fixed CEFR level.
// Real values come from the diagnostic + problem pool in M1/M2.

// Stable UUID from supabase/seed.sql — used when creating a live session.
export const DEMO_PROBLEM_ID = "b7c2e1f0-0000-0000-0000-000000000001";

export const DEMO_PROBLEM = {
  id: DEMO_PROBLEM_ID,
  topic: "Ratios",
  difficulty: "중2",
  englishStatement:
    "A car travels from town A to town B at 40 km/h and returns at 60 km/h. What is its average speed for the whole trip?",
  koreanSupport:
    "자동차가 A에서 B까지는 40km/h, 돌아올 때는 60km/h로 갑니다. 왕복 평균 속력은?",
  // Used only by the answer-leak filter — never sent to the tutor model.
  forbiddenAnswerTokens: ["48", "48 km/h", "48km/h"],
} as const;

export const DEMO_CEFR_LEVEL = "B1";
