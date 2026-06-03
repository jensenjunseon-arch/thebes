"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PLAN, formatKRW } from "@/lib/billing/plan";
import { cn } from "@/lib/cn";

type Exp = "meh" | "ok" | "great";
type Will = "no" | "maybe" | "yes";

const EXP_OPTS: { value: Exp; label: string }[] = [
  { value: "meh", label: "별로" },
  { value: "ok", label: "괜찮아요" },
  { value: "great", label: "아주 좋아요" },
];

const WILL_OPTS: { value: Will; label: string }[] = [
  { value: "no", label: "아니요" },
  { value: "maybe", label: "고민돼요" },
  { value: "yes", label: "네, 할 것 같아요" },
];

// 30-second validation prompt at the end of the free diagnostic. Stores one row
// in `feedback` (anonymous insert). Never blocks or errors the tester's flow.
export function FeedbackCard({
  topic,
  level,
  score,
}: {
  topic: string;
  level: string;
  score: number;
}) {
  const [exp, setExp] = useState<Exp | null>(null);
  const [will, setWill] = useState<Will | null>(null);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        const supabase = createClient();
        await supabase.from("feedback").insert({
          source: "demo",
          topic,
          level,
          experience: exp,
          willingness: will,
          price: PLAN.amount,
          ai_talent_index: score,
          comment: comment.trim() || null,
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        });
      }
    } catch {
      // Swallow — a tester should never see a backend error.
    }
    setSent(true);
    setBusy(false);
  }

  if (sent) {
    return (
      <div className="mt-10 rounded-3xl border border-accent/30 bg-accent-soft/40 p-6 text-center break-keep">
        <p className="font-kr text-base font-semibold text-ink">고맙습니다! 🙏</p>
        <p className="mt-1.5 font-kr text-sm leading-relaxed text-ink/60">
          남겨주신 한마디가 이 서비스를 더 좋게 만듭니다.
        </p>
      </div>
    );
  }

  const canSend = exp !== null || will !== null;

  return (
    <div className="mt-10 rounded-3xl border border-ink/10 bg-paper-2 p-6 break-keep">
      <p className="font-mono text-[11px] uppercase tracking-tighter2 text-accent">
        30초 · 만든 사람에게
      </p>
      <h3 className="mt-2 font-kr text-lg font-bold tracking-tighter2">
        솔직한 한마디 부탁드려요
      </h3>

      <p className="mt-5 font-kr text-sm font-medium text-ink/75">
        이 진단, 해볼 만했나요?
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {EXP_OPTS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setExp(o.value)}
            className={cn(
              "rounded-xl border py-2.5 font-kr text-[13px] transition",
              exp === o.value
                ? "border-accent bg-accent text-on-dark"
                : "border-ink/15 bg-paper text-ink hover:border-accent/60",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      <p className="mt-5 font-kr text-sm font-medium text-ink/75">
        월 {formatKRW(PLAN.amount)}이면 구독할 것 같나요?
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {WILL_OPTS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setWill(o.value)}
            className={cn(
              "rounded-xl border px-1 py-2.5 font-kr text-[13px] leading-tight transition",
              will === o.value
                ? "border-accent bg-accent text-on-dark"
                : "border-ink/15 bg-paper text-ink hover:border-accent/60",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="개선점이나 느낀 점 (선택)"
        rows={2}
        className="mt-5 w-full resize-none rounded-2xl border border-ink/15 bg-paper px-4 py-3 text-[14px] leading-relaxed outline-none placeholder:text-ink/35 focus:border-accent"
      />

      <button
        type="button"
        onClick={submit}
        disabled={!canSend || busy}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 font-kr text-sm font-semibold text-on-dark transition hover:bg-accent disabled:opacity-40"
      >
        {busy ? "보내는 중…" : "보내기"}
      </button>
    </div>
  );
}
