import { POLYA_STEPS, TOTAL_STEPS, type StepId } from "@/lib/steps";
import { cn } from "@/lib/cn";

interface Props {
  activeStep: StepId;
}

// Compact 2-step progress. Mobile-first: a thin progress rail + the current
// step's label, so students always see where they are and how far is left.
export function StepIndicator({ activeStep }: Props) {
  const current = POLYA_STEPS[activeStep - 1];

  return (
    <div>
      <div className="flex items-center gap-3">
        {POLYA_STEPS.map((step) => {
          const state =
            step.id < activeStep ? "done" : step.id === activeStep ? "active" : "future";
          return (
            <span
              key={step.id}
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
      </div>
      <p className="mt-1 text-sm leading-relaxed text-ink/55">{current.studentHint}</p>
    </div>
  );
}
