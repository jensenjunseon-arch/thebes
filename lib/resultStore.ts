// v0 result persistence — localStorage only (no backend, no login required).
// This captures the diagnostic result so it isn't lost, powers a "see your last
// report" retention hook, and is the first step of the signup funnel. When
// Supabase is re-migrated for the new construct enum, saving on signup becomes a
// small additional write keyed on the same shape.

import type { ConstructId } from "@/lib/constructs";
import type { Coaching } from "@/lib/problems";
import type { EvidenceByConstruct } from "@/components/session/DiagnosticResult";

export interface DiagnosticRecord {
  at: number; // epoch ms
  topic: string;
  level: string;
  totals: Record<ConstructId, number>;
  evidence: EvidenceByConstruct;
  coaching: Coaching; // kept so the English recap works from a saved result
}

const KEY = "thebes.results.v1";
const MAX = 20;

export function getAllResults(): DiagnosticRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as DiagnosticRecord[];
  } catch {
    return [];
  }
}

export function getLatestResult(): DiagnosticRecord | null {
  return getAllResults()[0] ?? null;
}

export function saveResult(record: DiagnosticRecord): void {
  if (typeof window === "undefined") return;
  try {
    const all = [record, ...getAllResults()].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // storage full / disabled — non-fatal; the in-session result still shows.
  }
}
