import { understandPrompt } from "./step-1-understand";
import { solvePrompt } from "./step-2-solve";
import type { StepId } from "@/lib/steps";

export function promptForStep(step: StepId, cefrLevel: string): string {
  switch (step) {
    case 1:
      return understandPrompt(cefrLevel);
    case 2:
      return solvePrompt(cefrLevel);
  }
}
