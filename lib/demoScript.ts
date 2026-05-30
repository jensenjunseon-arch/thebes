// Scripted demo engine — runs the diagnostic with ZERO API calls.
//
// For a pre-launch demo we don't want to spend Anthropic credits. This script
// drives a believable Socratic session entirely client-side: each student
// submission advances one "beat" with a pre-authored coach reply and score
// deltas. The wow still lands because the live evidence card quotes the
// student's ACTUAL words — only the coach's reply + the score are scripted.
//
// The 6 beats (3 per step) touch all six constructs and end the diagnostic.

import type { ConstructId } from "@/lib/constructs";
import type { StepId } from "@/lib/steps";

export interface ScriptBeat {
  coachReply: string;
  deltas: Partial<Record<ConstructId, number>>;
  evidenceConstruct: ConstructId;
  rationale: string;
  advance: boolean;
}

export const DEMO_SCRIPT: Record<StepId, ScriptBeat[]> = {
  1: [
    {
      coachReply:
        "Good — you said it in your own words instead of copying the problem. Now: what are you assuming that the problem doesn't state outright?",
      deltas: { redefine: 4, english: 1 },
      evidenceConstruct: "redefine",
      rationale: "문제를 그대로 베끼지 않고 자기 언어로 다시 진술했어요.",
      advance: false,
    },
    {
      coachReply:
        "Nice — naming that assumption out loud is exactly what strong problem-solvers do. Is there more than one way you could approach this?",
      deltas: { assume: 3 },
      evidenceConstruct: "assume",
      rationale: "숨어 있던 전제를 의식적으로 드러냈어요.",
      advance: false,
    },
    {
      coachReply:
        "That's a clear plan. You reframed the problem, surfaced an assumption, and chose a path — that's the whole first stage. Let's actually solve it now.",
      deltas: { paths: 4, english: 1 },
      evidenceConstruct: "paths",
      rationale: "한 가지 이상의 접근을 떠올리고 방향을 정했어요.",
      advance: true,
    },
  ],
  2: [
    {
      coachReply:
        "Walk me through why that first step follows. What lets you do that?",
      deltas: { logic: 3 },
      evidenceConstruct: "logic",
      rationale: "단계 사이를 비약 없이 근거로 연결했어요.",
      advance: false,
    },
    {
      coachReply:
        "Good — no jumps there. When you reach an answer, how could you check it a different way?",
      deltas: { logic: 2 },
      evidenceConstruct: "logic",
      rationale: "다음 단계를 앞 단계의 결론 위에 쌓았어요.",
      advance: false,
    },
    {
      coachReply:
        "Excellent — checking your answer another way is the habit most students skip. You just ran a full Pólya cycle. That's the diagnostic done!",
      deltas: { verify: 6, english: 1 },
      evidenceConstruct: "verify",
      rationale: "답을 다른 방법으로 점검하려고 시도했어요.",
      advance: true,
    },
  ],
};

// Pick the beat for a given step + how many times the student has submitted in
// that step (clamped to the last beat).
export function beatFor(step: StepId, submitCount: number): ScriptBeat {
  const beats = DEMO_SCRIPT[step];
  return beats[Math.min(submitCount, beats.length - 1)];
}
