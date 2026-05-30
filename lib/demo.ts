// Demo/diagnostic constants. The problem pool now lives in lib/problems.ts.
// This module keeps the CEFR level and re-exports the default problem for
// backward compatibility.

import { DEFAULT_PROBLEM, DEFAULT_PROBLEM_ID } from "@/lib/problems";

export { DEFAULT_PROBLEM as DEMO_PROBLEM, DEFAULT_PROBLEM_ID as DEMO_PROBLEM_ID };

// v0: a fixed CEFR level. Real value comes from the diagnostic in a later milestone.
export const DEMO_CEFR_LEVEL = "B1";
