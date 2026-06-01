"use client";

import { useRef } from "react";
import { CONSTRUCTS } from "@/lib/constructs";

// Phase 0 — mobile-first & decision-first. The hook + free CTA sit high so the
// start is one tap away even on a small screen; the proof (live-magic teaser +
// the 6 constructs) sits below for anyone who hesitates and scrolls. break-keep
// keeps Korean wrapping at word boundaries on narrow screens.
export function DiagnosticIntro({
  onStart,
  onUploadStart,
  hasSaved = false,
  onViewSaved,
}: {
  onStart: () => void;
  onUploadStart: (file: File) => void;
  hasSaved?: boolean;
  onViewSaved?: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <section className="mx-auto max-w-2xl break-keep px-5 pb-24 pt-4 sm:px-6">
      {hasSaved && onViewSaved && (
        <button
          type="button"
          onClick={onViewSaved}
          className="animate-rise mb-5 flex w-full items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent-soft/30 px-4 py-3 text-left transition hover:bg-accent-soft/60"
        >
          <span className="font-kr text-sm font-medium text-ink/80">
            지난 진단 결과가 저장돼 있어요
          </span>
          <span className="shrink-0 font-kr text-sm font-semibold text-accent">다시 보기 →</span>
        </button>
      )}

      <p
        className="animate-rise font-mono text-[11px] uppercase tracking-tighter2 text-accent"
        style={{ animationDelay: "0ms" }}
      >
        Thinking Diagnostic · 사고력 진단
      </p>

      <h1
        className="animate-rise mt-4 font-kr text-[28px] font-bold leading-[1.2] tracking-tighter2 sm:text-[40px]"
        style={{ animationDelay: "60ms" }}
      >
        AI가 답을 내는 시대,
        <br />
        무엇을 길러야 할까요?
      </h1>

      <p
        className="animate-rise mt-4 text-[16px] leading-relaxed text-ink/70 sm:text-[17px]"
        style={{ animationDelay: "120ms" }}
      >
        답은 AI가 5초면 냅니다. 우리는 ‘정답’이 아니라{" "}
        <b className="font-semibold text-accent">‘생각하는 힘’</b>을 봅니다.
      </p>

      {/* Decision-first: free CTA high on the page */}
      <button
        type="button"
        onClick={onStart}
        className="animate-rise mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 font-kr text-base font-semibold text-on-dark transition hover:bg-accent"
        style={{ animationDelay: "200ms" }}
      >
        무료로 진단 시작
        <span className="font-mono text-sm">→</span>
      </button>
      <p
        className="animate-rise mt-2.5 text-center text-[12.5px] leading-relaxed text-ink/50"
        style={{ animationDelay: "260ms" }}
      >
        약 5분 · 끝나면 <b className="font-medium text-ink/70">너의 AI 인재 지수</b> · 로그인 불필요
      </p>

      {/* WOW teaser — show the magic for anyone who scrolls before deciding */}
      <div
        className="animate-rise mt-8 rounded-2xl border border-accent/30 bg-accent-soft/30 p-4"
        style={{ animationDelay: "360ms" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-tighter2 text-ink/45">
          진단 중엔 — 실시간으로
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-ink/80">
          나:{" "}
          <span className="font-sans text-ink/70">
            “It’s a round trip where the speed changes each way.”
          </span>
        </p>
        <div className="mt-2.5 flex items-center gap-2">
          <span className="font-mono text-[11px] text-ink/40">↓ AI가 감지</span>
          <span className="rounded-full bg-accent px-3 py-1 font-kr text-[13px] font-semibold text-on-dark">
            관계 파악
          </span>
          <span className="font-mono text-sm font-semibold text-accent">+4</span>
        </div>
      </div>

      {/* The 6 constructs */}
      <p
        className="animate-rise mt-7 font-mono text-[11px] uppercase tracking-tighter2 text-ink/45"
        style={{ animationDelay: "440ms" }}
      >
        측정하는 6가지 사고력
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {CONSTRUCTS.map((c, i) => (
          <span
            key={c.id}
            className="animate-rise rounded-full border border-accent/25 bg-accent-soft/30 px-3.5 py-1.5 font-kr text-sm font-medium text-ink/80"
            style={{ animationDelay: `${480 + i * 45}ms` }}
          >
            {c.koreanName}
          </span>
        ))}
      </div>

      {/* Secondary: bring your own problem */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUploadStart(f);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="animate-rise mt-7 flex w-full items-center justify-center gap-2 rounded-2xl border border-ink/15 bg-paper py-3.5 font-kr text-sm font-medium text-ink/75 transition hover:border-accent/50"
        style={{ animationDelay: "760ms" }}
      >
        내가 막힌 문제를 사진으로 올리기
      </button>
      <p
        className="animate-rise mt-2 text-center text-[12px] leading-relaxed text-ink/45"
        style={{ animationDelay: "820ms" }}
      >
        사진은 기기 안에서만 쓰이고 어디에도 전송되지 않아요
      </p>
    </section>
  );
}
