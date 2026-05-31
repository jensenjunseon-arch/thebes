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
    id: "elem-low-weight",
    level: "초등 저학년",
    topic: "무게",
    englishStatement:
      "A melon weighs 2 kg. A watermelon is 3 times as heavy as the melon. How heavy is the watermelon?",
    koreanSupport:
      "멜론 한 개의 무게는 2kg이에요. 수박은 멜론보다 3배 무거워요. 수박의 무게는 몇 kg일까요?",
    forbiddenAnswerTokens: ["6 kg", "6kg", "6 kilograms", "= 6", "is 6"],
    coaching: {
      restateFrame: "The melon is ___ kg, and the watermelon is ___ times heavier.",
      keyAssumption: "'3 times as heavy' means you multiply, not add 3.",
      approaches: ["add the melon's 2 kg three times", "multiply the melon's weight by 3"],
      verifyHint: "three melons together should weigh the same as your watermelon.",
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
      restateFrame: "I pay ___ won, and the pencil costs ___ won.",
      keyAssumption: "the change is what's left of your money after paying.",
      approaches: ["count up from 700 until you reach 1,000", "subtract the price from what you paid"],
      verifyHint: "your change plus 700 should add back to 1,000.",
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
      restateFrame: "It starts at ___ and runs for ___ hours.",
      keyAssumption: "the practice runs straight through with no break.",
      approaches: ["count forward 2 hours on a clock", "add the hours onto the start time"],
      verifyHint: "from your finish time, going back 2 hours should land on 3 o'clock.",
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
      restateFrame: "Red is ___ cm, blue is ___ cm, and I compare them.",
      keyAssumption: "'how much longer' means the difference between the two lengths.",
      approaches: ["line them up and look at the extra part", "subtract the shorter length from the longer"],
      verifyHint: "add your answer to the blue ribbon — it should match the red one.",
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
      restateFrame: "Each bottle holds ___ liters, and there are ___ bottles.",
      keyAssumption: "every bottle holds the same amount of water.",
      approaches: ["add 2 liters four times", "multiply the bottles by the liters in each"],
      verifyHint: "fill the bottles one at a time and count — you should reach the same total.",
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
      restateFrame: "There are ___ strawberries split evenly onto ___ plates.",
      keyAssumption: "each plate gets the same number, with none left over.",
      approaches: ["deal them out one plate at a time", "divide the total by the number of plates"],
      verifyHint: "multiply your answer by the 3 plates — you should get back to 12.",
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
      restateFrame: "The rectangle is ___ wide and ___ tall, and I want its ___.",
      keyAssumption: "area means the space inside, not the distance around it.",
      approaches: ["count the 1-cm squares row by row", "multiply the width by the height"],
      verifyHint: "your area should be bigger than either side on its own.",
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
      restateFrame: "There are ___ shirts and ___ pairs of pants, and each outfit is one of each.",
      keyAssumption: "any shirt can be worn with any pair of pants.",
      approaches: ["list every shirt-and-pants pair", "multiply the number of shirts by the pants"],
      verifyHint: "one shirt makes 2 outfits — and there are 3 shirts.",
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
      restateFrame: "It starts at ___ and runs for ___ minutes.",
      keyAssumption: "90 minutes is the same as 1 hour and 30 minutes.",
      approaches: ["add 1 hour first, then 30 more minutes", "turn 90 minutes into hours and minutes"],
      verifyHint: "from your end time, going back 90 minutes should reach 2:30.",
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
      restateFrame: "Two angles are ___ and ___, and the three must add to a fixed total.",
      keyAssumption: "the three angles of any triangle always add up to 180°.",
      approaches: ["add the two known angles, then take that from 180", "subtract each known angle from 180 one at a time"],
      verifyHint: "all three angles together should make exactly 180°.",
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
      restateFrame: "It starts at ___ degrees and goes up by ___ degrees.",
      keyAssumption: "'rose by 8' means add 8 — even though we start below zero.",
      approaches: ["count up 8 steps from −3 on a number line", "add 8 to negative 3"],
      verifyHint: "your answer should be warmer (higher) than −3.",
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
      restateFrame: "There are ___ red out of ___ marbles in total.",
      keyAssumption: "every marble is equally likely to be drawn.",
      approaches: ["put favorable outcomes over total outcomes", "write red-to-total as a fraction"],
      verifyHint: "the chance of red and the chance of blue should add up to one whole.",
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
      restateFrame: "There's a fixed ___ won, plus ___ won for every km, over ___ km.",
      keyAssumption: "the per-km charge applies to each kilometer equally.",
      approaches: ["find the distance cost, then add the base fare", "write it as 3000 + 1000 × distance"],
      verifyHint: "at 0 km the fare should be just the 3,000 base — does your method give that?",
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
      restateFrame: "I need the x-values that make ___ equal zero, then the bigger one.",
      keyAssumption: "if two factors multiply to zero, at least one of them is zero.",
      approaches: ["factor it into two brackets", "find two numbers that multiply to 6 and add to 5"],
      verifyHint: "put your solution back into x² − 5x + 6 — it should give 0.",
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
      restateFrame: "I replace x with ___ in the rule ___.",
      keyAssumption: "f(4) means put 4 everywhere x appears.",
      approaches: ["substitute 4 for x and compute", "build a small table of x and f(x)"],
      verifyHint: "watch the order — multiply by 2 first, then add 1.",
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
      restateFrame: "The sequence begins at ___ and grows by ___ each step.",
      keyAssumption: "the same amount is added at every step (a constant difference).",
      approaches: ["list the terms one by one", "use first term plus the number of steps times the difference"],
      verifyHint: "from the 1st term to the 5th is 4 steps, not 5 — count the gaps.",
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
      restateFrame: "I'm asking: 2 to what power gives ___?",
      keyAssumption: "a logarithm asks for the exponent, not the final number.",
      approaches: ["write 8 as a power of 2", "keep multiplying 2 and count the steps to reach 8"],
      verifyHint: "raise 2 to your answer — you should land on 8.",
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
