// The diagnostic problem pool. Difficulty spans 초등 저학년–고1 with varied topics.
//
// Each problem carries `coaching` metadata: problem-specific scaffolds the
// dialogue engine uses to nudge a stuck student WITHOUT revealing the numeric
// answer. This is what makes the coach feel like it deeply understands THIS
// problem rather than reciting generic hints.
//
// SECURITY: `forbiddenAnswerTokens` contains the ANSWER and is server-only —
// `toPublicProblem()` strips it before serializing to the client. The `coaching`
// fields are intentionally answer-free (method hints, not numbers), so they are
// safe to ship to the client (the scripted engine runs client-side).

export type Level =
  | "초등 저학년"
  | "초등 고학년"
  | "중1"
  | "중2"
  | "중3"
  | "고1";

export const LEVELS: readonly Level[] = [
  "초등 저학년",
  "초등 고학년",
  "중1",
  "중2",
  "중3",
  "고1",
];

// Problem-specific coaching scaffolds. All answer-free.
export interface Coaching {
  // A fill-in-the-blank frame to help the student restate the problem.
  restateFrame: string;
  // The hidden assumption to surface (phrased as a nudge, no answer).
  keyAssumption: string;
  // Two genuinely distinct approaches, in simple English (no answer).
  approaches: [string, string];
  // A way to check the answer that does not state the answer.
  verifyHint: string;
}

export interface Problem {
  id: string;
  level: Level;
  topic: string; // Korean topic label, shown in the problem chip
  englishStatement: string;
  koreanSupport: string;
  forbiddenAnswerTokens: ReadonlyArray<string>;
  coaching: Coaching;
}

// Client-safe shape — no answer tokens (coaching is kept; it is answer-free).
export type PublicProblem = Omit<Problem, "forbiddenAnswerTokens">;

// Stable UUID from supabase/seed.sql — used when creating a live DB session.
export const DEFAULT_PROBLEM_ID = "b7c2e1f0-0000-0000-0000-000000000001";

