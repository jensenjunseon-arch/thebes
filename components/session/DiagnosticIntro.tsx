"use client";

import { useRef } from "react";
import { CONSTRUCTS } from "@/lib/constructs";

// Phase 0 — a fast, punchy framing screen. One tap to start. The point is to
// reframe BEFORE the unfamiliar English-math begins: answers are commoditized,
// thinking is the skill, and here are the 6 dimensions we measure. The staggered
// reveal of the six constructs is the wow — it reads as a real instrument.
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
    <section className="mx-auto max-w-2xl px-5 pb-28 pt-4 sm:px-6">
      {hasSaved && onViewSaved && (
        <button
          type="button"
          onClick={onViewSaved}
          className="animate-rise mb-5 flex w-full items-center justify-between rounded-2xl border border-accent/30 bg-accent-soft/30 px-4 py-3 text-left transition hover:bg-accent-soft/60"
        >
          <span className="font-kr text-sm font-medium text-ink/80">
            지난 진단 결과가 저장되어 있어요
          </span>
          <span className="font-kr text-sm font-semibold text-accent">
            다시 보기 →
          </span>
        </button>
      )}

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
        답은 AI가 5초면 냅니다.
        <br />
        그래서 우리는{" "}
        <b className="font-semibold text-accent">정답이 아니라 ‘생각하는 힘’</b>을 봅니다.
        <br />
        <br />
        지금부터 약 5분, AI 코치가 당신이
        <br />
        <b className="font-semibold">어떻게 생각하는지</b>를 — 영어로 — 진단합니다.
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

      {/* WOW teaser — show the magic before they start (not just tell) */}
      <div
        className="animate-rise mt-8 rounded-2xl border border-accent/30 bg-accent-soft/30 p-4"
        style={{ animationDelay: "720ms" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-tighter2 text-ink/45">
          진단 중엔 — 실시간으로
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-ink/80">
          나: <span className="font-sans text-ink/70">“It’s a round trip where the speed changes each way.”</span>
        </p>
        <div className="mt-2.5 flex items-center gap-2">
          <span className="font-mono text-[11px] text-ink/40">↓ AI가 감지</span>
          <span className="rounded-full bg-accent px-3 py-1 font-kr text-[13px] font-semibold text-on-dark">
            관계 파악
          </span>
          <span className="font-mono text-sm font-semibold text-accent">+4</span>
        </div>
      </div>

      {/* Payoff tease — anticipation for the score */}
      <p
        className="animate-rise mt-7 text-center font-kr text-[14px] leading-relaxed text-ink/60"
        style={{ animationDelay: "840ms" }}
      >
        5분 뒤, <b className="font-semibold text-ink">너의 AI 인재 지수</b>와 사고 성향 리포트를 받아요.
      </p>

      <button
        type="button"
        onClick={onStart}
        className="animate-rise mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 font-kr text-base font-semibold text-on-dark transition hover:bg-accent"
        style={{ animationDelay: "920ms" }}
      >
        예시 문제로 진단 시작
        <span className="font-mono text-sm">→</span>
      </button>

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
        className="animate-rise mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl border border-ink/15 bg-paper py-3.5 font-kr text-sm font-medium text-ink/80 transition hover:border-accent/50"
        style={{ animationDelay: "880ms" }}
      >
        내가 막힌 문제를 사진으로 올리기
      </button>
      <p
        className="animate-rise mt-2 text-center text-[12px] leading-relaxed text-ink/45"
        style={{ animationDelay: "940ms" }}
      >
        이미 풀어본 문제도 좋아요 — 같은 문제를 영어로 사고하면 무엇이 달라지는지 보여드릴게요.
        <br />
        사진은 기기 안에서만 쓰이고 어디에도 전송되지 않아요 · 로그인 불필요
      </p>
    </section>
  );
}
