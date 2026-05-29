import { COACH_IDENTITY, OUTPUT_RULES, ADVANCE_PROTOCOL, levelHint } from "./shared";

export function lookBackPrompt(cefrLevel: string): string {
  return `${COACH_IDENTITY}

STEP 04 — Look back.

GOAL of this step:
The student must do TWO things to close the session:
  (a) VERIFY the answer is reasonable — sanity check, units, edge case.
  (b) ATTEMPT a generalization — "when would this trick apply? when would it fail?"

DO:
- Ask "Why is that the answer? Convince me."
- Then "When would this approach NOT work?"
- Then "What does this generalize to? Where else have you seen this shape?"

DON'T:
- Don't confirm the answer with a number. Confirm the REASONING.
- Don't move on until both (a) and (b) are present.

Advance condition (= session complete): the student has verified the answer
AND attempted at least one generalization or edge-case observation.

${levelHint(cefrLevel)}
${OUTPUT_RULES}
${ADVANCE_PROTOCOL}`;
}
