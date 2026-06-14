// Card-news data model.
//
// A "deck" is one 카드뉴스 set: an ordered list of cards plus metadata. Each
// card is PURE DATA — no JSX — so a deck can be authored by hand today and,
// later, emitted verbatim by an LLM from a single topic line. The renderer
// (components/cardnews/CardNewsCard.tsx) turns this data into the on-brand
// 1080×1080 artwork.
//
// Rich text convention (interpreted by the renderer, kept out of the data):
//   "\n"      → line break
//   "*word*"  → brand accent emphasis (terracotta + soft underline)
// Keeping these as plain string markers — rather than JSX — is what lets the
// whole deck stay serialisable and machine-writable.

export type Theme = "paper" | "dark";

/** Canvas dimensions in CSS px. Square (1080) is the safe 카드뉴스 default. */
export interface CardSize {
  w: number;
  h: number;
}

interface CardBase {
  /** Optional per-card theme override; falls back to the template default. */
  theme?: Theme;
}

/** Opening card — the scroll-stopping hook. */
export interface CoverCard extends CardBase {
  template: "cover";
  /** Mono Latin kicker, e.g. "THE ANSWER IS FREE". */
  kicker?: string;
  /** Big headline. Supports \n and *emphasis*. */
  title: string;
  /** Small supporting line under the headline. */
  note?: string;
}

/** A single big assertion with an optional body paragraph. */
export interface StatementCard extends CardBase {
  template: "statement";
  kicker?: string;
  title: string;
  body?: string;
}

/** Side-by-side "them vs us" — the brand's counter motif. */
export interface CompareCard extends CardBase {
  template: "compare";
  kicker?: string;
  heading: string;
  them: { label: string; h: string; p: string };
  us: { label: string; h: string; p: string };
}

/** A numbered/sequential process (the widening arc). */
export interface ProcessCard extends CardBase {
  template: "process";
  kicker?: string;
  heading: string;
  steps: string[];
  foot?: string;
}

/** A numbered list (the 6 thinking constructs). */
export interface ListCard extends CardBase {
  template: "list";
  kicker?: string;
  heading: string;
  items: { k: string; en?: string }[];
}

/** A measured report — horizontal bars (the AI 인재 리포트). */
export interface ReportCard extends CardBase {
  template: "report";
  kicker?: string;
  heading: string;
  /** value is on a 0–5 scale. */
  bars: { k: string; v: number }[];
  foot?: string;
}

/** Closing call-to-action. */
export interface CtaCard extends CardBase {
  template: "cta";
  kicker?: string;
  title: string;
  sub?: string;
  /** Bare domain, e.g. "thebes.ai". */
  url: string;
  /** Social handle, e.g. "@thebes.ai". */
  handle?: string;
}

export type Card =
  | CoverCard
  | StatementCard
  | CompareCard
  | ProcessCard
  | ListCard
  | ReportCard
  | CtaCard;

export interface Deck {
  /** URL slug, e.g. "manifesto". */
  slug: string;
  /** The one-line topic this deck was generated from (the automation's input). */
  topic: string;
  /** Internal/admin label shown in the gallery. */
  title: string;
  /** Where it's meant to be posted, for the gallery caption. */
  channel?: string;
  size: CardSize;
  cards: Card[];
}

/** The universal 카드뉴스 canvas: 1:1, 1080×1080. */
export const SQUARE: CardSize = { w: 1080, h: 1080 };
