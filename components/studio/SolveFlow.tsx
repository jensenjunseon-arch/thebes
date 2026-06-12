"use client";

// The heart: plan the solution ONE LINE AT A TIME (in English), and the coach
// reacts to every line in ~a second — rewarding the move, sharpening the vague,
// unsticking the stuck. When the plan chains start→finish, the payoff unlocks.

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { LineFeedback, PlanLine, ProblemPack } from "@/lib/studio/types";

const VERDICT_UI: Record<
  LineFeedback["verdict"],
  { chip: string; cls: string }
> = {
  great: { chip: "✓ 멋진 수", cls: "bg-accent text-on-dark" },
  good: { chip: "👍 좋아요", cls: "bg-accent-soft/70 text-accent" },
  hint: { chip: "💡 힌트", cls: "bg-ink/8 text-ink/60" },
};

const STUCK_LINE =
  "(The student says: I'm stuck and can't write the next line. Based on the plan so far, ask ONE pointed Korean question that unsticks them — do not give the method.)";

export function SolveFlow({
  pack,
  lines,
  onLines,
  onFinish,
}: {
  pack: ProblemPack;
  lines: PlanLine[];
  onLines: (lines: PlanLine[]) => void;
  onFinish: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [planComplete, setPlanComplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function submit(text: string, isStuck = false) {
    if (pending) return;
    const lineText = isStuck ? STUCK_LINE : text.trim();
    if (!lineText) return;

    const id = crypto.randomUUID();
    setPending(true);
    if (!isStuck) {
      onLines([...lines, { id, text: lineText, feedback: null }]);
      setDraft("");
    }

    try {
      const res = await fetch("/api/studio/line", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          english: pack.english,
          lines: lines.map((l) => l.text).filter((t) => t !== STUCK_LINE),
          line: lineText,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const fb = (await res.json()) as LineFeedback;

      if (isStuck) {
        onLines([
          ...lines,
          { id, text: "💭 막혔어요…", feedback: { ...fb, verdict: "hint", planComplete: false } },
        ]);
      } else {
        onLines([
          ...lines,
          { id, text: lineText, feedback: fb },
        ]);
        if (fb.planComplete) setPlanComplete(true);
      }
    } catch {
      // Feedback failed — keep the line, mark it gently so flow never breaks.
      if (!isStuck) {
        onLines([
          ...lines,
          {
            id,
            text: lineText,
            feedback: {
              verdict: "good",
              comment: "코치 연결이 잠시 끊겼어요 — 줄은 저장됐으니 계속 이어가요!",
              planComplete: false,
            },
          },
        ]);
      }
    } finally {
      setPending(false);
      inputRef.current?.focus();
    }
  }

  const realLines = lines.filter((l) => l.text !== STUCK_LINE);
  const canFinish = realLines.length >= 1 && !pending;

  return (
    <section className="rounded-3xl border border-ink/10 bg-paper p-5 shadow-sm sm:p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-kr text-[15px] font-bold text-ink">한 줄씩, 풀이 계획</h2>
        <span className="font-mono text-[11px] tabular-nums text-ink/40">
          {realLines.length} {realLines.length > 0 ? "줄" : ""}
        </span>
      </div>
      <p className="mt-1 font-kr text-[12.5px] leading-relaxed text-ink/55 break-keep">
        답을 계산하는 게 아니에요. <span className="text-accent">어떻게 풀지</span>를 영어로 한
        줄씩 써내려가면, 코치가 줄마다 반응해요.
      </p>

      {/* Coach's opening nudge */}
      {lines.length === 0 && (
        <div className="mt-4 flex gap-2.5">
          <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-ink font-mono text-[9px] text-on-dark">
            AI
          </span>
          <p className="rounded-2xl rounded-tl-md bg-paper-2/80 px-3.5 py-2.5 font-kr text-[13px] leading-relaxed text-ink/75 break-keep">
            {pack.firstHint}
            <span className="mt-1 block text-[11.5px] text-ink/45">
              예: &ldquo;First, I need to find … &rdquo; — 짧아도, 영어가 서툴러도 좋아요.
            </span>
          </p>
        </div>
      )}

      {/* The plan, line by line */}
      <ol className="mt-4 space-y-3">
        {lines.map((l, i) => (
          <li key={l.id} className="group">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-ink/8 font-mono text-[11px] text-ink/50">
                {l.text === STUCK_LINE ? "💭" : realLines.findIndex((r) => r.id === l.id) + 1}
              </span>
              <div className="min-w-0 flex-1">
                {l.text !== STUCK_LINE && (
                  <p className="font-sans text-[14.5px] leading-relaxed text-ink">{l.text}</p>
                )}
                {l.feedback ? (
                  <div className="mt-1.5">
                    <span
                      className={cn(
                        "inline-block rounded-full px-2 py-0.5 font-kr text-[10.5px] font-semibold",
                        VERDICT_UI[l.feedback.verdict].cls,
                      )}
                    >
                      {VERDICT_UI[l.feedback.verdict].chip}
                    </span>
                    <p className="mt-1 font-kr text-[12.5px] leading-relaxed text-ink/65 break-keep">
                      {l.feedback.comment}
                    </p>
                    {l.feedback.betterEnglish && l.text !== STUCK_LINE && (
                      <p className="mt-1 font-sans text-[12.5px] italic leading-relaxed text-accent/90">
                        ✎ {l.feedback.betterEnglish}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                    <span className="font-kr text-[11.5px] text-ink/40">코치가 읽는 중…</span>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      {/* Input row */}
      <div className="mt-4 flex gap-2">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void submit(draft);
            }
          }}
          disabled={pending}
          placeholder={
            realLines.length === 0 ? "First, I need to find…" : "Then, …  (다음 한 줄)"
          }
          className="h-11 w-full flex-1 rounded-2xl border border-ink/15 bg-paper px-4 font-sans text-[14px] text-ink outline-none transition placeholder:text-ink/30 focus:border-accent disabled:opacity-50"
        />
        <button
          type="button"
          disabled={pending || !draft.trim()}
          onClick={() => void submit(draft)}
          className="h-11 flex-none rounded-2xl bg-ink px-4 font-kr text-[13.5px] font-semibold text-on-dark transition hover:bg-accent disabled:opacity-30"
        >
          추가
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => void submit("", true)}
          className="rounded-full border border-ink/15 px-3.5 py-2 font-kr text-[12.5px] text-ink/55 transition hover:border-accent/50 hover:text-accent disabled:opacity-40"
        >
          💭 막혔어요
        </button>
        <button
          type="button"
          disabled={!canFinish}
          onClick={onFinish}
          className={cn(
            "ml-auto rounded-2xl px-5 py-2.5 font-kr text-[13.5px] font-semibold transition disabled:opacity-30",
            planComplete
              ? "animate-pulse bg-accent text-on-dark hover:bg-ink"
              : "border border-ink/20 text-ink/70 hover:border-accent/60 hover:text-accent",
          )}
        >
          {planComplete ? "풀이 완성! 결과 만들기 →" : "여기까지로 정리하기 →"}
        </button>
      </div>
    </section>
  );
}
