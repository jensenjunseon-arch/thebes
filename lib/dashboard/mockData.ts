// Mock data for the parent dashboard when Supabase is not configured.
// Represents a student who has been using Thebes for 4 weeks.
// Shape matches the live query outputs in lib/supabase/queries.ts.

import type { ConstructId } from "@/lib/constructs";
import type { WeekBucket, EvidenceRow } from "@/lib/supabase/queries";

// A believable progression: redefine and english improve fastest;
// relevance and decompose are harder to move and lag behind.
export const MOCK_WEEKLY_SCORES: WeekBucket[] = [
  {
    weekLabel: "4/28–5/4",
    weekStart: "2026-04-28",
    scores: { redefine: 3, decompose: 2, relate: 1, relevance: 1, transfer: 3, english: 4 },
  },
  {
    weekLabel: "5/5–5/11",
    weekStart: "2026-05-05",
    scores: { redefine: 5, decompose: 4, relate: 2, relevance: 2, transfer: 4, english: 5 },
  },
  {
    weekLabel: "5/12–5/18",
    weekStart: "2026-05-12",
    scores: { redefine: 6, decompose: 5, relate: 3, relevance: 3, transfer: 6, english: 7 },
  },
  {
    weekLabel: "5/19–5/25",
    weekStart: "2026-05-19",
    scores: { redefine: 8, decompose: 6, relate: 4, relevance: 4, transfer: 7, english: 9 },
  },
];

// Current-week totals (sum of last two buckets to simulate a building week).
export const MOCK_CURRENT_TOTALS: Record<ConstructId, number> = {
  redefine: 22,
  decompose: 17,
  relate: 10,
  relevance: 10,
  transfer: 20,
  english: 25,
};

export const MOCK_PREV_TOTALS: Record<ConstructId, number> = {
  redefine: 14,
  decompose: 11,
  relate: 6,
  relevance: 6,
  transfer: 13,
  english: 16,
};

export const MOCK_EVIDENCE: EvidenceRow[] = [
  {
    construct: "decompose",
    quote:
      "The things that matter here are the two speeds, the distance, and the total time.",
    rationale:
      "Student pulled out the key components of the situation on their own.",
    createdAt: "2026-05-25T14:30:00Z",
  },
  {
    construct: "redefine",
    quote:
      "It's basically about a trip where the car goes one speed there and a slower speed back.",
    rationale:
      "Student restated the situation in their own words, not the textbook's.",
    createdAt: "2026-05-25T14:27:00Z",
  },
  {
    construct: "relate",
    quote:
      "When the car drives slower on the way back, that part takes more time.",
    rationale: "Student connected how one quantity affects another.",
    createdAt: "2026-05-25T14:35:00Z",
  },
  {
    construct: "relevance",
    quote:
      "This would help me plan when to leave so I'm not late, even if traffic changes.",
    rationale: "Student connected the idea to a real decision in their own life.",
    createdAt: "2026-05-22T15:10:00Z",
  },
];

export const MOCK_SESSION_COUNT = 7;
export const MOCK_TURN_COUNT = 62;
