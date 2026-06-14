import type { Deck } from "./types";
import { SQUARE } from "./types";

// ── Deck #1 — the flagship manifesto ──────────────────────────────────────
// Topic in → full card-news out. This is the shape an LLM would later emit
// from a single headline; for set #1 it's hand-authored from the brand voice
// in app/page.tsx and docs/status-and-review.md.
const MANIFESTO: Deck = {
  slug: "manifesto",
  topic: "AI가 답을 다 내주는 시대, 학원은 무엇을 가르치나",
  title: "답은 공짜다 — 사고를 가르친다",
  channel: "Instagram · 카드뉴스 8컷",
  size: SQUARE,
  cards: [
    {
      template: "cover",
      theme: "dark",
      kicker: "THE ANSWER IS FREE",
      title: "AI가 답을 다 내주는 시대,\n학원은 무엇을\n*가르치고 있나요?*",
      note: "Thebes AI · AI 시대의 사고력 코치",
    },
    {
      template: "statement",
      kicker: "01 — 답",
      title: "답은 이제\n*공짜*입니다.",
      body: "ChatGPT에게 물으면 5초 만에 풀이가 나옵니다. 더 빨리, 더 많이 푸는 능력 — 그건 이제 AI가 가장 잘하는 일입니다.",
    },
    {
      template: "compare",
      theme: "dark",
      kicker: "02 — 가치의 이동",
      heading: "그래서 가치가\n옮겨갔습니다.",
      them: {
        label: "대부분의 교육이 하는 일",
        h: "더 빨리, 더 많이 푼다",
        p: "수능 날 더 많이, 더 빠르게, 실수 없이. 그런데 그건 AI가 5초에 해내는 일입니다.",
      },
      us: {
        label: "Thebes AI가 하는 일",
        h: "AI 네이티브처럼 생각하는 법을 가르친다",
        p: "좋은 질문을 던지고 답을 검증하는 힘. 수학이 가장 정직한 훈련 방법입니다.",
      },
    },
    {
      template: "statement",
      kicker: "03 — 왜 영어인가",
      title: "AI는 속으로\n*영어로 사고*합니다.",
      body: "한국어로 물어도 AI는 속으론 영어로 바꿔 생각합니다. 영어로 사고하는 아이가, AI를 가장 정확히 부립니다.",
    },
    {
      template: "process",
      kicker: "HOW IT WORKS · 사고를 넓히는 5단계",
      heading: "답을 구하지 않습니다.\n생각을 *넓혀갑니다.*",
      steps: ["재정의", "구성요소 분해", "관계 파악", "실생활 연결", "확장적 사고"],
      foot: "AI 코치와 영어 대화로, 한 단계씩.",
    },
    {
      template: "list",
      kicker: "WHAT WE MEASURE",
      heading: "모호한 '사고력'을\n*6가지*로 측정합니다.",
      items: [
        { k: "재정의", en: "Reframe" },
        { k: "구성요소 분해", en: "Decompose" },
        { k: "관계 파악", en: "Relate" },
        { k: "실생활 연결", en: "Connect" },
        { k: "확장적 사고", en: "Extend" },
        { k: "영어 추론 표현력", en: "Express" },
      ],
    },
    {
      template: "report",
      kicker: "AI 인재 리포트",
      heading: "점수표가 아니라,\n*진단 리포트*입니다.",
      bars: [
        { k: "재정의", v: 4.3 },
        { k: "구성요소 분해", v: 3.8 },
        { k: "관계 파악", v: 4.0 },
        { k: "실생활 연결", v: 3.6 },
        { k: "확장적 사고", v: 4.5 },
        { k: "영어 추론 표현력", v: 3.9 },
      ],
      foot: "모호한 칭찬이 아니라, 측정된 성장으로.",
    },
    {
      template: "cta",
      theme: "dark",
      kicker: "무료 사고력 진단",
      title: "우리 아이의\n*첫 문제*부터.",
      sub: "무료 진단 → 학부모 리포트 1부 → 월 구독.\n한 학원비의 일부 가격으로, 두 학원이 못 가르치는 것을.",
      url: "thebes.ai",
      handle: "@thebes.ai",
    },
  ],
};

export const DECKS: Deck[] = [MANIFESTO];

export function getDeck(slug: string): Deck | undefined {
  return DECKS.find((d) => d.slug === slug);
}
