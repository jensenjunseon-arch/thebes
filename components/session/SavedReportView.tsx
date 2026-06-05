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

// Renders a SAVED report (from the account or localStorage). Fully unlocked only
// for active subscribers; otherwise the paywall gate is shown (with the recap
// still reachable). The English recap toggle sits on top.
export function SavedReportView({
  totals,
  evidence,
  coaching,
  unlocked = false,
}: {
  totals: Record<ConstructId, number>;
  evidence: EvidenceByConstruct;
  coaching: Coaching;
  unlocked?: boolean;
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
      coaching={coaching}
      unlocked={unlocked}
      onRecap={() => setRecap(true)}
      onRestart={() => router.push("/session/demo")}
    />
  );
}
