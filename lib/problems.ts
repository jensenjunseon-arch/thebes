// The diagnostic problem pool. Difficulty spans 초등 저학년–고1 with varied topics.
//
// Each problem carries `coaching` metadata — answer-FREE scaffolds the dialogue
// engine uses to widen a stuck student's thinking (what it's about → its parts →
// how they relate → why it matters). None of it states the numeric answer, so it
// is safe on the client (the scripted engine runs client-side). The diagnostic
// never asks the student to compute, so the answer is never the point.
//
// SECURITY: `forbiddenAnswerTokens` (the answer) is server-only and stripped by
// `toPublicProblem()` — used only by the live-mode leak filter.

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

// Answer-free coaching scaffolds, aligned to the widening-arc dialogue.
export interface Coaching {
  // What the situation is fundamentally about (reframe scaffold/mirror).
  summary: string;
  // The key elements / quantities in the situation (decompose scaffold).
  components: string;
  // An example of how the elements affect each other (relate scaffold).
  relationship: string;
  // Where this kind of thinking shows up in real life (relevance scaffold).
  realWorld: string;
}

export interface Problem {
  id: string;
  level: Level;
  topic: string;
  englishStatement: string;
  koreanSupport: string;
  forbiddenAnswerTokens: ReadonlyArray<string>;
  coaching: Coaching;
}

export type PublicProblem = Omit<Problem, "forbiddenAnswerTokens">;

export const DEFAULT_PROBLEM_ID = "b7c2e1f0-0000-0000-0000-000000000001";

