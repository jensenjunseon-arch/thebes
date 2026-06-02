"use client";

import { CONSTRUCTS, type ConstructId } from "@/lib/constructs";

export interface LiveEvidence {
  quote: string;
  topConstruct: ConstructId;
  topDelta: number;
  rationale: string;
}

// The wow moment: makes the "AI read my sentence → detected this thinking →
// awarded points" causal chain visible, every scored turn.
export function LiveEvidenceCard({ evidence }: { evidence: LiveEvidence | null }) {
  if (!evidence || evidence.topDelta <= 0) return null;

  const construct = CONSTRUCTS.find((c) => c.id === evidence.topConstruct);
  if (!construct) return null;

  // Compact: the student's sentence is the bubble right above this card, so we
  // don't re-quote it — the causal chain (their bubble ↓ AI detected → construct
  // +points) stays intact while leaving room for the coach's next reply.
  return (
    <div
      key={evidence.quote}
      className="animate-evidence-in rounded-2xl border border-accent/30 bg-accent-soft/40 px-4 py-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-tighter2 text-ink/45">
          ↓ AI가 감지
        </span>
        <span className="rounded-full bg-accent px-3 py-1 font-kr text-[13px] font-semibold text-on-dark">
          {construct.koreanName}
        </span>
        <span className="font-mono text-sm font-semibold text-accent">
          +{evidence.topDelta}
        </span>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-ink/55">{evidence.rationale}</p>
    </div>
  );
}
