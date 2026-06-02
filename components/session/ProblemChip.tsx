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

// Mobile-first problem display: a slim, ALWAYS-visible reference bar. Compact by
// default (small font, clamped, no translation) so the conversation below gets
// the room; "자세히" expands to the full statement + Korean. The level badge and
// "다른 문제" controls live inside the chip itself.
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
  const [expanded, setExpanded] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);
  const showPicker = pickerEnabled && !!levels?.length;

  return (
    <div className="sticky top-[64px] z-20 rounded-2xl border border-ink/10 bg-paper/95 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2 px-4 pb-1.5 pt-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-mono text-[11px] uppercase tracking-tighter2 text-ink/45">
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
            onClick={() => setExpanded((v) => !v)}
            className="font-mono text-[11px] uppercase tracking-tighter2 text-ink/40 transition hover:text-ink/70"
          >
            {expanded ? "접기 ▴" : "자세히 ▾"}
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

      {/* Body — always visible. Compact by default; expands on tap. */}
      <div className="border-t border-ink/10 px-4 pb-3 pt-2">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="업로드한 문제"
            className={cn(
              "w-full rounded-xl border border-ink/10 object-contain",
              expanded ? "" : "max-h-28",
            )}
          />
        ) : (
          <>
            <p
              className={cn(
                "text-ink",
                expanded
                  ? "text-[16px] leading-relaxed"
                  : "line-clamp-3 text-[14px] leading-snug",
              )}
            >
              {englishStatement}
            </p>
            {expanded && koreanSupport && (
              <p className="mt-2.5 border-t border-ink/10 pt-2.5 text-[13px] leading-relaxed text-ink/55">
                {koreanSupport}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
