"use client";

import { useState } from "react";
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
}

export function ChatPanel({ turns, onStudentSubmit, disabled, pending }: Props) {
  const [draft, setDraft] = useState("");

  function submit() {
    const trimmed = draft.trim();
    if (!trimmed || disabled) return;
    onStudentSubmit?.(trimmed);
    setDraft("");
  }

  return (
    <div className="flex h-full flex-col rounded-3xl border border-ink/10 bg-paper-2">
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
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

      <div className="border-t border-ink/10 px-4 py-4">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Type your reasoning in English…"
            disabled={disabled}
            rows={2}
            className="min-h-[60px] flex-1 resize-none rounded-2xl border border-ink/15 bg-paper px-4 py-3 text-sm leading-relaxed outline-none placeholder:text-ink/35 focus:border-accent disabled:opacity-50"
          />
          <button
            type="button"
            onClick={submit}
            disabled={disabled || !draft.trim()}
            className="h-[60px] rounded-2xl bg-ink px-5 font-mono text-xs uppercase tracking-tighter2 text-on-dark transition hover:bg-accent disabled:opacity-40"
          >
            Send
          </button>
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-tighter2 text-ink/40">
          ⌘ / Ctrl + Enter to send · English only at this step
        </p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="grid h-full place-items-center text-center">
      <div className="max-w-sm">
        <p className="font-mono text-[10px] uppercase tracking-tighter2 text-ink/40">
          Step 01 · Frame it
        </p>
        <p className="mt-3 font-serif text-2xl italic leading-snug text-ink/80">
          What are you actually being asked?
        </p>
        <p className="mt-3 text-sm text-ink/55">
          Restate the problem in your own words. Don’t rush to a method.
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
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isCoach
            ? "bg-paper text-ink"
            : "bg-ink text-on-dark",
        )}
      >
        {!isCoach && (
          <p className="mb-1 font-mono text-[10px] uppercase tracking-tighter2 text-on-dark/50">
            you
          </p>
        )}
        {isCoach && (
          <p className="mb-1 font-mono text-[10px] uppercase tracking-tighter2 text-ink/40">
            coach
          </p>
        )}
        <p>{turn.content}</p>
      </div>
    </div>
  );
}
