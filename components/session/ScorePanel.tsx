"use client";

import { CONSTRUCTS, type ConstructId } from "@/lib/constructs";
import { cn } from "@/lib/cn";

export type ScoreTotals = Record<ConstructId, number>;

export const EMPTY_TOTALS: ScoreTotals = {
  redefine: 0,
  assume: 0,
  paths: 0,
  verify: 0,
  logic: 0,
  english: 0,
};

export interface RecentEvidence {
  quote: string;
  rationale: string;
}

interface Props {
  totals: ScoreTotals;
  lastDeltas: ScoreTotals | null;
  recentEvidence: RecentEvidence | null;
}

// Live per-session view of the 6 constructs. This is NOT the parent report —
// the parent gets a weekly aggregate. But the same numbers feed it, so what
// the student sees here is the raw signal under the report.
//
// 20 is a v0 placeholder ceiling: roughly the most a student can accrue on
// one construct in a single 20-minute session if every turn earns max delta.
// Replace with a calibrated value once we have real session data.
const SESSION_MAX = 20;

export function ScorePanel({ totals, lastDeltas, recentEvidence }: Props) {
  return (
    <div className="rounded-3xl border border-ink/10 bg-paper-2 p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-kr text-lg font-semibold">
          사고력 · 이번 세션
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-tighter2 text-ink/40">
          live · 6 constructs
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CONSTRUCTS.map((c) => (
          <ConstructTile
            key={c.id}
            id={c.id}
            koreanName={c.koreanName}
            englishName={c.englishName}
            total={totals[c.id] ?? 0}
            delta={lastDeltas?.[c.id] ?? 0}
          />
        ))}
      </div>

      {recentEvidence ? (
        <div className="mt-5 border-t border-ink/10 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-tighter2 text-ink/40">
            evidence · most recent turn
          </p>
          <blockquote className="mt-2 border-l-2 border-accent pl-3 font-serif text-ink/80">
            “{recentEvidence.quote}”
          </blockquote>
          <p className="mt-1 text-xs text-ink/55">
            {recentEvidence.rationale}
          </p>
        </div>
      ) : (
        <p className="mt-5 border-t border-ink/10 pt-4 font-mono text-[10px] uppercase tracking-tighter2 text-ink/40">
          첫 발화를 하면 점수가 움직입니다
        </p>
      )}
    </div>
  );
}

interface TileProps {
  id: ConstructId;
  koreanName: string;
  englishName: string;
  total: number;
  delta: number;
}

function ConstructTile({ koreanName, englishName, total, delta }: TileProps) {
  const clamped = Math.max(0, Math.min(SESSION_MAX, total));
  const pct = (clamped / SESSION_MAX) * 100;

  return (
    <div className="rounded-2xl border border-ink/10 bg-paper p-3">
      <div className="flex items-baseline justify-between">
        <p className="font-kr text-sm font-medium">{koreanName}</p>
        <div className="flex items-baseline gap-2">
          {delta !== 0 && (
            <span
              className={cn(
                "font-mono text-[10px] uppercase tracking-tighter2",
                delta > 0 ? "text-accent" : "text-ink/40",
              )}
            >
              {delta > 0 ? "+" : ""}
              {delta}
            </span>
          )}
          <span className="font-mono text-sm">{total}</span>
        </div>
      </div>
      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-tighter2 text-ink/35">
        {englishName}
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full bg-accent transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
