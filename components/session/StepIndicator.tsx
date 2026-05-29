import { POLYA_STEPS, type StepId } from "@/lib/steps";
import { cn } from "@/lib/cn";

interface Props {
  activeStep: StepId;
}

// Linear progress through the 4 Pólya steps. The current step is bold; passed
// steps are muted but visible; future steps are visible-but-dim. Students
// should always see the whole path — the structure is the point.
export function StepIndicator({ activeStep }: Props) {
  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-4">
      {POLYA_STEPS.map((step) => {
        const state =
          step.id < activeStep
            ? "done"
            : step.id === activeStep
              ? "active"
              : "future";

        return (
          <li
            key={step.id}
            className={cn(
              "rounded-2xl border px-4 py-3 transition",
              state === "active" &&
                "border-accent bg-paper-2 shadow-[0_2px_0_0_rgba(181,65,27,0.25)]",
              state === "done" && "border-ink/15 bg-paper text-ink/60",
              state === "future" && "border-ink/10 bg-paper text-ink/35",
            )}
          >
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] uppercase tracking-tighter2">
                Step 0{step.id}
              </span>
              {state === "active" && (
                <span className="font-mono text-[10px] uppercase tracking-tighter2 text-accent">
                  now
                </span>
              )}
            </div>
            <div className="mt-1 font-serif text-xl italic">
              {step.englishLabel}
            </div>
            <div className="mt-1 text-xs text-ink/60">{step.koreanSupport}</div>
          </li>
        );
      })}
    </ol>
  );
}
