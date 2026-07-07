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

// ── Deck #2 — K-pop 가사 영어·한국어 수요 검증 프로브 ───────────────────────
// A demand probe, not a feature. It tests one question on Instagram before any
// chart API or lyric licensing is built: do people want "what does the English
// (and Korean) in the song I already love actually mean — and why?"
//
// Two design choices baked into the data, straight from the validation research:
//  1. BIDIRECTIONAL — the same song teaches English to Korean fans AND Korean to
//     the larger, faster-growing global fanbase (Korean = Duolingo's #6 language).
//  2. NO FULL-LYRIC REPRODUCTION — every example is a single word/phrase the fan
//     keeps hearing, never a quoted verse. This is the licensing-safe MVP shape:
//     the chart supplies the song *list* (titles are facts), we teach the words.
const KPOP_LYRICS: Deck = {
  slug: "kpop-lyrics",
  topic: "내가 매일 듣는 K-pop 노래 속 영어(와 한국어), 무슨 뜻이고 왜 썼을까",
  title: "차트 속 가사로, 양방향 영어·한국어",
  channel: "Instagram · 카드뉴스 8컷",
  tagline: "노래로 배우는 영어 · 한국어",
  size: SQUARE,
  cards: [
    {
      template: "cover",
      theme: "dark",
      kicker: "WAIT — WHAT DID THEY JUST SAY?",
      title: "매일 듣는 그 노래 속\n영어, *무슨 뜻인지*\n알고 듣나요?",
      note: "Thebes · 차트 속 가사로 배우는 영어 & 한국어",
    },
    {
      template: "statement",
      kicker: "01 — 교재는 이미 네 플레이리스트에",
      title: "요즘 K-pop의\n*절반은 영어*입니다.",
      body: "2023년 상반기 걸그룹 히트곡의 영어 비중은 41%. (여자)아이들·르세라핌·블랙핑크는 50%를 넘겼습니다. 이미 외운 노래가, 가장 강력한 영어 교재입니다.",
    },
    {
      template: "compare",
      theme: "dark",
      kicker: "02 — 사전이 못 알려주는 것",
      heading: "뜻만 알면\n*절반*만 아는 것.",
      them: {
        label: "사전 · 번역기",
        h: "shy = 수줍은",
        p: "단어 하나의 정의에서 끝. 왜 'super shy'를 두 번 반복했는지, 어떤 느낌인지는 안 알려줍니다.",
      },
      us: {
        label: "이 노래에서는",
        h: "왜 이 단어를 골랐나",
        p: "노래 전체 맥락에서의 의미, 요즘 이 표현이 유행하는 이유, 같은 단어가 쓰인 다른 곡까지.",
      },
    },
    {
      template: "list",
      kicker: "03 — K-pop에 자주 나오는 영어",
      heading: "이 단어들,\n*몇 개*나 정확히 아세요?",
      items: [
        { k: "vibe", en: "분위기·느낌" },
        { k: "drama", en: "극적인 소동" },
        { k: "magnetic", en: "끌어당기는" },
        { k: "savage", en: "거침없는·쎈" },
        { k: "slay", en: "죽여주다" },
        { k: "fire", en: "끝내주는" },
      ],
    },
    {
      template: "statement",
      kicker: "04 — '왜 이 단어'의 예",
      title: "왜 그렇게\n*drama*를 외칠까?",
      body: "그냥 '소동'이 아니라, 자기 서사를 무대처럼 극화하는 K-pop 특유의 자신감 표현입니다. 단어 뒤의 의도까지 — 이게 사전과의 차이입니다. (해석 · 인터뷰·맥락 근거)",
    },
    {
      template: "statement",
      theme: "dark",
      kicker: "05 — 반대로도 흐릅니다",
      title: "전 세계는 K-pop으로\n*한국어*를 배웁니다.",
      body: "Duolingo에서 한국어는 6번째로 많이 배우는 언어(1,740만 명). 같은 노래 한 곡이, 한국 팬에겐 영어 교재, 해외 팬에겐 한국어 교재가 됩니다.",
    },
    {
      template: "list",
      kicker: "06 — 해외 팬이 매일 만나는 한국어",
      heading: "K-pop 속 한국어,\n*양방향*으로.",
      items: [
        { k: "대박", en: "daebak" },
        { k: "화이팅", en: "hwaiting" },
        { k: "미쳤다", en: "michyeotda" },
        { k: "진짜", en: "jinjja" },
        { k: "오빠", en: "oppa" },
        { k: "사랑해", en: "saranghae" },
      ],
    },
    {
      template: "cta",
      theme: "dark",
      kicker: "30초, 영어와 한국어",
      title: "다음에 들을 노래,\n*뜻까지* 듣기.",
      sub: "좋아하는 차트 곡을 고르면 → 그 속 영어·한국어를 30초에.\n관심 있으면 저장하고, DM으로 '노래' 한 마디만 보내주세요.",
      url: "thebes.ai",
      handle: "@thebes.ai",
      pill: "이 노래로 배우기 →",
    },
  ],
};

export const DECKS: Deck[] = [KPOP_LYRICS, MANIFESTO];

export function getDeck(slug: string): Deck | undefined {
  return DECKS.find((d) => d.slug === slug);
}
