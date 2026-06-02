"use client";

// Phase 0 — a simple, focused entry. Headline + thesis, two aphorisms that prop
// up Thebes' two pillars (thinking + English), then one free CTA. break-keep
// keeps Korean wrapping at word boundaries on a narrow screen.
export function DiagnosticIntro({
  onStart,
  hasSaved = false,
  onViewSaved,
}: {
  onStart: () => void;
  hasSaved?: boolean;
  onViewSaved?: () => void;
}) {
  return (
    <section className="mx-auto max-w-2xl break-keep px-5 pb-24 pt-6 sm:px-6">
      {hasSaved && onViewSaved && (
        <button
          type="button"
          onClick={onViewSaved}
          className="animate-rise mb-6 flex w-full items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent-soft/30 px-4 py-3 text-left transition hover:bg-accent-soft/60"
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

      {/* Two aphorisms — the two pillars: thinking, and English. */}
      <figure
        className="animate-rise mt-9 border-l-2 border-accent/40 pl-4"
        style={{ animationDelay: "220ms" }}
      >
        <blockquote className="font-kr text-[15px] leading-relaxed text-ink/80">
          “수학을 빨리 푸는 시험은 사라진다.
          <br />
          끝까지 남는 건, 본질을 꿰뚫는{" "}
          <b className="font-semibold text-ink">사고력</b>이다.”
        </blockquote>
        <figcaption className="mt-2 font-mono text-[11px] uppercase tracking-tighter2 text-ink/45">
          최태원 · SK그룹 회장
        </figcaption>
      </figure>

      <figure
        className="animate-rise mt-6 border-l-2 border-accent/40 pl-4"
        style={{ animationDelay: "300ms" }}
      >
        <blockquote className="font-kr text-[15px] leading-relaxed text-ink/80">
          “AI 시대에 가장 필요한 능력은,{" "}
          <b className="font-semibold text-ink">영어</b>다.”
        </blockquote>
        <figcaption className="mt-2 font-mono text-[11px] uppercase tracking-tighter2 text-ink/45">
          Andrej Karpathy · OpenAI 창립 멤버
        </figcaption>
      </figure>

      <button
        type="button"
        onClick={onStart}
        className="animate-rise mt-9 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 font-kr text-base font-semibold text-on-dark transition hover:bg-accent"
        style={{ animationDelay: "400ms" }}
      >
        무료로 진단 시작
        <span className="font-mono text-sm">→</span>
      </button>
      <p
        className="animate-rise mt-2.5 text-center text-[12.5px] leading-relaxed text-ink/50"
        style={{ animationDelay: "460ms" }}
      >
        약 5분 · 끝나면 <b className="font-medium text-ink/70">AI 인재 점수 제공</b> · 로그인 불필요
      </p>
    </section>
  );
}
