"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getUnsyncedResults, markResultsSynced } from "@/lib/resultStore";
import { CONSTRUCTS, type ConstructId } from "@/lib/constructs";

const SESSION_MAX = 6;

function composite(totals: Record<ConstructId, number>): number {
  const sum = CONSTRUCTS.reduce(
    (s, c) => s + Math.min(SESSION_MAX, totals?.[c.id] ?? 0),
    0,
  );
  return Math.round((sum / (CONSTRUCTS.length * SESSION_MAX)) * 100);
}

// Mounted globally. Captures locally-saved diagnostic results into the user's
// account (diagnostic_results) once they're authenticated — the localStorage →
// account bridge that turns a signup into a kept report. Cheap no-op when there's
// nothing pending (the common case), so it adds no network cost to normal loads.
export function ResultSync() {
  useEffect(() => {
    const pending = getUnsyncedResults();
    if (pending.length === 0) return;
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
      return;

    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (cancelled || !user) return;

        const rows = pending.map((r) => ({
          user_id: user.id,
          topic: r.topic,
          level: r.level,
          ai_talent_index: composite(r.totals),
          totals: r.totals,
          evidence: r.evidence,
          coaching: r.coaching,
        }));

        const { error } = await supabase.from("diagnostic_results").insert(rows);
        if (!error && !cancelled) markResultsSynced(pending.map((r) => r.at));
      } catch {
        // non-fatal — will retry on the next authenticated load
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
