// Hand-written DB types derived from supabase/migrations/..._initial_schema.sql.
// Replace this file with `supabase gen types typescript` output once a project
// is provisioned — the shape should be identical.

import type { ConstructId } from "@/lib/constructs";
import type { StepId } from "@/lib/steps";

export type UserRole = "student" | "parent";
export type LinkStatus = "active" | "inactive";
export type SessionStatus = "active" | "completed" | "abandoned";
export type Speaker = "ai" | "student";

export interface DbUser {
  id: string;
  auth_id: string | null;
  role: UserRole;
  email: string;
  name: string | null;
  created_at: string;
}

export interface DbLink {
  id: string;
  parent_id: string;
  student_id: string;
  status: LinkStatus;
  created_at: string;
}

export interface DbDiagnostic {
  id: string;
  student_id: string;
  english_level: string;
  baseline_scores: Record<ConstructId, number>;
  created_at: string;
}

export interface DbProblem {
  id: string;
  topic: string;
  difficulty: string;
  statement_en: string;
  statement_ko: string | null;
  canonical_solution: string | null;
  forbidden_answer_tokens: string[];
  created_at: string;
}

export interface DbSession {
  id: string;
  student_id: string | null;
  problem_id: string;
  active_step: StepId;
  status: SessionStatus;
  started_at: string;
  ended_at: string | null;
}

export interface DbTurn {
  id: string;
  session_id: string;
  step: StepId;
  speaker: Speaker;
  content: string;
  created_at: string;
}

export interface DbScore {
  id: string;
  turn_id: string;
  construct: ConstructId;
  delta: number;
  evidence_quote: string | null;
  rationale: string | null;
  confidence: number | null;
  created_at: string;
}

export interface DbReport {
  id: string;
  student_id: string;
  period_start: string;
  period_end: string;
  payload_json: ReportPayload;
  created_at: string;
}

// Weekly report payload. Inlined here to keep types co-located.
export interface ReportPayload {
  scores: Record<ConstructId, { total: number; delta_wk: number }>;
  evidence_quotes: Array<{
    construct: ConstructId;
    quote: string;
    rationale: string;
    session_id: string;
    ts: string;
  }>;
  sessions_completed: number;
  turns_total: number;
}
