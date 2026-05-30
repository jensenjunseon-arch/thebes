"use client";

import { useState } from "react";

interface Props {
  englishStatement: string;
  koreanSupport?: string;
  topic: string;
  difficulty: string;
}

// Mobile-first problem display: a sticky chip that expands on tap, so the
// problem is always one tap away without eating vertical space in the chat.
export function ProblemChip({
  englishStatement,
  koreanSupport,
  topic,
  difficulty,
}: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div className="sticky top-[64px] z-20 rounded-2xl border border-ink/10 bg-paper/95 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3"
      >
        <span className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-tighter2 text-ink/50">
            문제 · {topic}
          </span>
          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-tighter2 text-accent">
            {difficulty}
          </span>
        </span>
        <span className="font-mono text-[11px] uppercase tracking-tighter2 text-ink/40">
          {open ? "접기 ▴" : "문제 보기 ▾"}
        </span>
      </button>

      {open && (
        <div className="border-t border-ink/10 px-4 pb-4 pt-3">
          <p className="text-[17px] leading-relaxed text-ink">{englishStatement}</p>
          {koreanSupport && (
            <p className="mt-3 border-t border-ink/10 pt-3 text-sm text-ink/55">
              {koreanSupport}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
