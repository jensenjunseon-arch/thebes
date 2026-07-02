// Data model for Lyrikko's personal word book (단어장) — the persistent layer
// on top of the /lyrics wow-loop's word cards. Mirrors
// supabase/migrations/20260702000000_lyrikko_wordbook.sql — keep in sync.
//
// A saved word is a point-in-time SNAPSHOT (song/term/gloss/meaning at save
// time), not a live re-fetch, so a learner's book stays stable even if the AI
// explanation logic changes later.
//
// Draft status: these types cover the data shape only. Signup/consent
// enforcement, the review-scheduling algorithm's actual advance/lapse logic,
// and the save/review API routes are NOT yet designed — see the migration's
// comments for what's deferred and why.

import type { Direction } from "@/lib/lyrics/types";

/** One Lyrikko signup — the 14+ age gate lives in the DB as a CHECK constraint. */
export interface LyrikkoProfile {
  userId: string;
  nickname: string | null;
  /** ISO date (YYYY-MM-DD). */
  birthDate: string;
  ageVerified: boolean;
  marketingOptIn: boolean;
  /** Separate consent for pushes sent 21:00–08:00 — 정보통신망법 제50조③. */
  nightPushOptIn: boolean;
  consentAt: string;
}

/** Leitner box 1–5 — the v1 spaced-repetition scheme (simple, not SM-2). */
export type ReviewBox = 1 | 2 | 3 | 4 | 5;

/** One entry in a learner's personal word book — a saved word from a song. */
export interface SavedWord {
  id: string;
  userId: string;
  direction: Direction;
  song: string;
  artist: string;
  term: string;
  /** The sung fragment the word came from — ≤9 words, never a full line. */
  line: string;
  gloss: string;
  meaning: string;
  box: ReviewBox;
  reviewCount: number;
  nextReviewAt: string;
  lastReviewedAt: string | null;
  createdAt: string;
}
