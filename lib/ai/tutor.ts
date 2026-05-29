// Tutor LLM — the conversational coach. Returns a structured turn
// (message + advance signal) so the runtime can decide step transitions.

import Anthropic from "@anthropic-ai/sdk";
import type { StepId } from "@/lib/steps";
import { promptForStep } from "@/lib/ai/prompts";
import { detectAnswerLeak } from "@/lib/ai/answerLeak";
import { extractJson } from "@/lib/ai/extractJson";

const MODEL = "claude-sonnet-4-5";

export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TutorTurnInput {
  step: StepId;
  cefrLevel: string;
  problemStatement: string;
  forbiddenAnswerTokens: ReadonlyArray<string>;
  history: ReadonlyArray<TutorMessage>;
}

export interface TutorTurnOutput {
  message: string;
  advance: boolean;
  advanceReason: string;
}

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

async function callTutor(
  input: TutorTurnInput,
  extraSystem?: string,
): Promise<TutorTurnOutput> {
  const client = getClient();

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 500,
    system: [
      {
        type: "text",
        text: promptForStep(input.step, input.cefrLevel),
        cache_control: { type: "ephemeral" },
      },
      {
        type: "text",
        text: `Problem:\n${input.problemStatement}`,
      },
      ...(extraSystem
        ? [{ type: "text" as const, text: extraSystem }]
        : []),
    ],
    messages: input.history.map((m) => ({ role: m.role, content: m.content })),
  });

  const block = res.content.find((b) => b.type === "text");
  const raw = block && block.type === "text" ? block.text : "";
  const parsed = JSON.parse(extractJson(raw)) as {
    message: string;
    advance: boolean;
    advance_reason: string;
  };
  return {
    message: parsed.message,
    advance: parsed.advance,
    advanceReason: parsed.advance_reason,
  };
}

export async function tutorReply(
  input: TutorTurnInput,
): Promise<TutorTurnOutput> {
  let out = await callTutor(input);

  const leak = detectAnswerLeak(out.message, input.forbiddenAnswerTokens);
  if (leak.leaked) {
    // One retry with an explicit reminder. If it leaks again we'd rather
    // surface that than ship the number — replace with a fallback nudge.
    out = await callTutor(
      input,
      `Your previous draft leaked the answer token "${leak.matched}". ` +
        `Rewrite WITHOUT any specific number from the solution.`,
    );
    const again = detectAnswerLeak(out.message, input.forbiddenAnswerTokens);
    if (again.leaked) {
      return {
        message:
          "Hmm — before you check a number, tell me: what's the unit of what you're computing, and why?",
        advance: false,
        advanceReason: "answer-leak fallback",
      };
    }
  }

  return out;
}
