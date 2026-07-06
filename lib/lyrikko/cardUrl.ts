// Builds the query string for GET /api/lyrikko/card — kept in one place so
// every caller (word book, future "just saved" prompt, etc.) stays in sync
// with what the render route expects.

export interface CardSource {
  direction: "en" | "ko";
  song: string;
  artist: string;
  term: string;
  line: string;
  gloss: string;
  meaning: string;
  box: number;
  /** This word's 1-based position in the learner's OWN collection — never a
   *  cross-user/fandom rank (see the cold-start critique in the expansion
   *  research: no public scale-revealing numbers this early). */
  mine: number;
}

export function cardImageUrl(src: CardSource, format: "card" | "story" = "card"): string {
  const q = new URLSearchParams({
    direction: src.direction,
    song: src.song,
    artist: src.artist,
    term: src.term,
    line: src.line,
    gloss: src.gloss,
    meaning: src.meaning,
    box: String(src.box),
    mine: String(src.mine),
    format,
  });
  return `/api/lyrikko/card?${q.toString()}`;
}
