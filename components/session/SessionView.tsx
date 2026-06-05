"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { StepIndicator } from "@/components/session/StepIndicator";
import { ChatPanel, type Turn } from "@/components/session/ChatPanel";
import { ProblemChip } from "@/components/session/ProblemChip";
import { LiveEvidenceCard, type LiveEvidence } from "@/components/session/LiveEvidenceCard";
import { DiagnosticIntro } from "@/components/session/DiagnosticIntro";
import { RecapView } from "@/components/session/RecapView";
import {
  DiagnosticResult,
  type EvidenceByConstruct,
} from "@/components/session/DiagnosticResult";

type ScoreTotals = Record<ConstructId, number>;

// The diagnostic asks 5 questions total (Step 1: 3, Step 2: 2) — drives the
// progress rail.
const TOTAL_DIALOGUE_STAGES = 5;

import { TOTAL_STEPS, stepById, type StepId } from "@/lib/steps";
import { submitTurn } from "@/app/session/[id]/actions";
import {
  evaluate,
  starterFramesFor,
  exampleAnswersFor,
} from "@/lib/diagnosticEngine";
import { LEVELS, type Level, type PublicProblem } from "@/lib/problems";
import {
  saveResult,
  getLatestResult,
  type DiagnosticRecord,
} from "@/lib/resultStore";
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
  // Phase 0 intro gate — skipped when resuming a session with history.
  const [started, setStarted] = useState(initialTurns.length > 0);
  // English recap phase (reached from the result screen).
  const [recap, setRecap] = useState(false);
  // Dialogue-engine cursor: which stage of the step, and retries on that stage.
  const stageRef = useRef(0);
  const attemptsRef = useRef(0);
  const [frames, setFrames] = useState<string[]>(starterFramesFor(initialStep, 0));
  const [examples, setExamples] = useState<string[]>(exampleAnswersFor(initialStep, 0));
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
  // Persistence + "see your last report".
  const savedRef = useRef(false);
  const [savedView, setSavedView] = useState<DiagnosticRecord | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  useEffect(() => setHasSaved(!!getLatestResult()), []);
  const [pending, startTransition] = useTransition();
  const [banner, setBanner] = useState<{ kind: "advance" | "error"; text: string } | null>(
    null,
  );
  // First-detection micro-celebration — fires once, the moment the AI catches
  // the student's first real thinking signal. Cleared on their next message.
  const firstDetectRef = useRef(false);
  const [celebrate, setCelebrate] = useState(false);

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

  // Persist the finished result (localStorage) and reveal it. Saved once per run.
  function goToResult() {
    if (!savedRef.current) {
      saveResult({
        at: Date.now(),
        topic: current.topic,
        level: String(current.level),
        totals,
        evidence: evidenceByConstruct,
        coaching: current.coaching,
      });
      savedRef.current = true;
      setHasSaved(true);
    }
    setDone(true);
  }

  function viewSaved() {
    const r = getLatestResult();
    if (!r) return;
    setSavedView(r);
    setStarted(true);
  }

  function resetSession(nextStep: StepId = 1) {
    savedRef.current = false;
    setSavedView(null);
    stageRef.current = 0;
    attemptsRef.current = 0;
    setStep(nextStep);
    setTurns([greetingTurn(nextStep)]);
    setTotals(EMPTY_TOTALS);
    setEvidence(null);
    setEvidenceByConstruct({});
    setCompleted(false);
    setDone(false);
    setBanner(null);
    setFrames(starterFramesFor(nextStep, 0));
    setExamples(exampleAnswersFor(nextStep, 0));
    setStagesDone(0);
    firstDetectRef.current = false;
    setCelebrate(false);
  }

  function recordEvidence(
    construct: ConstructId,
    delta: number,
    quote: string,
    rationale: string,
  ) {
    setEvidence({ quote, topConstruct: construct, topDelta: delta, rationale });
    setEvidenceByConstruct((prev) => ({ ...prev, [construct]: { quote, rationale } }));
    if (!firstDetectRef.current) {
      firstDetectRef.current = true;
      setCelebrate(true);
    }
  }

  function pickLevel(level: Level) {
    const first = problems.find((p) => p.level === level);
    if (!first) return;
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

  function handleStudentSubmit(content: string, usedExample = false) {
    setCelebrate(false);
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

        // A clicked example earns the thinking credit but NO English-expression
        // credit — if the student only ever clicks, the report shows writing as
        // the gap (they never composed a sentence themselves).
        const englishDelta = usedExample ? 0 : out.englishDelta;
        if (out.delta > 0 || englishDelta > 0) {
          applyScore({
            [out.construct]: out.delta,
            english: englishDelta,
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

        // A question was cleared — advance the progress rail.
        setStagesDone((n) => Math.min(TOTAL_DIALOGUE_STAGES, n + 1));

        if (out.completeStep && step < TOTAL_STEPS) {
          const next = (step + 1) as StepId;
          stageRef.current = 0;
          attemptsRef.current = 0;
          setStep(next);
          setTurns((prev) => [...prev, greetingTurn(next)]);
          setFrames(starterFramesFor(next, 0));
          setExamples(exampleAnswersFor(next, 0));
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
          setExamples(exampleAnswersFor(step, stageRef.current));
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
          const deltas = { ...res.score.construct_deltas };
          if (usedExample) deltas.english = 0; // clicked example → no writing credit
          applyScore(deltas);
          setStagesDone((n) => Math.min(TOTAL_DIALOGUE_STAGES, n + 1));
          const top = topMovedConstruct(deltas);
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
          setExamples(exampleAnswersFor(next, 0));
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
      <DiagnosticIntro
        onStart={() => setStarted(true)}
        hasSaved={hasSaved}
        onViewSaved={viewSaved}
      />
    );
  }

  if (recap) {
    return (
      <RecapView
        coaching={savedView?.coaching ?? current.coaching}
        evidenceByConstruct={savedView?.evidence ?? evidenceByConstruct}
        onBack={() => setRecap(false)}
      />
    );
  }

  // Viewing a previously saved result (retention hook).
  if (savedView) {
    return (
      <DiagnosticResult
        totals={savedView.totals}
        evidenceByConstruct={savedView.evidence}
        coaching={savedView.coaching}
        level={savedView.level}
        onRestart={() => resetSession()}
        onRecap={() => setRecap(true)}
      />
    );
  }

  if (done) {
    return (
      <DiagnosticResult
        totals={totals}
        evidenceByConstruct={evidenceByConstruct}
        coaching={current.coaching}
        level={String(current.level)}
        onRestart={() => resetSession()}
        onRecap={() => setRecap(true)}
        feedback={
          sessionId === null ? { topic: current.topic, level: String(current.level) } : undefined
        }
      />
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-4 sm:px-6">
      {/* One-screen work area: problem pinned at top, chat fills the middle and
          scrolls internally, the input stays at the bottom — so a phone never
          has to scroll up and down between the problem and the answer. */}
      <div className="flex h-[calc(100dvh-64px)] flex-col pt-3">
        <div className="shrink-0">
          <ProblemChip
            topic={current.topic}
            difficulty={current.level}
            englishStatement={current.englishStatement}
            koreanSupport={current.koreanSupport}
            pickerEnabled={enablePicker}
            levels={availableLevels}
            onPickLevel={(lv) => pickLevel(lv as Level)}
            onShuffle={shuffleWithinLevel}
            canShuffle={problems.filter((p) => p.level === current.level).length > 1}
          />
        </div>

        <div className="mt-3 shrink-0">
          <StepIndicator
            activeStep={step}
            stagesDone={stagesDone}
            totalStages={TOTAL_DIALOGUE_STAGES}
          />
        </div>

        {banner && (
          <div
            className={cn(
              "mt-3 shrink-0 rounded-2xl border px-4 py-2.5 text-sm font-medium",
              banner.kind === "advance"
                ? "border-accent/40 bg-accent-soft/60 text-accent"
                : "border-ink/20 bg-paper-2 text-ink/75",
            )}
          >
            {banner.text}
          </div>
        )}

        <div className="mt-3 min-h-0 flex-1">
          <ChatPanel
            turns={turns}
            onStudentSubmit={handleStudentSubmit}
            disabled={pending || completed}
            pending={pending}
            frames={frames}
            examples={examples}
            afterTurns={
              evidence ? (
                <div className="space-y-3 pt-1">
                  {celebrate && (
                    <div className="animate-pop flex items-center gap-3 rounded-2xl border border-accent/45 bg-accent-soft/60 px-4 py-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent font-mono text-base font-bold text-on-dark">
                        1
                      </span>
                      <div className="break-keep">
                        <p className="font-kr text-sm font-semibold text-ink">
                          첫 사고력이 감지됐어요
                        </p>
                        <p className="mt-0.5 font-kr text-[12.5px] leading-relaxed text-ink/60">
                          방금 한 말에서 AI가 생각의 신호를 잡았어요 — 이대로 계속 가볼까요?
                        </p>
                      </div>
                    </div>
                  )}
                  <LiveEvidenceCard evidence={evidence} />
                </div>
              ) : null
            }
          />
        </div>
      </div>

      {/* On completion, a thumb-reachable CTA to the result reveal. */}
      {completed && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-paper/95 px-4 py-3 backdrop-blur-sm sm:px-6">
          <div className="mx-auto max-w-2xl">
            <button
              type="button"
              onClick={goToResult}
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
