"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getLatestResult } from "@/lib/resultStore";
import { SavedReportView } from "@/components/session/SavedReportView";
import type { ConstructId } from "@/lib/constructs";
import type { Coaching } from "@/lib/problems";
import type { EvidenceByConstruct } from "@/components/session/DiagnosticResult";

interface Picked {
  totals: Record<ConstructId, number>;
  evidence: EvidenceByConstruct;
  coaching: Coaching;
}

export default function ReportPage() {
  const [state, setState] = useState<"loading" | "ready" | "empty">("loading");
  const [data, setData] = useState<Picked | null>(null);
  // Full report unlocks only for active subscribers.
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let picked: Picked | null = null;

      // 1) Source of truth for a signed-in user: their account (RLS own-rows).
      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        try {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            const { data: rows } = await supabase
              .from("diagnostic_results")
              .select("totals, evidence, coaching")
              .order("created_at", { ascending: false })
              .limit(1);
            if (rows && rows[0]) {
              picked = {
                totals: rows[0].totals as Record<ConstructId, number>,
                evidence: rows[0].evidence as EvidenceByConstruct,
                coaching: rows[0].coaching as Coaching,
              };
            }
            // Test period: any signed-in user gets the full report (no paywall).
            if (!cancelled) setUnlocked(true);
          }
        } catch {
          /* fall through to local */
        }
      }

      // 2) Fallback (instant, same-device): the most recent local result.
      if (!picked) {
        const local = getLatestResult();
        if (local) {
          picked = { totals: local.totals, evidence: local.evidence, coaching: local.coaching };
        }
      }

      if (cancelled) return;
      if (picked) {
        setData(picked);
        setState("ready");
      } else {
        setState("empty");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading") {
    return (
      <main className="grid min-h-dvh place-items-center bg-paper px-6 text-ink">
        <p className="animate-pulse font-mono text-[12px] uppercase tracking-tighter2 text-ink/40">
          리포트 불러오는 중…
        </p>
      </main>
    );
  }

  if (state === "empty") {
    return (
      <main className="grid min-h-dvh place-items-center bg-paper px-6 text-center text-ink">
        <div className="max-w-sm break-keep">
          <p className="font-mono text-[11px] uppercase tracking-tighter2 text-accent">
            AI Talent Report
          </p>
          <h1 className="mt-2 font-kr text-2xl font-bold tracking-tighter2">
            아직 저장된 리포트가 없어요
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink/60">
            5분이면 첫 진단이 끝나고, 결과가 여기에 저장됩니다.
          </p>
          <Link
            href="/session/demo"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 font-kr text-sm font-semibold text-on-dark transition hover:bg-accent"
          >
            무료로 진단 시작 →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-paper pt-6 text-ink">
      {data && (
        <SavedReportView
          totals={data.totals}
          evidence={data.evidence}
          coaching={data.coaching}
          unlocked={unlocked}
        />
      )}
    </main>
  );
}
