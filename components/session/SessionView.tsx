"use client";

import { useState, useTransition } from "react";
import { StepIndicator } from "@/components/session/StepIndicator";
import { ChatPanel, type Turn } from "@/components/session/ChatPanel";
import { ProblemChip } from "@/components/session/ProblemChip";
import { LiveEvidenceCard, type LiveEvidence } from "@/components/session/LiveEvidenceCard";
import { LiveScoreBar, type ScoreTotals } from "@/components/session/LiveScoreBar";
import { TOTAL_STEPS, stepById, type StepId } from "@/lib/steps";
import { submitTurn } from "@/app/session/[id]/actions";
import type { TutorMessage } from "@/lib/ai/tutor";
import type { ConstructId } from "@/lib/constructs";

const EMPTY_TOTALS: ScoreTotals = {
  redefine: 0,
  assume: 0,
  paths: 0,
  verify: 0,
  logic: 0,
  english: 0,
};

interface Props {
  problem: {
    topic: string;
    difficulty: string;
    englishStatement: string;
    koreanSupport: string;
  };
  // null = demo mode (no DB persistence)
  sessionId: string | null;
  initialTurns?: Turn[];
  initialStep?: StepId;
}

// Seed the coach's opening line so the student never faces a blank box.
function greetingTurn(step: StepId): Turn {
  return {
    id: `greeting-${step}`,
    speaker: "coach",
    content: stepById(step).greeting,
  };
}

function topMovedConstruct(
  deltas: Record<ConstructId, number>,
): { id: ConstructId; delta: number } | null {
  let best: { id: ConstructId; delta: number } | null = null;
  for (const key of Object.keys(deltas) as ConstructId[]) {
    const d = deltas[key] ?? 0;
    if (d > 0 && (!best || d > best.delta)) best = { id: key, delta: d };
  }
  return best;
}

export function SessionView({
  problem,
  sessionId,
  initialTurns = [],
  initialStep = 1,
}: Props) {
  const [step, setStep] = useState<StepId>(initialStep);
  const [turns, setTurns] = useState<Turn[]>(
    initialTurns.length > 0 ? initialTurns : [greetingTurn(initialStep)],
  );
  const [totals, setTotals] = useState<ScoreTotals>(EMPTY_TOTALS);
  const [lastDeltas, setLastDeltas] = useState<ScoreTotals | null>(null);
  const [evidence, setEvidence] = useState<LiveEvidence | null>(null);
  const [pending, startTransition] = useTransition();
  const [advanceBanner, setAdvanceBanner] = useState<string | null>(null);

  const history: TutorMessage[] = turns.map((t) => ({
    role: t.speaker === "student" ? "user" : "assistant",
    content: t.content,
  }));

  function handleStudentSubmit(content: string) {
    const studentTurnId = crypto.randomUUID();
    setTurns((prev) => [...prev, { id: studentTurnId, speaker: "student", content }]);

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
          const top = topMovedConstruct(res.score.construct_deltas);
          if (top) {
            setEvidence({
              quote: res.score.evidence_quote,
              topConstruct: top.id,
              topDelta: top.delta,
              rationale: res.score.rationale,
            });
          }
        } else {
          setLastDeltas(null);
        }

        if (res.advance && step < TOTAL_STEPS) {
          const next = (step + 1) as StepId;
          setStep(next);
          setTurns((prev) => [...prev, greetingTurn(next)]);
          setAdvanceBanner(`${stepById(step).englishLabel} 완료 — 다음 단계로`);
        } else if (res.advance && step === TOTAL_STEPS) {
          setAdvanceBanner("진단 완료! 곧 결과를 보여드릴게요.");
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
    <section className="mx-auto max-w-2xl px-4 pb-28 sm:px-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="font-kr text-xl font-semibold tracking-tighter2 sm:text-2xl">
          사고력 진단
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-tighter2 text-ink/50">
          {TOTAL_STEPS} steps · English
          {sessionId === null && <span className="ml-2 text-accent">· demo</span>}
        </p>
      </div>

      <ProblemChip
        topic={problem.topic}
        difficulty={problem.difficulty}
        englishStatement={problem.englishStatement}
        koreanSupport={problem.koreanSupport}
      />

      <div className="mt-5">
        <StepIndicator activeStep={step} />
      </div>

      {advanceBanner && (
        <div className="mt-4 rounded-2xl border border-accent/40 bg-accent-soft/60 px-4 py-3 text-sm font-medium text-accent">
          {advanceBanner}
        </div>
      )}

      <div className="mt-5">
        <ChatPanel
          turns={turns}
          onStudentSubmit={handleStudentSubmit}
          disabled={pending}
          pending={pending}
        />
      </div>

      {evidence && (
        <div className="mt-4">
          <LiveEvidenceCard evidence={evidence} />
        </div>
      )}

      {/* Slim live score — full breakdown lives in the result screen. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-paper/95 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="mx-auto max-w-2xl">
          <LiveScoreBar totals={totals} lastDeltas={lastDeltas} />
        </div>
      </div>
    </section>
  );
}
