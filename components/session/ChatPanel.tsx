"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface Turn {
  id: string;
  speaker: "coach" | "student";
  content: string;
}

interface Props {
  turns: ReadonlyArray<Turn>;
  onStudentSubmit?: (content: string) => void;
  disabled?: boolean;
  pending?: boolean;
  // Sentence-starter chips for the current question.
  frames?: string[];
}

export function ChatPanel({ turns, onStudentSubmit, disabled, pending, frames }: Props) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to the newest turn.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns.length, pending]);

  function submit() {
    const trimmed = draft.trim();
    if (!trimmed || disabled) return;
    onStudentSubmit?.(trimmed);
    setDraft("");
  }

  function useFrame(frame: string) {
    setDraft(frame.replace(/…$/, " "));
    inputRef.current?.focus();
  }

  const showFrames = !!frames?.length && !draft.trim() && !disabled;

  return (
    <div className="flex h-full min-h-[60dvh] flex-col rounded-3xl border border-ink/10 bg-paper-2 lg:min-h-[520px]">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
        {turns.length === 0 ? (
          <EmptyState />
        ) : (
          turns.map((t) => <TurnBubble key={t.id} turn={t} />)
        )}
        {pending && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-paper px-4 py-3 text-sm text-ink/50">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink/40" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink/40 [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink/40 [animation-delay:240ms]" />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-ink/10 p-3 sm:px-4 sm:py-4">
        {showFrames && (
          <div className="mb-2.5 flex flex-wrap gap-2">
            <span className="self-center font-mono text-[10px] uppercase tracking-tighter2 text-ink/35">
              이렇게 시작해 보세요
            </span>
            {frames!.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => useFrame(f)}
                className="rounded-full border border-accent/30 bg-accent-soft/40 px-3 py-1 text-[13px] text-ink/75 transition hover:border-accent/60 hover:bg-accent-soft/70"
              >
                {f}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              // Enter sends; Shift+Enter makes a newline. (Mobile keyboards
              // show a return key — long answers can still use Shift+Enter.)
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="영어로 생각을 적어보세요…"
            disabled={disabled}
            rows={2}
            className="min-h-[56px] flex-1 resize-none rounded-2xl border border-ink/15 bg-paper px-4 py-3 text-[15px] leading-relaxed outline-none placeholder:text-ink/35 focus:border-accent disabled:opacity-50"
          />
          <button
            type="button"
            onClick={submit}
            disabled={disabled || !draft.trim()}
            className="h-[56px] shrink-0 rounded-2xl bg-ink px-5 font-kr text-sm font-semibold text-on-dark transition hover:bg-accent disabled:opacity-40"
          >
            전송
          </button>
        </div>
        <p className="mt-2 text-[12px] text-ink/40">
          이 단계는 <span className="text-ink/60">영어로</span> 생각을 적어요 · Enter 전송
        </p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="grid h-full place-items-center text-center">
      <div className="max-w-sm">
        <p className="font-mono text-[11px] uppercase tracking-tighter2 text-ink/40">
          Step 01 · Understand
        </p>
        <p className="mt-3 font-sans text-xl leading-snug text-ink/80">
          문제가 무엇을 묻고 있나요?
        </p>
        <p className="mt-3 text-sm text-ink/55">
          답을 서두르지 말고, 이 문제가 무엇에 대한 건지 자신의 말로 설명해 보세요.
        </p>
      </div>
    </div>
  );
}

function TurnBubble({ turn }: { turn: Turn }) {
  const isCoach = turn.speaker === "coach";
  return (
    <div className={cn("flex", isCoach ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed",
          isCoach ? "bg-paper text-ink" : "bg-ink text-on-dark",
        )}
      >
        <p
          className={cn(
            "mb-1 font-mono text-[10px] uppercase tracking-tighter2",
            isCoach ? "text-ink/40" : "text-on-dark/50",
          )}
        >
          {isCoach ? "coach" : "you"}
        </p>
        <p>{turn.content}</p>
      </div>
    </div>
  );
}
