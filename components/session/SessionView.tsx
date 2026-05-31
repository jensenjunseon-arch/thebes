"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { StepIndicator } from "@/components/session/StepIndicator";
import { ChatPanel, type Turn } from "@/components/session/ChatPanel";
import { ProblemChip } from "@/components/session/ProblemChip";
import { LiveEvidenceCard, type LiveEvidence } from "@/components/session/LiveEvidenceCard";
import { ProfileGauge, DetectedTally } from "@/components/session/DiagnosticHud";
import { DiagnosticIntro } from "@/components/session/DiagnosticIntro";
import { RecapView } from "@/components/session/RecapView";
import { GENERIC_COACHING } from "@/lib/recap";
import {
  DiagnosticResult,
  type EvidenceByConstruct,
} from "@/components/session/DiagnosticResult";

type ScoreTotals = Record<ConstructId, number>;

// Total dialogue stages across the whole diagnostic (Step 1: 3, Step 2: 2).
const TOTAL_DIALOGUE_STAGES = 5;
import { TOTAL_STEPS, stepById, type StepId } from "@/lib/steps";
import { submitTurn } from "@/app/session/[id]/actions";
import { evaluate, stagesForStep, starterFramesFor } from "@/lib/diagnosticEngine";
import { LEVELS, type Level, type PublicProblem } from "@/lib/problems";
import type { TutorMessage } from "@/lib/ai/tutor";
import type { ConstructId } from "@/lib/constructs";
import { cn } from "@/lib/cn";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function truncateQuote(s: string, max = 110): string {
  const t = s.trim();
  return t.length <= max ? t : t.slice(0, max - 1) + "…";
}

