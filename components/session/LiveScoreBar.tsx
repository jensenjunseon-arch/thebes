"use client";

import { useState } from "react";
import { CONSTRUCTS, type ConstructId } from "@/lib/constructs";
import { cn } from "@/lib/cn";

export type ScoreTotals = Record<ConstructId, number>;

// Session ceiling per construct — see ScorePanel note. v0 placeholder.
const SESSION_MAX = 20;

interface Props {
  totals: ScoreTotals;
  lastDeltas: ScoreTotals | null;
}

// Slim, mobile-first live score. Collapsed by default so it never dominates
// the session flow; the full 6-construct breakdown lives in the result screen.
export function LiveScoreBar({ totals, lastDeltas }: Props) {
  const [open, setOpen] = useState(false);
  const movedConstructs = CONSTRUCTS.filter((c) => (lastDeltas?.[c.id] ?? 0) > 0);

  return (
    <div className="rounded-2xl border border-ink/10 bg-paper-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3"
      >
        <span className="font-kr text-sm font-semibold text-ink">사고력</span>

        {/* 6 mini segments */}
        <span className="flex flex-1 items-center justify-center gap-1.5">
          {CONSTRUCTS.map((c) => {
            const pct = Math.min(100, ((totals[c.id] ?? 0) / SESSION_MAX) * 100);
            const moved = (lastDeltas?.[c.id] ?? 0) > 0;
            return (
              <span
                key={c.id}
                className="relative h-1.5 w-6 overflow-hidden rounded-full bg-ink/10"
              >
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                    moved ? "bg-accent" : "bg-ink/40",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </span>
            );
          })}
        </span>

        <span className="font-mono text-[11px] uppercase tracking-tighter2 text-ink/40">
          {open ? "닫기" : movedConstructs.length > 0 ? `+${movedConstructs.length}` : "보기"}
        </span>
      </button>

      {open && (
        <div className="grid grid-cols-2 gap-2 border-t border-ink/10 p-3 sm:grid-cols-3">
          {CONSTRUCTS.map((c) => {
            const total = totals[c.id] ?? 0;
            const delta = lastDeltas?.[c.id] ?? 0;
            const pct = Math.min(100, (total / SESSION_MAX) * 100);
            return (
              <div key={c.id} className="rounded-xl border border-ink/10 bg-paper p-3">
                <div className="flex items-baseline justify-between">
                  <p className="font-kr text-sm font-medium">{c.koreanName}</p>
                  <span className="flex items-baseline gap-1.5">
                    {delta > 0 && (
                      <span className="font-mono text-[11px] text-accent">+{delta}</span>
                    )}
                    <span className="font-mono text-sm">{total}</span>
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                  <div
                    className="h-full bg-accent transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
