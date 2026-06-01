"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DiagnosticResult,
  type EvidenceByConstruct,
} from "@/components/session/DiagnosticResult";
import { RecapView } from "@/components/session/RecapView";
import type { ConstructId } from "@/lib/constructs";
import type { Coaching } from "@/lib/problems";

// Renders a SAVED report (from the account or localStorage) as the full report —
// unlocked (no signup gate, since it's already theirs), with the English recap.
export function SavedReportView({
  totals,
  evidence,
  coaching,
}: {
  totals: Record<ConstructId, number>;
  evidence: EvidenceByConstruct;
  coaching: Coaching;
}) {
  const router = useRouter();
  const [recap, setRecap] = useState(false);

  if (recap) {
    return (
      <RecapView
        coaching={coaching}
        evidenceByConstruct={evidence}
        onBack={() => setRecap(false)}
      />
    );
  }

  return (
    <DiagnosticResult
      totals={totals}
      evidenceByConstruct={evidence}
      unlocked
      onRecap={() => setRecap(true)}
      onRestart={() => router.push("/session/demo")}
    />
  );
}
