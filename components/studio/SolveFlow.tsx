"use client";

// The heart: plan the solution ONE LINE AT A TIME (in English), and the coach
// reacts to every line in ~a second — rewarding the move, sharpening the vague,
// unsticking the stuck. Writing math in English is HARD at first, so the coach
// can also hand you ONE model line to TRACE ("이렇게 써보는 건 어때요?") with a
// live match meter. When the plan chains start→finish, the payoff unlocks.

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { traceMatchPercent } from "@/lib/recap";
import { MathText } from "@/components/studio/MathText";
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

interface Suggestion {
  en: string;
  ko: string;
}

// Word-bank helpers — the "tap to build" path needs zero typing.
function tokenize(s: string): string[] {
  return s.trim().split(/\s+/).filter(Boolean);
}
function normSentence(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9$]/gi, "");
}
function shuffleIndices(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  // avoid the rare already-sorted shuffle so it's never trivially in order
  if (n > 2 && a.every((v, i) => v === i)) [a[0], a[1]] = [a[1], a[0]];
  return a;
}

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
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [tracing, setTracing] = useState(false);
  // tap-to-build (word bank) state
  const [building, setBuilding] = useState(false);
  const [placed, setPlaced] = useState<number[]>([]);
  const [bankOrder, setBankOrder] = useState<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const tracePct = tracing && suggestion ? traceMatchPercent(draft, suggestion.en) : 0;

  const targetWords = suggestion ? tokenize(suggestion.en) : [];
  const builtText = placed.map((i) => targetWords[i] ?? "").join(" ");
  const buildMatch = !!suggestion && normSentence(builtText) === normSentence(suggestion.en);

  function startBuild() {
    if (!suggestion) return;
    setBuilding(true);
    setTracing(false);
    setPlaced([]);
    setBankOrder(shuffleIndices(tokenize(suggestion.en).length));
  }
  function placeWord(idx: number) {
    setPlaced((p) => (p.includes(idx) ? p : [...p, idx]));
  }
  function removeWord(idx: number) {
    setPlaced((p) => p.filter((x) => x !== idx));
  }
  function submitBuild() {
    if (!buildMatch || pending) return;
    const text = builtText;
    setBuilding(false);
    setPlaced([]);
    setSuggestion(null);
    void submit(text);
  }
  function closeSuggestion() {
    setSuggestion(null);
    setTracing(false);
    setBuilding(false);
    setPlaced([]);
  }

  async function submit(text: string, isStuck = false) {
    if (pending) return;
    const lineText = isStuck ? STUCK_LINE : text.trim();
    if (!lineText) return;

    const id = crypto.randomUUID();
    setPending(true);
    if (!isStuck) {
      onLines([...lines, { id, text: lineText, feedback: null }]);
      setDraft("");
      // A submitted trace completes the exercise — clear the target.
      if (tracing) {
        setTracing(false);
        setSuggestion(null);
      }
    }

    try {
      const res = await fetch("/api/studio/line", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          english: pack.english,
          level: pack.level,
          lines: lines
            .map((l) => l.text)
            .filter((t) => t !== STUCK_LINE && t !== "💭 막혔어요…"),
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
        onLines([...lines, { id, text: lineText, feedback: fb }]);
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

  // "이렇게 써보는 건 어때요?" — fetch ONE ideal next line to trace.
  async function fetchSuggestion() {
    if (suggesting) return;
    setSuggesting(true);
    setTracing(false);
    try {
      const res = await fetch("/api/studio/line", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "suggest",
          english: pack.english,
          level: pack.level,
          lines: lines.filter((l) => l.text !== "💭 막혔어요…").map((l) => l.text),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { suggestion: string; suggestionKo: string };
      setSuggestion({ en: data.suggestion, ko: data.suggestionKo });
      // default to the easiest path: tap-to-build, ready to go
      setTracing(false);
      setPlaced([]);
      setBuilding(true);
      setBankOrder(shuffleIndices(tokenize(data.suggestion).length));
    } catch {
      setSuggestion(null);
    } finally {
      setSuggesting(false);
    }
  }

  function startTrace() {
    setTracing(true);
    setBuilding(false);
    setPlaced([]);
    setDraft("");
    inputRef.current?.focus();
  }

  const realLines = lines.filter((l) => l.text !== STUCK_LINE && l.text !== "💭 막혔어요…");
  const canFinish = realLines.length >= 1 && !pending;
  const lastWasHint = lines[lines.length - 1]?.feedback?.verdict === "hint";

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
            <MathText text={pack.firstHint} />
            <span className="mt-1 block text-[11.5px] text-ink/45">
              영어가 막막하면 아래 <b>🧩 도와줘</b>를 눌러요 — 단어를 톡톡 눌러 문장을 만들면
              돼요. 타이핑 안 해도 괜찮아요.
            </span>
          </p>
        </div>
      )}

      {/* The plan, line by line */}
      <ol className="mt-4 space-y-3">
        {lines.map((l) => (
          <li key={l.id} className="group">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-ink/8 font-mono text-[11px] text-ink/50">
                {l.text === "💭 막혔어요…" ? "💭" : realLines.findIndex((r) => r.id === l.id) + 1}
              </span>
              <div className="min-w-0 flex-1">
                {l.text !== "💭 막혔어요…" && (
                  <p className="font-sans text-[14.5px] leading-relaxed text-ink">
                    <MathText text={l.text} />
                  </p>
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
                      <MathText text={l.feedback.comment} />
                    </p>
                    {l.feedback.betterEnglish && l.text !== "💭 막혔어요…" && (
                      <p className="mt-1 font-sans text-[12.5px] italic leading-relaxed text-accent/90">
                        ✎ <MathText text={l.feedback.betterEnglish} />
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

      {/* Suggestion card — a model line to trace */}
      {(suggestion || suggesting) && (
        <div className="mt-4 rounded-2xl border border-accent/30 bg-accent-soft/25 px-4 py-3.5">
          {suggesting ? (
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              <span className="font-kr text-[12.5px] text-ink/55">
                딱 맞는 다음 문장을 고르는 중…
              </span>
            </div>
          ) : (
            suggestion && (
              <>
                <p className="font-kr text-[12.5px] font-semibold text-accent">
                  이렇게 써보는 건 어때요?
                </p>
                <p className="mt-1.5 font-sans text-[15px] font-medium leading-relaxed text-ink">
                  <MathText text={suggestion.en} />
                </p>
                {suggestion.ko && (
                  <p className="mt-1 font-kr text-[12px] leading-relaxed text-ink/55 break-keep">
                    <MathText text={suggestion.ko} />
                  </p>
                )}

                {/* ── tap-to-build: zero typing ── */}
                {building && (
                  <div className="mt-3">
                    <p className="font-kr text-[11.5px] text-ink/55">
                      👇 단어를 순서대로 톡톡 눌러보세요
                    </p>
                    {/* answer slots */}
                    <div className="mt-1.5 flex min-h-[42px] flex-wrap content-start gap-1.5 rounded-xl border border-accent/30 bg-paper p-2">
                      {placed.length === 0 ? (
                        <span className="self-center px-1 font-kr text-[12px] text-ink/30">
                          여기에 단어가 쌓여요 — 누른 단어는 다시 누르면 빠져요
                        </span>
                      ) : (
                        placed.map((idx, pos) => (
                          <button
                            key={`${idx}-${pos}`}
                            type="button"
                            onClick={() => removeWord(idx)}
                            className="rounded-lg bg-accent px-2.5 py-1.5 font-sans text-[13px] font-medium text-on-dark transition active:scale-95"
                          >
                            {targetWords[idx]}
                          </button>
                        ))
                      )}
                    </div>
                    {/* word bank */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {bankOrder
                        .filter((i) => !placed.includes(i))
                        .map((idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => placeWord(idx)}
                            className="rounded-lg border border-ink/20 bg-paper px-2.5 py-1.5 font-sans text-[13px] text-ink transition hover:border-accent hover:bg-accent-soft/40 active:scale-95"
                          >
                            {targetWords[idx]}
                          </button>
                        ))}
                    </div>
                    {buildMatch && (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={submitBuild}
                        className="mt-2.5 w-full animate-pulse rounded-xl bg-accent py-2.5 font-kr text-[13px] font-semibold text-on-dark transition hover:animate-none hover:bg-ink disabled:opacity-40"
                      >
                        ✓ 완성! 코치에게 보여주기
                      </button>
                    )}
                  </div>
                )}

                {/* ── trace: type along ── */}
                {tracing && (
                  <div className="mt-2 flex items-center justify-between rounded-xl bg-paper px-3 py-2">
                    <span className="font-kr text-[11.5px] text-ink/55 break-keep">
                      아래 입력창에 위 문장을 그대로 따라 써보세요
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[12px] font-semibold tabular-nums",
                        tracePct >= 90 ? "text-accent" : "text-ink/45",
                      )}
                    >
                      {tracePct}%
                    </span>
                  </div>
                )}

                {/* mode toggle + controls */}
                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <button
                    type="button"
                    onClick={building ? startTrace : startBuild}
                    className="font-kr text-[11.5px] text-ink/50 underline-offset-4 hover:text-accent hover:underline"
                  >
                    {building ? "✍️ 직접 쓸래요" : "🧩 단어로 만들래요"}
                  </button>
                  <button
                    type="button"
                    disabled={suggesting}
                    onClick={() => void fetchSuggestion()}
                    className="font-kr text-[11.5px] text-ink/50 hover:text-accent"
                  >
                    다른 문장
                  </button>
                  <button
                    type="button"
                    onClick={closeSuggestion}
                    className="ml-auto font-kr text-[11.5px] text-ink/40 hover:text-ink/70"
                  >
                    닫기 ✕
                  </button>
                </div>
              </>
            )
          )}
        </div>
      )}

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
            tracing && suggestion
              ? suggestion.en
              : realLines.length === 0
                ? "First, I need to find…"
                : "Then, …  (다음 한 줄)"
          }
          className={cn(
            "h-11 w-full flex-1 rounded-2xl border bg-paper px-4 font-sans text-[14px] text-ink outline-none transition placeholder:text-ink/30 disabled:opacity-50",
            tracing ? "border-accent/60 placeholder:text-accent/40" : "border-ink/15 focus:border-accent",
          )}
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
      {tracing && tracePct >= 90 && (
        <p className="mt-1.5 font-kr text-[12px] text-accent">
          거의 완벽해요! Enter로 제출해 보세요 — 코치가 반응해 줄 거예요.
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={suggesting || pending}
          onClick={() => void fetchSuggestion()}
          className={cn(
            "rounded-full border px-3.5 py-2 font-kr text-[12.5px] font-medium transition disabled:opacity-40",
            lastWasHint || realLines.length === 0
              ? "animate-pulse border-accent bg-accent-soft/50 text-accent"
              : "border-ink/15 text-ink/55 hover:border-accent/50 hover:text-accent",
          )}
        >
          🧩 도와줘 — 단어로 만들기
        </button>
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
