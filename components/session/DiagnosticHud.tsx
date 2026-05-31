"use client";

import { CONSTRUCTS, type ConstructId } from "@/lib/constructs";
import { cn } from "@/lib/cn";

// Anticipation: a meter that fills toward the result, so the payoff feels
// imminent from turn one and pulls the student forward.
export function ProfileGauge({ percent }: { percent: number }) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className="flex items-center gap-3">
      <span className="whitespace-nowrap font-kr text-[12px] font-semibold text-ink/60">
        사고 프로필
      </span>
      <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-ink/10">
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-accent transition-all duration-700"
          style={{ width: `${p}%` }}
        />
      </span>
      <span className="font-mono text-[12px] tabular-nums text-accent">{p}%</span>
    </div>
  );
}

// Per-turn dopamine: a "collect all 6" tally. Detected constructs light up; the
// just-detected one pops. Turns measurement into a game without cheapening it.
export function DetectedTally({
  totals,
  justDetected,
}: {
  totals: Record<ConstructId, number>;
  justDetected: ConstructId | null;
}) {
  const detected = CONSTRUCTS.filter((c) => (totals[c.id] ?? 0) > 0).length;
  return (
    <div className="rounded-2xl border border-ink/10 bg-paper-2 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="font-kr text-[13px] font-semibold text-ink/80">
          감지된 사고력
        </span>
        <span className="font-mono text-[12px] tabular-nums text-ink/50">
          {detected}/6
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {CONSTRUCTS.map((c) => {
          const lit = (totals[c.id] ?? 0) > 0;
          return (
            <span
              key={c.id}
              className={cn(
                "rounded-full px-2.5 py-1 text-[12px] transition-colors",
                lit ? "bg-accent text-on-dark" : "bg-ink/5 text-ink/35",
                lit && justDetected === c.id && "animate-pop",
              )}
            >
              {c.koreanName}
            </span>
          );
        })}
      </div>
    </div>
  );
}
