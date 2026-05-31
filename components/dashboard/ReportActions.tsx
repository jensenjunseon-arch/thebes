"use client";

import { CONSTRUCTS, type ConstructId } from "@/lib/constructs";

// The report payload — also the exact shape that powers a ChatGPT Action / Claude
// MCP connector later (one clean JSON document describing the AI 인재 리포트).
export interface ReportData {
  generatedAt: string;
  weekLabel: string;
  sessionCount: number;
  currentTotals: Record<ConstructId, number>;
  prevTotals: Record<ConstructId, number>;
  evidence: { construct: ConstructId; quote: string; rationale: string }[];
}

export function ReportActions({ data }: { data: ReportData }) {
  function downloadJson() {
    // A self-describing report document — feed this to ChatGPT/Claude.
    const doc = {
      product: "Thebes AI — AI 인재 리포트",
      generatedAt: data.generatedAt,
      weekLabel: data.weekLabel,
      sessionCount: data.sessionCount,
      constructs: CONSTRUCTS.map((c) => ({
        id: c.id,
        name: c.koreanName,
        english: c.englishName,
        definition: c.definition,
        thisWeek: data.currentTotals[c.id] ?? 0,
        lastWeek: data.prevTotals[c.id] ?? 0,
      })),
      evidence: data.evidence.map((e) => ({
        construct: e.construct,
        quote: e.quote,
        rationale: e.rationale,
      })),
    };
    const blob = new Blob([JSON.stringify(doc, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `thebes-ai-report-${data.weekLabel.replace(/[^\w]/g, "")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="lp-no-print mt-6 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 font-kr text-sm font-semibold text-on-dark transition hover:bg-accent"
      >
        <span aria-hidden>⤓</span> 리포트 PDF로 받기
      </button>
      <button
        type="button"
        onClick={downloadJson}
        className="inline-flex items-center gap-2 rounded-xl border border-ink/15 bg-paper px-4 py-2.5 font-kr text-sm font-medium text-ink/75 transition hover:border-accent/50"
      >
        <span aria-hidden className="font-mono">{"{ }"}</span> 데이터(JSON) 내보내기
      </button>
    </div>
  );
}
