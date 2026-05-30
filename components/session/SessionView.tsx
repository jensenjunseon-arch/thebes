"use client";

import { useMemo, useState, useTransition } from "react";
import { StepIndicator } from "@/components/session/StepIndicator";
import { ChatPanel, type Turn } from "@/components/session/ChatPanel";
import { ProblemChip } from "@/components/session/ProblemChip";
import { LiveEvidenceCard, type LiveEvidence } from "@/components/session/LiveEvidenceCard";
import { LiveScoreBar, type ScoreTotals } from "@/components/session/LiveScoreBar";
import { TOTAL_STEPS, stepById, type StepId } from "@/lib/steps";
import { submitTurn } from "@/app/session/[id]/actions";
import { LEVELS, type Level, type PublicProblem } from "@/lib/problems";
import type { TutorMessage } from "@/lib/ai/tutor";
import type { ConstructId } from "@/lib/constructs";
import { cn } from "@/lib/cn";

const EMPTY_TOTALS: ScoreTotals = {
  redefine: 0,
  assume: 0,
  paths: 0,
  verify: 0,
  logic: 0,
  english: 0,
};

interface Props {
  problems: PublicProblem[];
  initialProblemId: string;
  // null = demo mode (no DB persistence)
  sessionId: string | null;
  initialTurns?: Turn[];
  initialStep?: StepId;
  // Show the difficulty picker (demo only).
  enablePicker?: boolean;
}

function greetingTurn(step: StepId): Turn {
  return { id: `greeting-${step}`, speaker: "coach", content: stepById(step).greeting };
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
  problems,
  initialProblemId,
  sessionId,
  initialTurns = [],
  initialStep = 1,
  enablePicker = false,
}: Props) {
  const [problemId, setProblemId] = useState(initialProblemId);
  const [step, setStep] = useState<StepId>(initialStep);
  const [turns, setTurns] = useState<Turn[]>(
    initialTurns.length > 0 ? initialTurns : [greetingTurn(initialStep)],
  );
  const [totals, setTotals] = useState<ScoreTotals>(EMPTY_TOTALS);
  const [lastDeltas, setLastDeltas] = useState<ScoreTotals | null>(null);
  const [evidence, setEvidence] = useState<LiveEvidence | null>(null);
  const [pending, startTransition] = useTransition();
  const [banner, setBanner] = useState<{ kind: "advance" | "error"; text: string } | null>(
    null,
  );

  const current = useMemo(
    () => problems.find((p) => p.id === problemId) ?? problems[0],
    [problems, problemId],
  );

  // Levels that actually have problems, in canonical order.
  const availableLevels = useMemo(
    () => LEVELS.filter((lv) => problems.some((p) => p.level === lv)),
    [problems],
  );

  const history: TutorMessage[] = turns.map((t) => ({
    role: t.speaker === "student" ? "user" : "assistant",
    content: t.content,
  }));

  function resetSession(nextStep: StepId = 1) {
    setStep(nextStep);
    setTurns([greetingTurn(nextStep)]);
    setTotals(EMPTY_TOTALS);
    setLastDeltas(null);
    setEvidence(null);
    setBanner(null);
  }

  function pickLevel(level: Level) {
    const first = problems.find((p) => p.level === level);
    if (!first || first.id === problemId) return;
    setProblemId(first.id);
    resetSession();
  }

  function shuffleWithinLevel() {
    const sameLevel = problems.filter((p) => p.level === current.level);
    if (sameLevel.length < 2) return;
    const idx = sameLevel.findIndex((p) => p.id === problemId);
    const next = sameLevel[(idx + 1) % sameLevel.length];
    setProblemId(next.id);
    resetSession();
  }

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
          problemId,
        });

        if (res.error === "ai_unavailable") {
          setBanner({
            kind: "error",
            text: "AI 코치가 잠시 응답하지 못했어요. 잠시 후 다시 시도해 주세요.",
          });
          setTurns((prev) => prev.filter((t) => t.id !== studentTurnId));
          return;
        }

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
          setBanner({
            kind: "advance",
            text: `${stepById(step).englishLabel} 완료 — 다음 단계로`,
          });
        } else if (res.advance && step === TOTAL_STEPS) {
          setBanner({ kind: "advance", text: "진단 완료! 곧 결과를 보여드릴게요." });
        } else {
          setBanner(null);
        }
      } catch (err) {
        console.error("[SessionView] submit failed:", err);
        setBanner({
          kind: "error",
          text: "문제가 발생했어요. 잠시 후 다시 시도해 주세요.",
        });
        setTurns((prev) => prev.filter((t) => t.id !== studentTurnId));
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

      {enablePicker && availableLevels.length > 1 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-tighter2 text-ink/45">
            난이도
          </span>
          {availableLevels.map((lv) => (
            <button
              key={lv}
              type="button"
              onClick={() => pickLevel(lv)}
              disabled={pending}
              className={cn(
                "rounded-full border px-3 py-1 font-kr text-sm transition disabled:opacity-50",
                current.level === lv
                  ? "border-accent bg-accent text-on-dark"
                  : "border-ink/15 bg-paper text-ink hover:border-accent/60",
              )}
            >
              {lv}
            </button>
          ))}
          {problems.filter((p) => p.level === current.level).length > 1 && (
            <button
              type="button"
              onClick={shuffleWithinLevel}
              disabled={pending}
              className="ml-auto rounded-full border border-ink/15 bg-paper px-3 py-1 font-kr text-sm text-ink/70 transition hover:border-accent/60 disabled:opacity-50"
            >
              다른 문제 ↻
            </button>
          )}
        </div>
      )}

      <ProblemChip
        topic={current.topic}
        difficulty={current.level}
        englishStatement={current.englishStatement}
        koreanSupport={current.koreanSupport}
      />

      <div className="mt-5">
        <StepIndicator activeStep={step} />
      </div>

      {banner && (
        <div
          className={cn(
            "mt-4 rounded-2xl border px-4 py-3 text-sm font-medium",
            banner.kind === "advance"
              ? "border-accent/40 bg-accent-soft/60 text-accent"
              : "border-ink/20 bg-paper-2 text-ink/75",
          )}
        >
          {banner.text}
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
