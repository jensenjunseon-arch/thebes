// Typed query helpers for server-side use (service_role bypasses RLS).
// Always import createClient from @/lib/supabase/server here.

import { createClient } from "@/lib/supabase/server";
import type { DbSession, DbTurn, DbScore, DbProblem } from "@/types/db";
import type { StepId } from "@/lib/steps";
import type { ConstructId } from "@/lib/constructs";
import type { ScorerOutput } from "@/lib/ai/scorer";

// ── PROBLEMS ────────────────────────────────────────────────────────────────

export async function getProblemById(
  id: string,
): Promise<DbProblem | null> {
  const client = await createClient();
  const { data } = await client
    .from("problems")
    .select("*")
    .eq("id", id)
    .single();
  return data as DbProblem | null;
}

// ── SESSIONS ────────────────────────────────────────────────────────────────

export async function createSession(problemId: string): Promise<DbSession> {
  const client = await createClient();
  const { data, error } = await client
    .from("sessions")
    .insert({ problem_id: problemId })
    .select()
    .single();
  if (error) throw error;
  return data as DbSession;
}

export async function getSessionById(
  sessionId: string,
): Promise<DbSession | null> {
  const client = await createClient();
  const { data } = await client
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();
  return data as DbSession | null;
}

export async function advanceSession(
  sessionId: string,
  step: StepId,
): Promise<void> {
  const client = await createClient();
  const newStep = Math.min(4, step + 1) as StepId;
  await client
    .from("sessions")
    .update({ active_step: newStep })
    .eq("id", sessionId);
}

export async function completeSession(sessionId: string): Promise<void> {
  const client = await createClient();
  await client
    .from("sessions")
    .update({ status: "completed", ended_at: new Date().toISOString() })
    .eq("id", sessionId);
}

// ── TURNS ───────────────────────────────────────────────────────────────────

export async function getSessionTurns(
  sessionId: string,
): Promise<DbTurn[]> {
  const client = await createClient();
  const { data, error } = await client
    .from("turns")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DbTurn[];
}

export async function insertTurn(turn: {
  id: string;
  session_id: string;
  step: StepId;
  speaker: "ai" | "student";
  content: string;
}): Promise<void> {
  const client = await createClient();
  const { error } = await client.from("turns").insert(turn);
  if (error) throw error;
}

// ── SCORES ──────────────────────────────────────────────────────────────────

// One insertScores call per student turn: expands construct_deltas into rows.
export async function insertScores(
  turnId: string,
  scorer: ScorerOutput,
): Promise<void> {
  const client = await createClient();
  const rows = (
    Object.entries(scorer.construct_deltas) as [ConstructId, number][]
  )
    .filter(([, delta]) => delta !== 0)
    .map(([construct, delta]) => ({
      turn_id: turnId,
      construct,
      delta,
      evidence_quote: scorer.evidence_quote,
      rationale: scorer.rationale,
      confidence: scorer.confidence,
    }));

  if (rows.length === 0) return;

  const { error } = await client.from("scores").insert(rows);
  if (error) throw error;
}

export interface WeekBucket {
  weekLabel: string; // e.g. "5/5 – 5/11"
  weekStart: string; // ISO date
  scores: Record<ConstructId, number>;
}

// Weekly aggregated totals for the past `weeks` weeks, newest last.
// Fetches all raw score rows and bucketes them in JS — simple for MVP scale.
export async function getWeeklyScores(
  studentId: string,
  weeks = 4,
): Promise<WeekBucket[]> {
  const client = await createClient();

  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);

  const { data } = await client
    .from("scores")
    .select(
      "construct, delta, created_at, turns!inner(session_id, sessions!inner(student_id))",
    )
    .eq("turns.sessions.student_id", studentId)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  const rows = (data ?? []) as Array<{
    construct: ConstructId;
    delta: number;
    created_at: string;
  }>;

  // Build week buckets (Mon→Sun).
  const buckets: Map<string, Record<ConstructId, number>> = new Map();
  const CONSTRUCTS: ConstructId[] = [
    "redefine", "assume", "paths", "verify", "logic", "english",
  ];

  for (const row of rows) {
    const d = new Date(row.created_at);
    // Align to Monday.
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((day + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const key = monday.toISOString().slice(0, 10);

    if (!buckets.has(key)) {
      buckets.set(key, Object.fromEntries(CONSTRUCTS.map((c) => [c, 0])) as Record<ConstructId, number>);
    }
    const bucket = buckets.get(key)!;
    bucket[row.construct] = (bucket[row.construct] ?? 0) + row.delta;
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, scores]) => {
      const start = new Date(weekStart);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
      return { weekLabel: `${fmt(start)}–${fmt(end)}`, weekStart, scores };
    });
}

// Recent evidence quotes with construct and date.
export interface EvidenceRow {
  construct: ConstructId;
  quote: string;
  rationale: string;
  createdAt: string;
}

export async function getRecentEvidence(
  studentId: string,
  limit = 5,
): Promise<EvidenceRow[]> {
  const client = await createClient();

  const { data } = await client
    .from("scores")
    .select(
      "construct, evidence_quote, rationale, created_at, turns!inner(session_id, sessions!inner(student_id))",
    )
    .eq("turns.sessions.student_id", studentId)
    .not("evidence_quote", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  return ((data ?? []) as Array<{
    construct: ConstructId;
    evidence_quote: string;
    rationale: string;
    created_at: string;
  }>).map((r) => ({
    construct: r.construct,
    quote: r.evidence_quote,
    rationale: r.rationale,
    createdAt: r.created_at,
  }));
}

// Aggregate construct totals for a student across a date range.
export async function getConstructTotals(
  studentId: string,
  since: Date,
): Promise<Record<ConstructId, number>> {
  const client = await createClient();
  const { data } = await client
    .from("scores")
    .select("construct, delta, turns!inner(session_id, sessions!inner(student_id))")
    .eq("turns.sessions.student_id", studentId)
    .gte("created_at", since.toISOString());

  const totals: Record<string, number> = {};
  for (const row of data ?? []) {
    const r = row as { construct: string; delta: number };
    totals[r.construct] = (totals[r.construct] ?? 0) + r.delta;
  }
  return totals as Record<ConstructId, number>;
}
