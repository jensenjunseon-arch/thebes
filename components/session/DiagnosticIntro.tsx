"use client";

import { CONSTRUCTS } from "@/lib/constructs";

// Phase 0 — a fast, punchy framing screen. One tap to start. The point is to
// reframe BEFORE the unfamiliar English-math begins: answers are commoditized,
// thinking is the skill, and here are the 6 dimensions we measure. The staggered
// reveal of the six constructs is the wow — it reads as a real instrument.
export function DiagnosticIntro({ onStart }: { onStart: () => void }) {
  return (
    <section className="mx-auto max-w-2xl px-5 pb-28 pt-4 sm:px-6">
      <p
        className="animate-rise font-mono text-[11px] uppercase tracking-tighter2 text-accent"
        style={{ animationDelay: "0ms" }}
      >
        Thinking Diagnostic · 사고력 진단
      </p>

      <h1
        className="animate-rise mt-4 font-kr text-3xl font-bold leading-[1.18] tracking-tighter2 sm:text-[40px]"
        style={{ animationDelay: "70ms" }}
      >
        AI가 답을 내는 시대,
        <br />
        무엇을 길러야 할까요?
      </h1>

      <p
        className="animate-rise mt-5 text-[17px] leading-relaxed text-ink/70"
        style={{ animationDelay: "140ms" }}
      >
        답은 AI가 5초면 냅니다. 그래서 우리는{" "}
        <b className="font-semibold text-accent">정답이 아니라 ‘생각하는 힘’</b>을 봅니다.
        지금부터 약 5분, AI 코치가 당신이 <b className="font-semibold">어떻게 생각하는지</b>를
        — 영어로 — 진단합니다.
      </p>

      <p
        className="animate-rise mt-9 font-mono text-[11px] uppercase tracking-tighter2 text-ink/45"
        style={{ animationDelay: "210ms" }}
      >
        측정하는 6가지 사고력
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {CONSTRUCTS.map((c, i) => (
          <span
            key={c.id}
            className="animate-rise rounded-full border border-accent/25 bg-accent-soft/30 px-3.5 py-1.5 font-kr text-sm font-medium text-ink/80"
            style={{ animationDelay: `${260 + i * 80}ms` }}
          >
            {c.koreanName}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={onStart}
        className="animate-rise mt-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 font-kr text-base font-semibold text-on-dark transition hover:bg-accent"
        style={{ animationDelay: "820ms" }}
      >
        진단 시작
        <span className="font-mono text-sm">→</span>
      </button>
      <p
        className="animate-rise mt-3 text-center text-[12px] leading-relaxed text-ink/45"
        style={{ animationDelay: "900ms" }}
      >
        로그인 없이 바로 시작 · 약 5분 · 영어가 막히면 한국어로 시작해도 좋아요
      </p>
    </section>
  );
}
