import { POLYA_STEPS, TOTAL_STEPS, type StepId } from "@/lib/steps";
import { cn } from "@/lib/cn";

interface Props {
  activeStep: StepId;
  // How many of the diagnostic's questions are done, and how many there are.
  stagesDone: number;
  totalStages: number;
}

// Progress device: a per-question rail (how far through the whole diagnostic the
// student is) + the current phase label. Mobile-first and compact.
export function StepIndicator({ activeStep, stagesDone, totalStages }: Props) {
  const current = POLYA_STEPS[activeStep - 1];
  const currentQuestion = Math.min(stagesDone + 1, totalStages);

  return (
    <div>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalStages }).map((_, i) => {
          const state = i < stagesDone ? "done" : i === stagesDone ? "active" : "future";
          return (
            <span
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-500",
                state === "done" && "bg-accent/50",
                state === "active" && "bg-accent",
                state === "future" && "bg-ink/12",
              )}
            />
          );
        })}
      </div>

      <div className="mt-2.5 flex items-baseline justify-between gap-3">
        <p className="font-kr text-base font-semibold text-ink">
          {current.englishLabel}
          <span className="ml-2 font-mono text-[11px] uppercase tracking-tighter2 text-ink/40">
            Step {activeStep}/{TOTAL_STEPS}
          </span>
        </p>
        <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink/45">
          질문 {currentQuestion}/{totalStages}
        </span>
      </div>
    </div>
  );
}
