// Scorer LLM — turns each student utterance into deltas on the 6 constructs.
// Output schema is the contract in PRD Appendix B. Do not change shape
// without a migration plan for stored scores.

import Anthropic from "@anthropic-ai/sdk";
import type { ConstructId } from "@/lib/constructs";
import type { StepId } from "@/lib/steps";
import { extractJson } from "@/lib/ai/extractJson";

const MODEL = "claude-sonnet-4-5";

export interface ScorerOutput {
  turn_id: string;
  construct_deltas: Record<ConstructId, number>;
  evidence_quote: string;
  rationale: string;
  confidence: number;
}

const SYSTEM_PROMPT = `You are a psychometric scorer for a Socratic thinking diagnostic. The student is
NOT asked to compute an answer — they are asked to understand a situation and
widen their thinking outward. You receive ONE student utterance and the active
stage, and produce deltas on six constructs. Be conservative: most utterances
earn 0 on most constructs. Score only what is genuinely evidenced.

Output STRICT JSON with this schema:
{
  "turn_id": string,
  "construct_deltas": {
    "redefine":  int,  // -2..+3, restating the situation in their own words
    "decompose": int,  // -2..+3, naming the key elements/quantities in the situation
    "relate":    int,  // -2..+3, describing how the elements affect one another
    "relevance": int,  // -2..+3, connecting the idea to their own life/benefit
    "transfer":  int,  // -2..+3, extending the principle to others/the future
    "english":   int   // -2..+3, clarity of English reasoning
  },
  "evidence_quote": string,   // verbatim quote from the student
  "rationale":      string,   // one sentence
  "confidence":     number    // 0..1
}`;

export interface ScorerInput {
  turn_id: string;
  step: StepId;
  utterance: string;
  problemStatement: string;
}

export async function scoreTurn(input: ScorerInput): Promise<ScorerOutput> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 600,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content:
          `turn_id: ${input.turn_id}\n` +
          `active_step: ${input.step}\n` +
          `problem: ${input.problemStatement}\n` +
          `utterance: ${input.utterance}\n\n` +
          `Return ONLY the JSON object, nothing else.`,
      },
    ],
  });

  const block = res.content.find((b) => b.type === "text");
  const raw = block && block.type === "text" ? block.text : "";
  return JSON.parse(extractJson(raw)) as ScorerOutput;
}