export const PROBLEMS: readonly Problem[] = [
  // ── 초등 저학년 ───────────────────────────────────────────────────────
  {
    id: "elem-low-weight",
    level: "초등 저학년",
    topic: "무게",
    englishStatement:
      "A melon weighs 2 kg. A watermelon is 3 times as heavy as the melon. How heavy is the watermelon?",
    koreanSupport:
      "멜론 한 개의 무게는 2kg이에요. 수박은 멜론보다 3배 무거워요. 수박의 무게는 몇 kg일까요?",
    forbiddenAnswerTokens: ["6 kg", "6kg", "6 kilograms", "= 6", "is 6"],
    coaching: {
      summary: "comparing the weight of a melon and a watermelon",
      components: "the melon's weight and how many times heavier the watermelon is",
      relationship: "the more times heavier it is, the more the watermelon weighs",
      realWorld: "guessing how heavy your backpack gets as you add books",
    },
  },
  {
    id: "elem-low-money",
    level: "초등 저학년",
    topic: "돈·거스름돈",
    englishStatement:
      "You buy a pencil for 700 won and pay with a 1,000-won bill. How much change do you get back?",
    koreanSupport:
      "연필을 700원에 사고 1,000원짜리 지폐를 냈어요. 거스름돈으로 얼마를 돌려받을까요?",
    forbiddenAnswerTokens: ["300"],
    coaching: {
      summary: "how much change comes back after you pay for something",
      components: "the money you hand over and the price of the pencil",
      relationship: "the more the pencil costs, the less change you get back",
      realWorld: "checking your change at a store so you aren't shorted",
    },
  },
  {
    id: "elem-low-time",
    level: "초등 저학년",
    topic: "시간",
    englishStatement:
      "Soccer practice starts at 3 o'clock and lasts 2 hours. What time does it finish?",
    koreanSupport:
      "축구 연습이 3시에 시작해서 2시간 동안 해요. 연습은 몇 시에 끝날까요?",
    forbiddenAnswerTokens: ["5 o'clock", "5:00", "= 5", "is 5"],
    coaching: {
      summary: "when an activity ends if you know its start and how long it runs",
      components: "the start time and how long it lasts",
      relationship: "the longer it lasts, the later it finishes",
      realWorld: "planning when you'll be free to meet a friend",
    },
  },
  {
    id: "elem-low-length",
    level: "초등 저학년",
    topic: "길이",
    englishStatement:
      "A red ribbon is 9 cm long. A blue ribbon is 4 cm long. How much longer is the red ribbon than the blue one?",
    koreanSupport:
      "빨간 리본은 9cm, 파란 리본은 4cm예요. 빨간 리본은 파란 리본보다 몇 cm 더 길까요?",
    forbiddenAnswerTokens: ["5 cm", "5cm", "= 5", "is 5"],
    coaching: {
      summary: "comparing the lengths of two ribbons",
      components: "the red ribbon's length and the blue ribbon's length",
      relationship: "the bigger the gap between them, the longer one is than the other",
      realWorld: "figuring out if a shelf is long enough for your books",
    },
  },
  {
    id: "elem-low-capacity",
    level: "초등 저학년",
    topic: "들이",
    englishStatement:
      "One bottle holds 2 liters of water. How many liters do 4 bottles hold altogether?",
    koreanSupport:
      "물병 하나에 물이 2리터 들어가요. 물병 4개에는 물이 모두 몇 리터 들어갈까요?",
    forbiddenAnswerTokens: ["8 liters", "8 l", "8l", "= 8", "is 8"],
    coaching: {
      summary: "how much water several identical bottles hold together",
      components: "how much one bottle holds and how many bottles there are",
      relationship: "the more bottles, the more total water",
      realWorld: "knowing how much drink to buy for a whole group",
    },
  },
  {
    id: "elem-low-share",
    level: "초등 저학년",
    topic: "똑같이 나누기",
    englishStatement:
      "12 strawberries are shared equally onto 3 plates. How many strawberries are on each plate?",
    koreanSupport:
      "딸기 12개를 접시 3개에 똑같이 나눠 담아요. 접시 한 개에는 딸기가 몇 개씩 놓일까요?",
    forbiddenAnswerTokens: ["4 strawberries", "4 on each", "= 4", "is 4"],
    coaching: {
      summary: "sharing strawberries equally onto plates",
      components: "the total strawberries and the number of plates",
      relationship: "the more plates, the fewer strawberries on each",
      realWorld: "splitting snacks fairly among friends",
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
      summary: "what fraction of a pizza is left after eating some",
      components: "the total number of slices and how many were eaten",
      relationship: "the more you eat, the less is left",
      realWorld: "tracking how much of your data or allowance is left",
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
      summary: "splitting a class into equal-sized groups",
      components: "the total number of students and the size of each group",
      relationship: "the bigger each group, the fewer groups you get",
      realWorld: "arranging a class or a team into even groups",
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
      summary: "scaling a recipe up for more people",
      components: "the people the recipe serves and the cups of rice it uses",
      relationship: "the more people, the more rice — growing in step",
      realWorld: "cooking the right amount when guests come over",
    },
  },
  {
    id: "elem-high-area",
    level: "초등 고학년",
    topic: "넓이",
    englishStatement:
      "A rectangle is 6 cm wide and 4 cm tall. What is its area?",
    koreanSupport:
      "직사각형의 가로가 6cm, 세로가 4cm입니다. 이 직사각형의 넓이는 몇 cm²일까요?",
    forbiddenAnswerTokens: ["24 cm", "24cm", "= 24"],
    coaching: {
      summary: "the space inside a rectangle",
      components: "the width and the height",
      relationship: "the longer either side, the bigger the area",
      realWorld: "figuring out if a rug fits a room",
    },
  },
  {
    id: "elem-high-outfits",
    level: "초등 고학년",
    topic: "경우의 수",
    englishStatement:
      "You have 3 shirts and 2 pairs of pants. How many different outfits (one shirt and one pair of pants) can you make?",
    koreanSupport:
      "셔츠 3벌과 바지 2벌이 있어요. 셔츠 1벌과 바지 1벌로 만들 수 있는 서로 다른 옷차림은 모두 몇 가지일까요?",
    forbiddenAnswerTokens: ["6 outfits", "= 6", "is 6"],
    coaching: {
      summary: "how many outfits you can mix and match from a few clothes",
      components: "the number of shirts and the number of pants",
      relationship: "the more of either, the more combinations open up",
      realWorld: "seeing how much variety a small wardrobe actually gives you",
    },
  },
  {
    id: "elem-high-elapsed",
    level: "초등 고학년",
    topic: "시간 경과",
    englishStatement:
      "A movie starts at 2:30 and lasts 90 minutes. What time does it end?",
    koreanSupport:
      "영화가 2시 30분에 시작해서 90분 동안 상영해요. 영화는 몇 시에 끝날까요?",
    forbiddenAnswerTokens: ["4:00", "4 o'clock", "= 4"],
    coaching: {
      summary: "when a movie ends, given its start time and runtime",
      components: "the start time and the length in minutes",
      relationship: "the longer the movie, the later it ends",
      realWorld: "planning your evening around when a show finishes",
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
      summary: "scaling up how many eggs a bigger batch of muffins needs",
      components: "the eggs-to-muffins ratio and the number of muffins you want",
      relationship: "the more muffins, the more eggs — in the same proportion",
      realWorld: "scaling any recipe or budget up or down",
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
      summary: "the price you actually pay after a percentage discount",
      components: "the original price and the discount percent",
      relationship: "the bigger the discount, the less you pay",
      realWorld: "knowing the real price during a sale",
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
      summary: "the average that represents three test scores with one number",
      components: "the three scores and how many of them there are",
      relationship: "one unusually high or low score pulls the average toward it",
      realWorld: "tracking your grade average across exams",
    },
  },
  {
    id: "angle-triangle",
    level: "중1",
    topic: "도형 각도",
    englishStatement:
      "Two angles of a triangle are 50° and 60°. What is the third angle?",
    koreanSupport:
      "삼각형의 두 각이 각각 50°와 60°입니다. 나머지 한 각의 크기는 몇 도일까요?",
    forbiddenAnswerTokens: ["70°", "70 degrees", "= 70", "is 70"],
    coaching: {
      summary: "finding the missing angle in a triangle",
      components: "the two known angles and the fixed total the three must reach",
      relationship: "the bigger the two known angles, the smaller the third must be",
      realWorld: "checking corners when building or designing something",
    },
  },
  {
    id: "integer-temp",
    level: "중1",
    topic: "정수",
    englishStatement:
      "The temperature was −3°C in the morning. By noon it rose by 8°C. What is the temperature at noon?",
    koreanSupport:
      "아침 기온이 −3°C였어요. 정오까지 8°C 올랐어요. 정오의 기온은 몇 °C일까요?",
    forbiddenAnswerTokens: ["5°c", "5 °c", "5 degrees", "= 5", "is 5"],
    coaching: {
      summary: "where the temperature lands after rising from below zero",
      components: "the starting temperature and how much it rose",
      relationship: "the more it rises, the warmer it ends up",
      realWorld: "reading how the weather shifts through the day",
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
      summary: "the average speed of a round trip taken at two different speeds",
      components: "the two speeds, the distance, and the total time",
      relationship: "the slower leg eats up more time, so it weighs the average down",
      realWorld: "estimating travel time when your speed isn't constant",
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
      summary: "working backward from a result to find an unknown number",
      components: "the unknown number, what's added to it, and the result",
      relationship: "as the unknown grows, the result grows right along with it",
      realWorld: "figuring out a starting amount from a final total",
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
      summary: "finding the value of x that makes an equation balance",
      components: "the unknown x and the operations wrapped around it",
      relationship: "changing x shifts one side until the two sides match",
      realWorld: "reversing a process to find what you started with",
    },
  },
  {
    id: "prob-marbles",
    level: "중2",
    topic: "확률",
    englishStatement:
      "A bag has 3 red marbles and 2 blue marbles. If you draw one without looking, what is the probability it is red?",
    koreanSupport:
      "주머니에 빨간 구슬 3개와 파란 구슬 2개가 있어요. 보지 않고 하나를 뽑을 때, 빨간 구슬일 확률은 얼마일까요?",
    forbiddenAnswerTokens: ["3/5"],
    coaching: {
      summary: "the chance of drawing a red marble from a bag",
      components: "the number of red marbles and the total number of marbles",
      relationship: "more red marbles means a higher chance of red",
      realWorld: "judging the odds in games or everyday risks",
    },
  },
  {
    id: "linear-taxi",
    level: "중2",
    topic: "일차함수",
    englishStatement:
      "A taxi charges 3,000 won to start, plus 1,000 won for each kilometer. What is the fare for a 5 km trip?",
    koreanSupport:
      "택시 요금은 기본 3,000원에, 1km마다 1,000원이 추가돼요. 5km를 가면 요금은 얼마일까요?",
    forbiddenAnswerTokens: ["8000", "8,000"],
    coaching: {
      summary: "a fare made of a fixed base plus a charge that grows with distance",
      components: "the base fare, the per-kilometer rate, and the distance",
      relationship: "the farther you go, the higher the fare climbs steadily",
      realWorld: "predicting any cost with a fixed part plus usage, like a phone plan",
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
      summary: "the longest side of a right triangle from its two shorter sides",
      components: "the two legs and the right angle between them",
      relationship: "the longer the legs, the longer the hypotenuse",
      realWorld: "finding a diagonal distance, like a ladder leaning on a wall",
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
      summary: "recovering a square's side length from its area",
      components: "the area and the fact that all four sides are equal",
      relationship: "the bigger the area, the longer each side",
      realWorld: "working out a room's side from its floor space",
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
      summary: "finding two numbers in a row that multiply to a given value",
      components: "the product and the fact the two numbers differ by exactly one",
      relationship: "as the numbers grow, their product grows much faster",
      realWorld: "reverse-engineering dimensions from an area or a layout",
    },
  },
  {
    id: "factor-quadratic",
    level: "중3",
    topic: "인수분해",
    englishStatement:
      "Solve x² − 5x + 6 = 0. What is the larger of the two solutions?",
    koreanSupport:
      "방정식 x² − 5x + 6 = 0 을 푸세요. 두 해 중 더 큰 값은 얼마일까요?",
    forbiddenAnswerTokens: ["x = 3", "= 3", "is 3", "and 3"],
    coaching: {
      summary: "the values of x that make a quadratic equal zero",
      components: "the equation and the two factors hidden inside it",
      relationship: "if two factors multiply to zero, one of them must be zero",
      realWorld: "finding break-even points in money or motion",
    },
  },
  {
    id: "function-eval",
    level: "중3",
    topic: "함수값",
    englishStatement: "For the function f(x) = 2x + 1, what is f(4)?",
    koreanSupport: "함수 f(x) = 2x + 1 에 대하여, f(4) 의 값은 얼마일까요?",
    forbiddenAnswerTokens: ["= 9", "is 9", "f(4) = 9", "equals 9"],
    coaching: {
      summary: "running an input number through a function rule",
      components: "the input, the rule, and the output it produces",
      relationship: "change the input and the output changes by the rule",
      realWorld: "any 'put a number in, get a result out' machine, like a price calculator",
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
      summary: "when a ball thrown upward comes back down to the ground",
      components: "the height formula, the time, and what 'on the ground' means",
      relationship: "the ball rises, slows, and falls — its height depends on time",
      realWorld: "predicting motion, like a jump, a throw, or a rocket launch",
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
      summary: "how many times you multiply 2 by itself to reach 32",
      components: "the base 2, the unknown power, and the target result",
      relationship: "each extra power doubles the result",
      realWorld: "understanding fast growth, like doubling savings or data",
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
      summary: "how steep a line is between two points",
      components: "the change in x and the change in y between the points",
      relationship: "the faster y climbs per step in x, the steeper the line",
      realWorld: "reading rates off a graph, like speed or a price trend",
    },
  },
  {
    id: "arith-sequence",
    level: "고1",
    topic: "수열",
    englishStatement:
      "An arithmetic sequence starts at 3 and increases by 4 each time. What is the 5th term?",
    koreanSupport:
      "등차수열의 첫째 항이 3이고 매번 4씩 커집니다. 다섯째 항은 얼마일까요?",
    forbiddenAnswerTokens: ["19"],
    coaching: {
      summary: "a sequence that grows by the same amount at every step",
      components: "the first term, the constant step, and which term you want",
      relationship: "the more steps you take, the larger the term becomes",
      realWorld: "predicting steady growth, like a fixed amount saved each month",
    },
  },
  {
    id: "log-base2",
    level: "고1",
    topic: "로그",
    englishStatement: "What is the value of log₂ 8?",
    koreanSupport: "log₂ 8 의 값은 얼마일까요? (2를 몇 번 곱해야 8이 되는지)",
    forbiddenAnswerTokens: ["= 3", "is 3", "equals 3"],
    coaching: {
      summary: "the power that turns 2 into 8",
      components: "the base, the target number, and the unknown exponent",
      relationship: "a logarithm undoes an exponent — it asks 'how many times?'",
      realWorld: "measuring scales that grow by multiplying, like sound or earthquakes",
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
