// Mock data for the parent dashboard when Supabase is not configured.
// Represents a student who has been using Thebes for 4 weeks.
// Shape matches the live query outputs in lib/supabase/queries.ts.

import type { ConstructId } from "@/lib/constructs";
import type { WeekBucket, EvidenceRow } from "@/lib/supabase/queries";

// A believable progression: redefine and english improve fastest;
// verify and paths are harder to move and lag behind.
export const MOCK_WEEKLY_SCORES: WeekBucket[] = [
  {
    weekLabel: "4/28–5/4",
    weekStart: "2026-04-28",
    scores: { redefine: 3, assume: 2, paths: 1, verify: 1, logic: 3, english: 4 },
  },
  {
    weekLabel: "5/5–5/11",
    weekStart: "2026-05-05",
    scores: { redefine: 5, assume: 4, paths: 2, verify: 2, logic: 4, english: 5 },
  },
  {
    weekLabel: "5/12–5/18",
    weekStart: "2026-05-12",
    scores: { redefine: 6, assume: 5, paths: 3, verify: 3, logic: 6, english: 7 },
  },
  {
    weekLabel: "5/19–5/25",
    weekStart: "2026-05-19",
    scores: { redefine: 8, assume: 6, paths: 4, verify: 4, logic: 7, english: 9 },
  },
];

// Current-week totals (sum of last two buckets to simulate a building week).
export const MOCK_CURRENT_TOTALS: Record<ConstructId, number> = {
  redefine: 22,
  assume: 17,
  paths: 10,
  verify: 10,
  logic: 20,
  english: 25,
};

export const MOCK_PREV_TOTALS: Record<ConstructId, number> = {
  redefine: 14,
  assume: 11,
  paths: 6,
  verify: 6,
  logic: 13,
  english: 16,
};

export const MOCK_EVIDENCE: EvidenceRow[] = [
  {
    construct: "assume",
    quote:
      "I'm assuming the one-way distance is the same in both directions — call it d.",
    rationale:
      "Student named an unstated assumption and assigned a variable to it.",
    createdAt: "2026-05-25T14:30:00Z",
  },
  {
    construct: "redefine",
    quote:
      "So I need to find an average that takes time into account, not just average the two speeds.",
    rationale:
      "Student recognized that a simple arithmetic mean would be wrong here.",
    createdAt: "2026-05-25T14:27:00Z",
  },
  {
    construct: "logic",
    quote:
      "Total distance is 2d and total time is d/40 plus d/60, so I can factor out d.",
    rationale: "Each arithmetic step was explicitly justified — no leap.",
    createdAt: "2026-05-25T14:35:00Z",
  },
  {
    construct: "verify",
    quote:
      "If the speeds were equal, say both 50, I'd get exactly 50 back — that checks out.",
    rationale: "Student tested the formula against a known edge case.",
    createdAt: "2026-05-22T15:10:00Z",
  },
];

export const MOCK_SESSION_COUNT = 7;
export const MOCK_TURN_COUNT = 62;
