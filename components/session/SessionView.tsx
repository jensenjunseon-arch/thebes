"use client";

import { useState, useTransition } from "react";
import { StepIndicator } from "@/components/session/StepIndicator";
import { ChatPanel, type Turn } from "@/components/session/ChatPanel";
import { ProblemCard } from "@/components/session/ProblemCard";
import {
  ScorePanel,
  EMPTY_TOTALS,
  type ScoreTotals,
  type RecentEvidence,
} from "@/components/session/ScorePanel";
import { POLYA_STEPS, type StepId } from "@/lib/steps";
import { submitTurn } from "@/app/session/[id]/actions";
import type { TutorMessage } from "@/lib/ai/tutor";
import type { ConstructId } from "@/lib/constructs";

interface Props {
  problem: {
    topic: string;
    difficulty: string;
    englishStatement: string;
    koreanSupport: string;
  };
  // null = demo mode (no DB persistence)
  sessionId: string | null;
  // Used when resuming an in-progress session from DB
  initialTurns?: Turn[];
  initialStep?: StepId;
}

export function SessionView({
  problem,
  sessionId,
  initialTurns = [],
  initialStep = 1,
}: Props) {
  const [step, setStep] = useState<StepId>(initialStep);
  const [turns, setTurns] = useState<Turn[]>(initialTurns);
  const [totals, setTotals] = useState<ScoreTotals>(EMPTY_TOTALS);
  const [lastDeltas, setLastDeltas] = useState<ScoreTotals | null>(null);
  const [recentEvidence, setRecentEvidence] = useState<RecentEvidence | null>(
    null,
  );
  const [pending, startTransition] = useTransition();
  const [advanceBanner, setAdvanceBanner] = useState<string | null>(null);

  const history: TutorMessage[] = turns.map((t) => ({
    role: t.speaker === "student" ? "user" : "assistant",
    content: t.content,
  }));

  function handleStudentSubmit(content: string) {
    const studentTurnId = crypto.randomUUID();
    const studentTurn: Turn = {
      id: studentTurnId,
      speaker: "student",
      content,
    };
    setTurns((prev) => [...prev, studentTurn]);

    startTransition(async () => {
      try {
        const res = await submitTurn({
          studentTurnId,
          sessionId,
          step,
          history,
          utterance: content,
        });

        setTurns((prev) => [
          ...prev,
          { id: res.coachTurnId, speaker: "coach", content: res.reply },
        ]);

        if (res.score) {
          applyScore(res.score.construct_deltas);
          setRecentEvidence({
            quote: res.score.evidence_quote,
            rationale: res.score.rationale,
          });
        } else {
          setLastDeltas(null);
        }

        if (res.advance && step < 4) {
          const next = (step + 1) as StepId;
          setStep(next);
          setAdvanceBanner(
            `Step ${step} → Step ${next}. ${res.advanceReason}`,
          );
        } else if (res.advance && step === 4) {
          setAdvanceBanner(`Session complete. ${res.advanceReason}`);
        } else {
          setAdvanceBanner(null);
        }
      } catch {
        setTurns((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            speaker: "coach",
            content:
              "I lost the connection for a moment — say that again, in your own words?",
          },
        ]);
      }
    });
  }

  function applyScore(deltas: Record<ConstructId, number>) {
    setLastDeltas(deltas as ScoreTotals);
    setTotals((prev) => {
      const next: ScoreTotals = { ...prev };
      for (const key of Object.keys(deltas) as ConstructId[]) {
        next[key] = (next[key] ?? 0) + (deltas[key] ?? 0);
      }
      return next;
    });
  }

  return (
    <section className="mx-auto max-w-7xl px-6 pb-12">
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="font-kr text-2xl font-semibold tracking-tighter2">
          오늘의 한 문제
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-tighter2 text-ink/50">
          Pólya · 4 steps · English only
          {sessionId === null && (
            <span className="ml-2 text-accent">· demo</span>
          )}
        </p>
      </div>

      <StepIndicator activeStep={step} />

      <p className="mt-3 max-w-2xl text-sm text-ink/55">
        {POLYA_STEPS[step - 1].intent}
      </p>

      {advanceBanner && (
        <div className="mt-4 rounded-2xl border border-accent/40 bg-accent-soft/60 px-4 py-3 font-mono text-xs uppercase tracking-tighter2 text-accent">
          {advanceBanner}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <ProblemCard
          topic={problem.topic}
          difficulty={problem.difficulty}
          englishStatement={problem.englishStatement}
          koreanSupport={problem.koreanSupport}
        />

        <div className="min-h-[520px]">
          <ChatPanel
            turns={turns}
            onStudentSubmit={handleStudentSubmit}
            disabled={pending}
            pending={pending}
          />
        </div>
      </div>

      <div className="mt-6">
        <ScorePanel
          totals={totals}
          lastDeltas={lastDeltas}
          recentEvidence={recentEvidence}
        />
      </div>
    </section>
  );
}
