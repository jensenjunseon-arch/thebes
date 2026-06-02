"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

interface Props {
  englishStatement: string;
  koreanSupport?: string;
  topic: string;
  difficulty: string;
  // When the student uploaded a photo of their own problem.
  imageUrl?: string;
  // In-box controls (demo): tap the level badge to switch difficulty, or shuffle
  // to a different problem at the same level.
  levels?: string[];
  pickerEnabled?: boolean;
  onPickLevel?: (level: string) => void;
  onShuffle?: () => void;
  canShuffle?: boolean;
}

// Mobile-first problem display: a sticky chip that expands on tap, so the
// problem is always one tap away without eating vertical space in the chat.
// The level badge and "다른 문제" controls live inside the chip itself.
export function ProblemChip({
  englishStatement,
  koreanSupport,
  topic,
  difficulty,
  imageUrl,
  levels,
  pickerEnabled = false,
  onPickLevel,
  onShuffle,
  canShuffle = false,
}: Props) {
  const [open, setOpen] = useState(true);
  const [levelOpen, setLevelOpen] = useState(false);
  const showPicker = pickerEnabled && !!levels?.length;

  return (
    <div className="sticky top-[64px] z-20 rounded-2xl border border-ink/10 bg-paper/95 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-mono text-[11px] uppercase tracking-tighter2 text-ink/50">
            문제 · {topic}
          </span>
          {showPicker ? (
            <button
              type="button"
              onClick={() => setLevelOpen((v) => !v)}
              className="flex shrink-0 items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-tighter2 text-accent transition hover:bg-accent/20"
            >
              {difficulty}
              <span className="text-[8px] leading-none">{levelOpen ? "▴" : "▾"}</span>
            </button>
          ) : (
            <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-tighter2 text-accent">
              {difficulty}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {canShuffle && (
            <button
              type="button"
              onClick={onShuffle}
              className="font-mono text-[11px] uppercase tracking-tighter2 text-ink/45 transition hover:text-accent"
            >
              다른 문제 ↻
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="font-mono text-[11px] uppercase tracking-tighter2 text-ink/40 transition hover:text-ink/70"
          >
            {open ? "접기 ▴" : "문제 보기 ▾"}
          </button>
        </div>
      </div>

      {levelOpen && showPicker && (
        <div className="flex flex-wrap gap-2 border-t border-ink/10 px-4 py-3">
          <span className="w-full font-mono text-[10px] uppercase tracking-tighter2 text-ink/40">
            난이도 선택
          </span>
          {levels!.map((lv) => (
            <button
              key={lv}
              type="button"
              onClick={() => {
                onPickLevel?.(lv);
                setLevelOpen(false);
              }}
              className={cn(
                "rounded-full border px-3 py-1 font-kr text-sm transition",
                lv === difficulty
                  ? "border-accent bg-accent text-on-dark"
                  : "border-ink/15 bg-paper text-ink hover:border-accent/60",
              )}
            >
              {lv}
            </button>
          ))}
        </div>
      )}

      {open && (
        <div className="border-t border-ink/10 px-4 pb-4 pt-3">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="업로드한 문제"
              className="w-full rounded-xl border border-ink/10"
            />
          ) : (
            <>
              <p className="text-[17px] leading-relaxed text-ink">{englishStatement}</p>
              {koreanSupport && (
                <p className="mt-3 border-t border-ink/10 pt-3 text-sm text-ink/55">
                  {koreanSupport}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
