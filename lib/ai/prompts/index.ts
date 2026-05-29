import { frameItPrompt } from "./step-1-frame";
import { planItPrompt } from "./step-2-plan";
import { workItPrompt } from "./step-3-work";
import { lookBackPrompt } from "./step-4-lookback";
import type { StepId } from "@/lib/steps";

export function promptForStep(step: StepId, cefrLevel: string): string {
  switch (step) {
    case 1:
      return frameItPrompt(cefrLevel);
    case 2:
      return planItPrompt(cefrLevel);
    case 3:
      return workItPrompt(cefrLevel);
    case 4:
      return lookBackPrompt(cefrLevel);
  }
}
