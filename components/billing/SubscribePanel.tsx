"use client";

import { useState } from "react";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import { PLAN, formatKRW, customerKeyFor } from "@/lib/billing/plan";

export function SubscribePanel({ userId, email }: { userId: string; email: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

  async function start() {
    if (!clientKey) {
      setError("결제 설정이 필요해요. (NEXT_PUBLIC_TOSS_CLIENT_KEY 미설정)");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const toss = await loadTossPayments(clientKey);
      // Opens Toss card registration, then redirects to successUrl with
      // ?authKey & ?customerKey. The page navigates away on success.
      await toss.requestBillingAuth("카드", {
        customerKey: customerKeyFor(userId),
        successUrl: `${window.location.origin}/api/billing/confirm`,
        failUrl: `${window.location.origin}/billing?error=auth_canceled`,
        customerEmail: email || undefined,
      });
    } catch {
      setError("결제 창을 여는 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.");
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md break-keep px-5 pb-24 pt-8 sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-tighter2 text-accent">
        Subscription · 월 구독
      </p>
      <h1 className="mt-3 font-kr text-2xl font-bold tracking-tighter2">
        매달, 사고력이 자라는 코칭
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink/65">
        정답이 아니라 ‘어떻게 생각하는지’를 매주 진단하고, 성장 리포트로 돌려드립니다.
      </p>

      <div className="mt-7 rounded-3xl border border-ink/10 bg-paper-2 p-6">
        <div className="flex items-baseline justify-between">
          <span className="font-kr text-base font-semibold">{PLAN.name}</span>
          <span className="font-mono text-[12px] uppercase tracking-tighter2 text-ink/45">
            월 자동결제
          </span>
        </div>
        <div className="mt-3 flex items-end gap-1.5">
          <span className="font-sans text-4xl font-bold tracking-tight">
            {formatKRW(PLAN.amount)}
          </span>
          <span className="mb-1 font-kr text-sm text-ink/50">/ 월</span>
        </div>
        <ul className="mt-5 space-y-2 text-[14px] leading-relaxed text-ink/70">
          <li>· 주간 사고력 진단 + AI 인재 리포트</li>
          <li>· 영어로 사고하는 훈련 (전 영역 6가지)</li>
          <li>· 언제든 해지 — 다음 결제일 전까지 이용</li>
        </ul>

        <button
          type="button"
          onClick={start}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 font-kr text-base font-semibold text-on-dark transition hover:bg-accent disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? "결제 창 여는 중…" : "카드 등록하고 구독 시작"}
          <span className="font-mono text-sm">→</span>
        </button>

        {error && (
          <p className="mt-3 text-center text-[13px] leading-relaxed text-accent">{error}</p>
        )}
        <p className="mt-3 text-center text-[12px] leading-relaxed text-ink/45">
          카드 정보는 Toss Payments가 안전하게 처리하며, 서버에 저장되지 않아요.
        </p>
      </div>
    </section>
  );
}
