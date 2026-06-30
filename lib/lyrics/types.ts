// Data model for the chart-lyric vocabulary explorer.
//
// The whole product is bidirectional from ONE engine: the same charting song
// teaches the ENGLISH in it to a Korean fan, and the KOREAN in it to a global
// fan. `Direction` is the single switch.
//
// Licensing guardrail baked into the types: we never carry full lyrics. The
// unit is a WORD or a SHORT phrase (a few words) the fan keeps hearing — never
// a reproduced line. The chart supplies the song *list* (titles are facts); we
// teach the words.

/** "en" = Korean speaker learning the ENGLISH in K-pop. "ko" = global fan learning the KOREAN. */
export type Direction = "en" | "ko";

/** One tappable chip — a single word or short phrase, never a full line. */
export interface WordChip {
  term: string;
  /** Short meaning in the learner's own language. */
  gloss: string;
  kind: "word" | "phrase" | "slang";
  /**
   * The short SUNG fragment that contains `term` verbatim — the bit a fan
   * actually sings ("got me feelin' butterflies"). The recognition trigger.
   * A few words only, NEVER a full line/verse. "" when no natural fragment.
   */
  line: string;
  /**
   * A curiosity-gap hint shown ONLY when the word has a real twist (idiom,
   * slang, hidden/cultural meaning) — makes the fan want to tap WITHOUT
   * revealing the answer ("곤충 얘기가 아니야 👀"). "" for literal/obvious words,
   * which fall back to showing `gloss` on the chip instead.
   */
  teaser: string;
}

/** The notable words for one song — what shows up as chips. */
export interface SongWords {
  song: string;
  artist: string;
  direction: Direction;
  /** One line on how this song uses the target language; "" if the song is unknown. */
  note: string;
  words: WordChip[];
}

/** Another song that uses the same word/phrase — the cross-song recommendation. */
export interface CrossSong {
  title: string;
  artist: string;
  /** How the term shows up there. */
  note: string;
}

export interface WordExample {
  /** A short, natural sentence in the TARGET language a fan could actually say. */
  text: string;
  /** Its meaning in the learner's language. */
  gloss: string;
}

/** The deep card shown when a chip is tapped. */
export interface WordCard {
  term: string;
  /**
   * The HOOK — one surprising/emotional opening line in the learner's language
   * that makes them go "oh!". The reversal or hidden meaning, NOT a definition.
   * This leads the card; the definition comes after.
   */
  hook: string;
  /** Pronunciation / romanization; "" when not useful. */
  reading: string;
  /** Clear meaning in the learner's language. */
  meaning: string;
  /** INTERPRETATION (not asserted fact) of why this word fits the song. */
  why: string;
  /** If slang/trending: what it means + why people use it. "" otherwise. */
  slang: string;
  /** Other well-known songs using the same term. May be empty (never invented). */
  crossSongs: CrossSong[];
  examples: WordExample[];
}

/** One turn in the follow-up chat about a tapped word. */
export interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}
