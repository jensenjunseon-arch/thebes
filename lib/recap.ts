// End-of-diagnostic English recap. Rule-based (no API): the whole widening-arc
// conversation is woven into ONE clean English paragraph the student traces, and
// each model sentence is paired with what the student actually wrote so they can
// see the gap. TTS (read-aloud / listening) and STT (read-back / speaking) are
// shown as "coming soon" — the trace-write itself is fully functional now.

import type { Coaching } from "@/lib/problems";
import type { ConstructId } from "@/lib/constructs";
import type { EvidenceByConstruct } from "@/components/session/DiagnosticResult";

// Used for student-uploaded photo problems, where we have no per-problem metadata.
export const GENERIC_COACHING: Coaching = {
  summary: "the situation shown in your problem",
  components: "the numbers and conditions the problem gives you",
  relationship: "how those quantities push and pull on each other",
  realWorld: "real choices where the same kind of reasoning applies",
};

export interface RecapSentence {
  label: string;
  construct: ConstructId;
  model: string;
  mine: string | null;
}

export interface Recap {
  paragraph: string;
  sentences: RecapSentence[];
}

function clean(s: string): string {
  return s.replace(/[.\s]+$/, "");
}

export function buildRecap(
  coaching: Coaching,
  evidence: EvidenceByConstruct,
): Recap {
  const rows: Array<{ label: string; construct: ConstructId; model: string }> = [
    {
      label: "문제 재정의",
      construct: "redefine",
      model: `This problem is about ${clean(coaching.summary)}.`,
    },
    {
      label: "구성 요소",
      construct: "decompose",
      model: `The key things that matter are ${clean(coaching.components)}.`,
    },
    {
      label: "관계 파악",
      construct: "relate",
      model: `They are connected — ${clean(coaching.relationship)}.`,
    },
    {
      label: "실생활 연결",
      construct: "relevance",
      model: `Understanding this helps in real life, like ${clean(coaching.realWorld)}.`,
    },
    {
      label: "확장적 사고",
      construct: "transfer",
      model:
        "And if more people learned to think this way, they could make smarter decisions about the world around them.",
    },
  ];

  const sentences: RecapSentence[] = rows.map((r) => ({
    ...r,
    mine: evidence[r.construct]?.quote ?? null,
  }));

  return {
    paragraph: sentences.map((s) => s.model).join(" "),
    sentences,
  };
}

// Word-position match between the student's transcription and the target.
export function traceMatchPercent(input: string, target: string): number {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean);
  const a = norm(input);
  const b = norm(target);
  if (b.length === 0) return 0;
  let matched = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] === b[i]) matched++;
  }
  return Math.round((matched / b.length) * 100);
}
