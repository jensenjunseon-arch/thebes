// The diagnostic problem pool. Difficulty spans 중1–고1 with varied topics.
//
// SECURITY: `forbiddenAnswerTokens` contains the ANSWER. This file is
// server-only data — never pass a raw Problem to a client component. Use
// `toPublicProblem()` to strip the answer before serializing to the client.
// The answer tokens are resolved server-side in submitTurn for the leak filter.

export type Level = "중1" | "중2" | "중3" | "고1";

export const LEVELS: readonly Level[] = ["중1", "중2", "중3", "고1"];

export interface Problem {
  id: string;
  level: Level;
  topic: string; // Korean topic label, shown in the problem chip
  englishStatement: string;
  koreanSupport: string;
  forbiddenAnswerTokens: ReadonlyArray<string>;
}

// Client-safe shape — no answer tokens.
export type PublicProblem = Omit<Problem, "forbiddenAnswerTokens">;

// Stable UUID from supabase/seed.sql — used when creating a live DB session.
export const DEFAULT_PROBLEM_ID = "b7c2e1f0-0000-0000-0000-000000000001";

export const PROBLEMS: readonly Problem[] = [
  // ── 중1 ──────────────────────────────────────────────────────────────
  {
    id: "ratio-muffins",
    level: "중1",
    topic: "비례",
    englishStatement:
      "A bakery uses 3 eggs to make 4 muffins. How many eggs are needed to make 24 muffins?",
    koreanSupport:
      "어떤 빵집이 머핀 4개를 만드는 데 달걀 3개를 씁니다. 머핀 24개를 만들려면 달걀 몇 개가 필요할까요?",
    forbiddenAnswerTokens: ["18"],
  },
  {
    id: "percent-jacket",
    level: "중1",
    topic: "백분율",
    englishStatement:
      "A jacket costs 40,000 won. It is on sale for 30% off. What is the final price?",
    koreanSupport:
      "재킷 한 벌이 40,000원입니다. 30% 할인 중일 때, 최종 가격은 얼마일까요?",
    forbiddenAnswerTokens: ["28000", "28,000"],
  },

  // ── 중2 ──────────────────────────────────────────────────────────────
  {
    id: DEFAULT_PROBLEM_ID,
    level: "중2",
    topic: "속력",
    englishStatement:
      "A car travels from town A to town B at 40 km/h and returns at 60 km/h. What is its average speed for the whole trip?",
    koreanSupport:
      "자동차가 A에서 B까지는 40km/h, 돌아올 때는 60km/h로 갑니다. 왕복 평균 속력은?",
    forbiddenAnswerTokens: ["48", "48 km/h", "48km/h"],
  },
  {
    id: "linear-number",
    level: "중2",
    topic: "일차방정식",
    englishStatement:
      "When a number is increased by 18, the result is 45. What is the number?",
    koreanSupport:
      "어떤 수에 18을 더했더니 45가 되었습니다. 그 수는 얼마일까요?",
    forbiddenAnswerTokens: ["27"],
  },

  // ── 중3 ──────────────────────────────────────────────────────────────
  {
    id: "pythagoras-legs",
    level: "중3",
    topic: "피타고라스",
    englishStatement:
      "A right triangle has legs of length 6 and 8. How long is the hypotenuse?",
    koreanSupport:
      "직각삼각형의 두 변의 길이가 각각 6과 8입니다. 빗변의 길이는 얼마일까요?",
    forbiddenAnswerTokens: ["10"],
  },
  {
    id: "square-area",
    level: "중3",
    topic: "제곱근",
    englishStatement:
      "The area of a square is 144 cm². What is the length of one side?",
    koreanSupport:
      "정사각형의 넓이가 144 cm²입니다. 한 변의 길이는 얼마일까요?",
    forbiddenAnswerTokens: ["12 cm", "12cm", "= 12"],
  },

  // ── 고1 ──────────────────────────────────────────────────────────────
  {
    id: "quadratic-ball",
    level: "고1",
    topic: "이차함수",
    englishStatement:
      "A ball is thrown upward. Its height in meters after t seconds is h = 20t − 5t². After how many seconds does it hit the ground?",
    koreanSupport:
      "공을 위로 던졌습니다. t초 후 높이는 h = 20t − 5t² (미터)입니다. 몇 초 후에 땅에 떨어질까요?",
    forbiddenAnswerTokens: ["t = 4", "t=4", "4 seconds", "4 sec"],
  },
  {
    id: "exponent-32",
    level: "고1",
    topic: "지수",
    englishStatement: "If 2^x = 32, what is the value of x?",
    koreanSupport: "2^x = 32 일 때, x의 값은 얼마일까요?",
    forbiddenAnswerTokens: ["x = 5", "x=5", "is 5"],
  },
] as const;

export function toPublicProblem(p: Problem): PublicProblem {
  const { forbiddenAnswerTokens: _omit, ...rest } = p;
  void _omit;
  return rest;
}

export const PUBLIC_PROBLEMS: readonly PublicProblem[] =
  PROBLEMS.map(toPublicProblem);

export function getProblemById(id: string): Problem | undefined {
  return PROBLEMS.find((p) => p.id === id);
}

export function problemsByLevel(level: Level): readonly PublicProblem[] {
  return PUBLIC_PROBLEMS.filter((p) => p.level === level);
}

export const DEFAULT_PROBLEM = getProblemById(DEFAULT_PROBLEM_ID)!;