export const PROBLEMS: readonly Problem[] = [
  // ── 초등 저학년 ───────────────────────────────────────────────────────
  {
    id: "elem-low-add",
    level: "초등 저학년",
    topic: "덧셈",
    englishStatement:
      "You have 8 candies. Your friend gives you 6 more. How many candies do you have now?",
    koreanSupport:
      "사탕 8개를 가지고 있어요. 친구가 6개를 더 줬어요. 지금 사탕은 모두 몇 개일까요?",
    forbiddenAnswerTokens: ["14"],
    coaching: {
      restateFrame: "I start with ___ candies, and I get ___ more.",
      keyAssumption: "you don't lose or eat any candies along the way.",
      approaches: ["count up from 8, six more times", "add the two amounts together"],
      verifyHint: "take your answer and subtract 6 — you should get back to 8.",
    },
  },
  {
    id: "elem-low-mult",
    level: "초등 저학년",
    topic: "곱셈",
    englishStatement:
      "A box has 4 rows of cookies. Each row has 3 cookies. How many cookies are there in total?",
    koreanSupport:
      "상자에 쿠키가 4줄 들어 있어요. 한 줄에 쿠키가 3개씩 있어요. 쿠키는 모두 몇 개일까요?",
    forbiddenAnswerTokens: ["12 cookies", "= 12"],
    coaching: {
      restateFrame: "There are ___ rows, and each row has ___ cookies.",
      keyAssumption: "every row has the same number of cookies.",
      approaches: ["add 3 four times", "multiply the rows by the cookies in each row"],
      verifyHint: "count one row at a time and see if you land on the same total.",
    },
  },
  {
    id: "elem-low-sub",
    level: "초등 저학년",
    topic: "뺄셈",
    englishStatement:
      "You have 15 stickers. You give 7 of them to a friend. How many stickers do you have left?",
    koreanSupport:
      "스티커 15개가 있어요. 그중 7개를 친구에게 줬어요. 남은 스티커는 몇 개일까요?",
    forbiddenAnswerTokens: ["8 stickers", "= 8"],
    coaching: {
      restateFrame: "I start with ___ stickers and give away ___.",
      keyAssumption: "you only give away the 7 you mentioned — nothing else changes.",
      approaches: ["count down from 15 by seven", "subtract 7 from 15"],
      verifyHint: "add your answer back to 7 — it should return to 15.",
    },
  },

  // ── 초등 고학년 ───────────────────────────────────────────────────────
  {
    id: "elem-high-fraction",
    level: "초등 고학년",
    topic: "분수",
    englishStatement:
      "A pizza is cut into 8 equal slices. You eat 3 of them. What fraction of the pizza is left?",
    koreanSupport:
      "피자를 똑같이 8조각으로 잘랐어요. 그중 3조각을 먹었어요. 남은 피자는 전체의 몇 분의 몇일까요?",
    forbiddenAnswerTokens: ["5/8"],
    coaching: {
      restateFrame: "The whole pizza is ___ slices, and ___ are gone.",
      keyAssumption: "all 8 slices are the same size.",
      approaches: ["count the slices that remain", "subtract the eaten fraction from the whole"],
      verifyHint: "the eaten part and the leftover part should add back up to the whole pizza.",
    },
  },
  {
    id: "elem-high-divide",
    level: "초등 고학년",
    topic: "나눗셈",
    englishStatement:
      "There are 24 students. They are split into groups of 4. How many groups are there?",
    koreanSupport:
      "학생이 24명 있어요. 4명씩 한 모둠으로 나누면, 모둠은 모두 몇 개일까요?",
    forbiddenAnswerTokens: ["= 6", "6 groups", "6 모둠"],
    coaching: {
      restateFrame: "I have ___ students, and each group holds ___.",
      keyAssumption: "every group is full — exactly 4 students, none left over.",
      approaches: ["keep subtracting 4 until you reach zero", "divide the total by the group size"],
      verifyHint: "multiply your number of groups by 4 — you should get back to 24.",
    },
  },
  {
    id: "elem-high-ratio",
    level: "초등 고학년",
    topic: "비례",
    englishStatement:
      "A recipe for 2 people needs 3 cups of rice. How many cups are needed for 6 people?",
    koreanSupport:
      "2인분 요리에 쌀 3컵이 필요해요. 6인분을 만들려면 쌀이 몇 컵 필요할까요?",
    forbiddenAnswerTokens: ["9 cups", "= 9"],
    coaching: {
      restateFrame: "The recipe is written for ___ people, and I need it for ___.",
      keyAssumption: "the rice grows evenly with the number of people.",
      approaches: ["see how many times bigger 6 is than 2, then scale the rice", "find the rice for one person first"],
      verifyHint: "your cups-per-person should be the same for 2 people and for 6 people.",
    },
  },

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
    coaching: {
      restateFrame: "It takes ___ eggs per ___ muffins, and I want ___ muffins.",
      keyAssumption: "the egg-to-muffin ratio stays the same as you scale up.",
      approaches: ["find how many times 24 is bigger than 4, then scale the eggs", "find eggs per muffin first"],
      verifyHint: "your eggs-per-muffin ratio should match the original 3-to-4.",
    },
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
    coaching: {
      restateFrame: "The original price is ___, and ___ percent comes off.",
      keyAssumption: "the 30% is taken off the original price, not some other number.",
      approaches: ["find 30% of the price, then subtract it", "realize you pay 70% and find that directly"],
      verifyHint: "the discount plus the final price should add back to 40,000.",
    },
  },
  {
    id: "mean-three",
    level: "중1",
    topic: "평균",
    englishStatement:
      "Three test scores are 75, 80, and 91. What is the average score?",
    koreanSupport:
      "세 번의 시험 점수가 각각 75, 80, 91점입니다. 평균 점수는 몇 점일까요?",
    forbiddenAnswerTokens: ["82"],
    coaching: {
      restateFrame: "I have ___ scores and I'm asked for their ___.",
      keyAssumption: "each of the three tests counts equally.",
      approaches: ["add all three and divide by three", "start from the middle score and adjust"],
      verifyHint: "the average must land somewhere between 75 and 91.",
    },
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
    coaching: {
      restateFrame: "I'm asked for the average speed over the ___ round trip.",
      keyAssumption: "the one-way distance is the same in both directions.",
      approaches: ["pick a convenient distance like d and find total time", "use total distance over total time"],
      verifyHint: "the answer can't be the plain middle of 40 and 60 — more time is spent at the slower speed.",
    },
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
    coaching: {
      restateFrame: "Some number plus ___ equals ___.",
      keyAssumption: "the unknown is a single fixed number.",
      approaches: ["write it as x + 18 = 45 and solve", "undo the +18 by subtracting"],
      verifyHint: "add 18 back to your number — you should land on 45.",
    },
  },
  {
    id: "linear-eq2",
    level: "중2",
    topic: "일차방정식",
    englishStatement: "Solve for x: 3x − 5 = 22.",
    koreanSupport: "다음 방정식을 푸세요: 3x − 5 = 22. x의 값은?",
    forbiddenAnswerTokens: ["x = 9", "x=9", "is 9"],
    coaching: {
      restateFrame: "I need the value of x that makes ___ true.",
      keyAssumption: "x is one number that stays the same throughout.",
      approaches: ["undo the −5 first, then the ×3", "isolate the x-term, then divide"],
      verifyHint: "put your x back into 3x − 5 and check that it gives 22.",
    },
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
    coaching: {
      restateFrame: "Two sides are ___ and ___, and I want the longest side.",
      keyAssumption: "the angle between the two legs is exactly 90 degrees.",
      approaches: ["use a² + b² = c²", "recall common right-triangle side patterns"],
      verifyHint: "the hypotenuse must be longer than 8 but shorter than 6 + 8.",
    },
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
    coaching: {
      restateFrame: "The square's area is ___, and I want one ___.",
      keyAssumption: "all four sides of a square are equal.",
      approaches: ["ask what number times itself gives 144", "take the square root of the area"],
      verifyHint: "multiply your side by itself — you should get 144.",
    },
  },
  {
    id: "quad-consecutive",
    level: "중3",
    topic: "이차방정식",
    englishStatement:
      "The product of two consecutive positive integers is 72. What is the smaller integer?",
    koreanSupport:
      "연속한 두 양의 정수의 곱이 72입니다. 더 작은 정수는 얼마일까요?",
    forbiddenAnswerTokens: ["8 and 9", "is 8", "= 8"],
    coaching: {
      restateFrame: "Two numbers in a row multiply to ___, and I want the ___ one.",
      keyAssumption: "the two integers differ by exactly 1.",
      approaches: ["call them n and n+1 and set up an equation", "try integer pairs near the square root of 72"],
      verifyHint: "multiply your two consecutive integers — do you get 72?",
    },
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
    coaching: {
      restateFrame: "Height is given by ___, and 'hits the ground' means height is ___.",
      keyAssumption: "'hitting the ground' means the height h equals zero.",
      approaches: ["set h = 0 and factor out t", "find when the upward and downward parts cancel"],
      verifyHint: "t = 0 is one moment it's on the ground (the throw) — you want the other one.",
    },
  },
  {
    id: "exponent-32",
    level: "고1",
    topic: "지수",
    englishStatement: "If 2^x = 32, what is the value of x?",
    koreanSupport: "2^x = 32 일 때, x의 값은 얼마일까요?",
    forbiddenAnswerTokens: ["x = 5", "x=5", "is 5"],
    coaching: {
      restateFrame: "I need the power that turns 2 into ___.",
      keyAssumption: "x is the number of times you multiply 2 by itself.",
      approaches: ["write 32 as a power of 2", "keep doubling from 2 and count the steps"],
      verifyHint: "multiply 2 by itself x times and check you reach 32.",
    },
  },
  {
    id: "line-slope",
    level: "고1",
    topic: "직선의 기울기",
    englishStatement:
      "A line passes through the points (1, 2) and (4, 11). What is its slope?",
    koreanSupport:
      "직선이 두 점 (1, 2) 와 (4, 11) 을 지납니다. 이 직선의 기울기는 얼마일까요?",
    forbiddenAnswerTokens: ["= 3", "slope is 3", "is 3", "slope of 3"],
    coaching: {
      restateFrame: "I have two points and I'm asked for the line's ___.",
      keyAssumption: "the slope is constant everywhere on a straight line.",
      approaches: ["use rise over run between the two points", "find how much y changes for each step in x"],
      verifyHint: "going from x = 1 to x = 4 is 3 steps — does y rise by 3 times your slope?",
    },
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
