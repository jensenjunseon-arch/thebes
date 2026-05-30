"use server";

import { tutorReply, type TutorMessage } from "@/lib/ai/tutor";
import { scoreTurn, type ScorerOutput } from "@/lib/ai/scorer";
import { DEMO_CEFR_LEVEL } from "@/lib/demo";
import { getProblemById, DEFAULT_PROBLEM } from "@/lib/problems";
import { type StepId, TOTAL_STEPS } from "@/lib/steps";
import {
  insertTurn,
  insertScores,
  advanceSession,
  completeSession,
} from "@/lib/supabase/queries";

export interface SubmitTurnInput {
  studentTurnId: string;
  sessionId: string | null; // null = demo mode (no DB)
  step: StepId;
  history: TutorMessage[];
  utterance: string;
  problemId: string;
}

export type SubmitTurnError = "ai_unavailable";

export interface SubmitTurnResult {
  reply: string;
  coachTurnId: string;
  advance: boolean;
  advanceReason: string;
  score: ScorerOutput | null;
  error?: SubmitTurnError;
}

export async function submitTurn(
  input: SubmitTurnInput,
): Promise<SubmitTurnResult> {
  const history: TutorMessage[] = [
    ...input.history,
    { role: "user", content: input.utterance },
  ];

  // Resolve the active problem server-side so the answer tokens never reach
  // the client. Falls back to the default problem for live DB sessions.
  const problem = getProblemById(input.problemId) ?? DEFAULT_PROBLEM;

  const isLive = input.sessionId !== null && isSupabaseConfigured();

  // Persist student turn before calling LLMs so it's durable even if LLMs fail.
  if (isLive) {
    await insertTurn({
      id: input.studentTurnId,
      session_id: input.sessionId!,
      step: input.step,
      speaker: "student",
      content: input.utterance,
    });
  }

  const [tutorSettled, scoreSettled] = await Promise.allSettled([
    tutorReply({
      step: input.step,
      cefrLevel: DEMO_CEFR_LEVEL,
      problemStatement: problem.englishStatement,
      forbiddenAnswerTokens: problem.forbiddenAnswerTokens,
      history,
    }),
    scoreTurn({
      turn_id: input.studentTurnId,
      step: input.step,
      utterance: input.utterance,
      problemStatement: problem.englishStatement,
    }),
  ]);

  // Graceful degradation: if the tutor LLM call fails (e.g. API key, network,
  // or out of credits), return a structured error instead of throwing — the
  // client shows an accurate, retryable message rather than a vague crash.
  if (tutorSettled.status === "rejected") {
    console.error("[submitTurn] tutor call failed:", tutorSettled.reason);
    return {
      reply: "",
      coachTurnId: crypto.randomUUID(),
      advance: false,
      advanceReason: "",
      score: null,
      error: "ai_unavailable",
    };
  }

  const tutor = tutorSettled.value;
  const score =
    scoreSettled.status === "fulfilled" ? scoreSettled.value : null;

  const coachTurnId = crypto.randomUUID();

  if (isLive) {
    // Fire-and-forget: don't let DB writes block the response to the client.
    void persistCoachTurnAndScore(
      coachTurnId,
      input.sessionId!,
      input.step,
      tutor.message,
      score,
      input.studentTurnId,
      tutor.advance,
    );
  }

  return {
    reply: tutor.message,
    coachTurnId,
    advance: tutor.advance,
    advanceReason: tutor.advanceReason,
    score,
  };
}

// ── helpers ──────────────────────────────────────────────────────────────────

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

async function persistCoachTurnAndScore(
  coachTurnId: string,
  sessionId: string,
  step: StepId,
  content: string,
  score: ScorerOutput | null,
  studentTurnId: string,
  advance: boolean,
): Promise<void> {
  try {
    await insertTurn({
      id: coachTurnId,
      session_id: sessionId,
      step,
      speaker: "ai",
      content,
    });
    if (score) {
      await insertScores(studentTurnId, score);
    }
    if (advance) {
      if (step < TOTAL_STEPS) {
        await advanceSession(sessionId, step);
      } else {
        await completeSession(sessionId);
      }
    }
  } catch (err) {
    // Don't let DB errors surface to the user — the conversation still works.
    console.error("[submitTurn] DB persist error:", err);
  }
}
