// Lyrikko · review scheduling (Leitner 5-box) + the 만 14세 age gate.
//
// Pure functions only — the API routes own all I/O. Kept deliberately simple
// for v1 (no SM-2 easiness factors): wrong answers drop straight back to box 1
// and become due immediately, so a learner can retry within the same session;
// correct answers climb one box with a widening interval.
//
// "Mastered" (box ≥ MASTERED_BOX) is the bar later features must reuse — the
// fandom study meter and collectible-card credit count ONLY mastered words,
// which is the anti-grinding rule from the expansion validation research.

import type { ReviewBox } from "@/lib/lyrikko/types";

/** Days until the next review after landing in each box (index = box). */
const BOX_INTERVAL_DAYS: Record<ReviewBox, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
};

/** Words at or above this box count as learned for meters/cards. */
export const MASTERED_BOX: ReviewBox = 4;

export interface ReviewResult {
  box: ReviewBox;
  /** ISO timestamp for next_review_at. */
  nextReviewAt: string;
}

export function applyReview(currentBox: ReviewBox, correct: boolean, now = new Date()): ReviewResult {
  if (!correct) {
    // Back to box 1, due immediately — retry in the same session is fine.
    return { box: 1, nextReviewAt: now.toISOString() };
  }
  const box = Math.min(5, currentBox + 1) as ReviewBox;
  const next = new Date(now);
  next.setDate(next.getDate() + BOX_INTERVAL_DAYS[box]);
  return { box, nextReviewAt: next.toISOString() };
}

/**
 * 만 나이 gate — same comparison as the DB CHECK constraint
 * (birth_date <= current_date - interval '14 years'): the 14th birthday must
 * have arrived. Date-only math so timezones can't shave a day off.
 */
export function isAtLeast14(birthDate: string, today = new Date()): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate.trim());
  if (!m) return false;
  const [, y, mo, d] = m;
  const birth = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  // Reject impossible dates that Date silently rolls over (e.g. 2월 30일).
  if (
    birth.getUTCFullYear() !== Number(y) ||
    birth.getUTCMonth() !== Number(mo) - 1 ||
    birth.getUTCDate() !== Number(d)
  ) {
    return false;
  }
  const cutoff = new Date(Date.UTC(today.getFullYear() - 14, today.getMonth(), today.getDate()));
  return birth <= cutoff;
}