const EMPTY_TOTALS: ScoreTotals = {
  redefine: 0,
  decompose: 0,
  relate: 0,
  relevance: 0,
  transfer: 0,
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
  // Scripted demo mode — runs entirely client-side with no API calls.
  scripted?: boolean;
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
  scripted = false,
}: Props) {
  const [problemId, setProblemId] = useState(initialProblemId);
  // Student-uploaded photo problem (client-only; never sent anywhere).
  const [customProblem, setCustomProblem] = useState<
    (Omit<PublicProblem, "level"> & { level: string; imageUrl?: string }) | null
  >(null);
  // Phase 0 intro gate — skipped when resuming a session with history.
  const [started, setStarted] = useState(initialTurns.length > 0);
  // English recap phase (reached from the result screen).
  const [recap, setRecap] = useState(false);
  // Dialogue-engine cursor: which stage of the step, and retries on that stage.
  const stageRef = useRef(0);
  const attemptsRef = useRef(0);
  const [frames, setFrames] = useState<string[]>(starterFramesFor(initialStep, 0));
  const [step, setStep] = useState<StepId>(initialStep);
  const [turns, setTurns] = useState<Turn[]>(
    initialTurns.length > 0 ? initialTurns : [greetingTurn(initialStep)],
  );
  const [totals, setTotals] = useState<ScoreTotals>(EMPTY_TOTALS);
  const [stagesDone, setStagesDone] = useState(0);
  const [evidence, setEvidence] = useState<LiveEvidence | null>(null);
  const [evidenceByConstruct, setEvidenceByConstruct] = useState<EvidenceByConstruct>({});
  const [completed, setCompleted] = useState(false);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const [banner, setBanner] = useState<{ kind: "advance" | "error"; text: string } | null>(
    null,
  );

  const current = useMemo(
    () => customProblem ?? problems.find((p) => p.id === problemId) ?? problems[0],
    [customProblem, problems, problemId],
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
    stageRef.current = 0;
    attemptsRef.current = 0;
    setStep(nextStep);
    setTurns([greetingTurn(nextStep)]);
    setTotals(EMPTY_TOTALS);
    setStagesDone(0);
    setEvidence(null);
    setEvidenceByConstruct({});
    setCompleted(false);
    setDone(false);
    setBanner(null);
    setFrames(starterFramesFor(nextStep, 0));
  }

  function recordEvidence(
    construct: ConstructId,
    delta: number,
    quote: string,
    rationale: string,
  ) {
    setEvidence({ quote, topConstruct: construct, topDelta: delta, rationale });
    setEvidenceByConstruct((prev) => ({ ...prev, [construct]: { quote, rationale } }));
  }

  function pickLevel(level: Level) {
    const first = problems.find((p) => p.level === level);
    if (!first) return;
    setCustomProblem(null);
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

  function handleUpload(file: File) {
    const imageUrl = URL.createObjectURL(file);
    setCustomProblem({
      id: "custom-photo",
      level: "내 문제",
      topic: "내가 올린 문제",
      englishStatement: "",
      koreanSupport: "",
      coaching: GENERIC_COACHING,
      imageUrl,
    });
    resetSession();
    setStarted(true);
  }

  function handleStudentSubmit(content: string) {
    const studentTurnId = crypto.randomUUID();
    setTurns((prev) => [...prev, { id: studentTurnId, speaker: "student", content }]);

    // ── scripted demo: content-aware engine, no API, runs client-side ─────
    if (scripted) {
      startTransition(async () => {
        await delay(650); // let the typing indicator breathe — sells "AI thinking"
        const out = evaluate(
          step,
          stageRef.current,
          attemptsRef.current,
          content,
          current.coaching,
        );

        setTurns((prev) => [
          ...prev,
          { id: crypto.randomUUID(), speaker: "coach", content: out.reply },
        ]);

        if (out.delta > 0 || out.englishDelta > 0) {
          applyScore({
            [out.construct]: out.delta,
            english: out.englishDelta,
          } as Record<ConstructId, number>);
        }
        if (out.recordEvidence) {
          recordEvidence(out.construct, out.delta, truncateQuote(content), out.rationale);
        }

        if (!out.advanceStage) {
          // Stuck — scaffold shown, stay on this stage for one more try.
          attemptsRef.current += 1;
          setBanner(null);
          return;
        }

        // A stage was cleared — advance the profile-completion gauge.
        setStagesDone((n) => Math.min(TOTAL_DIALOGUE_STAGES, n + 1));

        if (out.completeStep && step < TOTAL_STEPS) {
          const next = (step + 1) as StepId;
          stageRef.current = 0;
          attemptsRef.current = 0;
          setStep(next);
          setTurns((prev) => [...prev, greetingTurn(next)]);
          setFrames(starterFramesFor(next, 0));
          setBanner({
            kind: "advance",
            text: `${stepById(step).englishLabel} 완료 — 다음 단계로`,
          });
        } else if (out.completeStep && step === TOTAL_STEPS) {
          setBanner({ kind: "advance", text: "진단 완료!" });
          setCompleted(true);
        } else {
          stageRef.current += 1;
          attemptsRef.current = 0;
          setFrames(starterFramesFor(step, stageRef.current));
          setBanner(null);
        }
      });
      return;
    }

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
          setStagesDone((n) => Math.min(TOTAL_DIALOGUE_STAGES, n + 1));
          const top = topMovedConstruct(res.score.construct_deltas);
          if (top) {
            recordEvidence(
              top.id,
              top.delta,
              res.score.evidence_quote,
              res.score.rationale,
            );
          }
        }

        if (res.advance && step < TOTAL_STEPS) {
          const next = (step + 1) as StepId;
          setStep(next);
          setTurns((prev) => [...prev, greetingTurn(next)]);
          setFrames(starterFramesFor(next, 0));
          setBanner({
            kind: "advance",
            text: `${stepById(step).englishLabel} 완료 — 다음 단계로`,
          });
        } else if (res.advance && step === TOTAL_STEPS) {
          setBanner({ kind: "advance", text: "진단 완료!" });
          setCompleted(true);
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
    setTotals((prev) => {
      const next: ScoreTotals = { ...prev };
      for (const key of Object.keys(deltas) as ConstructId[]) {
        next[key] = (next[key] ?? 0) + (deltas[key] ?? 0);
      }
      return next;
    });
  }

  if (!started) {
    return (
      <DiagnosticIntro onStart={() => setStarted(true)} onUploadStart={handleUpload} />
    );
  }

  if (recap) {
    return (
      <RecapView
        coaching={current.coaching}
        evidenceByConstruct={evidenceByConstruct}
        onBack={() => setRecap(false)}
      />
    );
  }

  if (done) {
    return (
      <DiagnosticResult
        totals={totals}
        evidenceByConstruct={evidenceByConstruct}
        onRestart={() => resetSession()}
        onRecap={() => setRecap(true)}
      />
    );
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

      <p className="mb-4 rounded-2xl border border-accent/20 bg-accent-soft/30 px-4 py-2.5 text-[13px] leading-relaxed text-ink/75">
        <span className="font-semibold text-accent">AI가 답을 내는 시대</span> — 우리는
        정답이 아니라 ‘어떻게 생각하는지’를 봅니다.
      </p>

      {enablePicker && !customProblem && availableLevels.length > 1 && (
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
        imageUrl={customProblem?.imageUrl}
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

      {/* Anticipation gauge + combo tally — wow that builds every turn. */}
      <div className="mt-5 space-y-3">
        <ProfileGauge
          percent={(stagesDone / TOTAL_DIALOGUE_STAGES) * 100}
        />
        <DetectedTally totals={totals} justDetected={evidence?.topConstruct ?? null} />
      </div>

      <div className="mt-4">
        <ChatPanel
          turns={turns}
          onStudentSubmit={handleStudentSubmit}
          disabled={pending || completed}
          pending={pending}
          frames={frames}
        />
      </div>

      {evidence && (
        <div className="mt-4">
          <LiveEvidenceCard evidence={evidence} />
        </div>
      )}

      {/* On completion, a thumb-reachable CTA to the result reveal. */}
      {completed && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-paper/95 px-4 py-3 backdrop-blur-sm sm:px-6">
          <div className="mx-auto max-w-2xl">
            <button
              type="button"
              onClick={() => setDone(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 font-kr text-sm font-semibold text-on-dark transition hover:opacity-90"
            >
              진단 결과 보기
              <span className="font-mono text-xs">→</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
