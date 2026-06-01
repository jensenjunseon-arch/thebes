import type { Metadata } from "next";
import Link from "next/link";
import { CONSTRUCTS } from "@/lib/constructs";

export const metadata: Metadata = {
  title: "Thebes AI — 측정 방법론",
  description:
    "Thebes가 무엇을, 어떻게 재는가 — 6가지 사고력 구인, 5단계 확장 대화, 채점 방식, 그리고 정직한 한계.",
};

const STAGES = [
  { n: "1", name: "재정의", q: "이 상황이 진짜 무엇에 대한 것인가 — 자기 언어로 다시 진술" },
  { n: "2", name: "구성 요소 분해", q: "상황 속 핵심 요소(양·조건·변수)는 무엇인가" },
  { n: "3", name: "관계 파악", q: "그 요소들이 서로 어떻게 영향을 주고받는가" },
  { n: "4", name: "실생활 연결", q: "이 사고가 내 삶에 어떤 의미·이득인가" },
  { n: "5", name: "확장적 사고", q: "이 원리가 주변과 미래로 어떻게 넓어지는가" },
];

const TIERS = [
  ["5점", "주제에 정확히 맞고, 충분히 길고, 근거·예시·구체가 있는 답"],
  ["3–4점", "주제에 맞는 한 문장 — 방향은 또렷하나 더 깊어질 여지"],
  ["1–2점", "짧거나 일반적 — 비계(힌트)로 한 번 더 끌어냄"],
];

export default function MethodologyPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-2xl break-keep px-5 py-16 text-ink sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-tighter2 text-accent">
        Methodology · 측정 방법론
      </p>
      <h1 className="mt-2 font-kr text-3xl font-bold tracking-tighter2 sm:text-4xl">
        무엇을, 어떻게 재는가
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink/70">
        Thebes는 정답을 채점하지 않습니다. 답은 어떤 AI든 5초면 냅니다. 우리는 그 답 뒤의
        사고 — 문제를 어떻게 보고·쪼개고·연결하고·확장하는지를 영어 대화 속에서 측정합니다.
      </p>

      {/* 6 constructs */}
      <section className="mt-10">
        <h2 className="font-kr text-lg font-bold">측정하는 6가지 사고력</h2>
        <div className="mt-4 space-y-3">
          {CONSTRUCTS.map((c) => (
            <div key={c.id} className="rounded-2xl border border-ink/10 bg-paper-2 p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-kr text-[15px] font-semibold">{c.koreanName}</h3>
                <span className="font-mono text-[10px] uppercase tracking-tighter2 text-ink/40">
                  {c.englishName}
                </span>
              </div>
              <p className="mt-1 text-[14px] leading-relaxed text-ink/65">{c.definition}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5-stage arc */}
      <section className="mt-10">
        <h2 className="font-kr text-lg font-bold">5단계 확장 대화 (계산하지 않습니다)</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink/65">
          숫자 답은 절대 묻지 않습니다. 문제에서 바깥으로 — 나, 그리고 세상으로 — 사고를
          넓혀가는 다섯 단계를 영어로 함께 밟습니다.
        </p>
        <ol className="mt-4 space-y-2.5">
          {STAGES.map((s) => (
            <li key={s.n} className="flex gap-3">
              <span className="font-mono text-[15px] font-medium text-accent">{s.n}</span>
              <span className="text-[14.5px] leading-relaxed">
                <b className="font-semibold">{s.name}</b>
                <span className="text-ink/60"> — {s.q}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Scoring */}
      <section className="mt-10">
        <h2 className="font-kr text-lg font-bold">어떻게 채점하나</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink/65">
          학생이 쓴 ‘언어의 마커’로 각 사고력을 단계마다 1–5점으로 채점합니다. 분류 자체가
          측정입니다 — 추론의 흔적(가정·관계·근거·확장)이 언어에 드러난 만큼 점수가 움직입니다.
        </p>
        <div className="mt-4 space-y-2">
          {TIERS.map(([t, d]) => (
            <div key={t} className="flex items-start gap-3 rounded-xl border border-ink/10 bg-paper-2 px-4 py-2.5">
              <span className="w-12 shrink-0 font-mono text-[12px] text-accent">{t}</span>
              <span className="text-[13.5px] leading-relaxed text-ink/70">{d}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Why English */}
      <section className="mt-10">
        <h2 className="font-kr text-lg font-bold">왜 ‘영어로’인가</h2>
        <ol className="mt-3 space-y-2 text-[14px] leading-relaxed text-ink/70">
          <li>1. 최전선 AI는 내부적으로 영어로 사고합니다. 영어로 사고하면 AI의 모국어로 사고하는 셈입니다.</li>
          <li>2. 한국어는 고맥락 언어라 ‘괜찮다’가 Okay인지 No thanks인지 모호합니다. 영어로 사고하면 ‘무엇을·왜’를 또박또박 드러내게 됩니다.</li>
          <li>3. 사고를 언어로 표현하는 힘은 AI 시대의 직업이 됩니다.</li>
        </ol>
      </section>

      {/* Honest limits */}
      <section className="mt-10 rounded-3xl border border-ink/12 bg-paper-2 p-5">
        <h2 className="font-kr text-lg font-bold">정직하게 밝히는 한계</h2>
        <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-ink/65">
          <li>· 현재 채점은 언어 마커 기반의 초기 버전입니다. 단발 진단은 ‘스냅샷’이며, 매주 쌓일수록 정교해집니다.</li>
          <li>· 또래 비교(상위 %)는 코호트 데이터가 충분히 쌓인 뒤 제공합니다.</li>
          <li>· 영어가 약한 학습자에겐 한국어로 시작하는 온램프를 제공하고, 어휘·문장 난이도를 진단해 자동 조절합니다.</li>
        </ul>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/session/demo"
          className="rounded-xl bg-ink px-5 py-3 font-kr text-sm font-semibold text-on-dark transition hover:bg-accent"
        >
          무료로 진단해보기 →
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-ink/15 px-5 py-3 font-kr text-sm text-ink/70 transition hover:border-accent/50"
        >
          홈으로
        </Link>
      </div>
    </main>
  );
}
