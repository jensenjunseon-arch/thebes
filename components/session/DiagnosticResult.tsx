"use client";

import Link from "next/link";
import { CONSTRUCTS, type ConstructId } from "@/lib/constructs";

// Per-construct ceiling — one stage scores each construct 1–5 (english ~5 too).
const SESSION_MAX = 6;

// Strength reading — what kind of thinker this makes you, and how to learn.
const PERSONA: Record<ConstructId, { tendency: string; study: string }> = {
  redefine: {
    tendency:
      "남이 던진 문제를 그대로 받지 않고 ‘진짜 묻는 게 뭐지?’부터 되묻는 타입이에요. 정보를 자기 언어로 다시 짜야 직성이 풀립니다.",
    study: "개념을 통째로 외우기보다 ‘왜 이렇게 정의했을까’를 파고드는 학습이 잘 맞아요.",
  },
  decompose: {
    tendency:
      "복잡한 걸 보면 일단 잘게 쪼개는 본능이 있어요. 큰 덩어리보다 ‘뭐가 들어있나’를 먼저 봅니다.",
    study: "긴 문제·프로젝트를 작은 단위로 나눠 하나씩 정복하는 방식이 효과적이에요.",
  },
  relate: {
    tendency:
      "낱개 사실보다 ‘이게 저것과 어떻게 연결되지?’를 보는 눈이 있어요. 패턴과 인과를 잘 잡습니다.",
    study: "공식 암기보다 ‘왜 이게 성립하지’를 연결망으로 익히면 실력이 폭발적으로 늘어요.",
  },
  relevance: {
    tendency:
      "배운 걸 ‘그래서 나한테 무슨 의미?’로 끌어오는 힘이 있어요. 이유가 분명할 때 가장 잘 배웁니다.",
    study: "실생활·관심사와 엮은 프로젝트형 학습이 잘 맞아요.",
  },
  transfer: {
    tendency:
      "하나를 배우면 ‘그럼 이것도 되겠네?’로 뻗어나가는 타입이에요. 응용과 일반화에 강합니다.",
    study: "한 문제를 여러 상황에 옮겨 적용해보는 학습이 잘 맞아요.",
  },
  english: {
    tendency:
      "생각을 영어로 옮기는 데 거리낌이 적어요. 글로벌 무대에서 사고를 전할 잠재력이 보입니다.",
    study: "영어로 ‘사고하는’ 훈련을 늘리면 가장 큰 무기가 됩니다.",
  },
};

// Weakness reading — framed as AI-era readiness, with edge.
const RISK: Record<ConstructId, { weak: string; crisis: string }> = {
  redefine: {
    weak: "문제를 자기 말로 다시 정의하는 힘이 아직 약해요.",
    crisis:
      "AI가 떠먹여주는 답을 받기만 하면 ‘무엇을 풀지’ 정의하는 힘이 자라지 않아요. AI 시대엔 질문을 정의하는 사람이, 답을 찾는 사람을 부립니다.",
  },
  decompose: {
    weak: "복잡한 문제를 잘게 쪼개는 습관이 아직 약해요.",
    crisis:
      "통째로 보면 막막해져 포기가 빨라집니다. AI에게 일을 제대로 시키려면 ‘무엇을 어떻게 나눌지’는 결국 사람이 정해야 해요.",
  },
  relate: {
    weak: "흩어진 요소를 서로 연결해 보는 힘이 아직 약해요.",
    crisis:
      "아는 건 많은데 ‘그래서 뭐?’를 못 엮으면, AI가 쏟아내는 정보를 판단할 기준이 안 생깁니다.",
  },
  relevance: {
    weak: "배운 걸 자기 삶과 연결하는 고리가 아직 약해요.",
    crisis:
      "동기 없이 외운 지식은 빨리 휘발돼요. AI가 다 해주는 시대일수록 ‘내가 왜 이걸?’이 없으면 학습 자체가 멈춥니다.",
  },
  transfer: {
    weak: "한 맥락에서 배운 원리를 다른 곳으로 옮기는 힘이 아직 약해요.",
    crisis:
      "배운 자리에서만 쓰는 지식은, AI로 가장 먼저 대체되는 종류예요.",
  },
  english: {
    weak: "영어로 사고를 표현하는 게 아직 어색해요.",
    crisis:
      "수학·과학을 한국어로만 익히면 영어가 기본인 AI·글로벌 무대에서 한 박자 늦습니다. ‘영어 따로, 수학 따로’는 AI 시대 준비가 안 됐다는 신호예요.",
  },
};

function indexBand(n: number): string {
  if (n >= 75) return "AI 시대가 요구하는 사고력을 갖춰가는 중";
  if (n >= 55) return "탄탄한 토대 — 방향만 잡으면 빠르게 큽니다";
  if (n >= 35) return "잠재력은 충분, 지금이 결정적 시기예요";
  return "사고의 근육을 키우기 딱 좋은 출발점";
}

export interface EvidenceByConstruct {
  [k: string]: { quote: string; rationale: string } | undefined;
}

interface Props {
  totals: Record<ConstructId, number>;
  evidenceByConstruct: EvidenceByConstruct;
  onRestart: () => void;
  onRecap: () => void;
  unlocked?: boolean;
}

export function DiagnosticResult({
  totals,
  evidenceByConstruct,
  onRestart,
  onRecap,
  unlocked = false,
}: Props) {
  const reasoning = CONSTRUCTS.filter((c) => c.id !== "english").map((c) => ({
    c,
    total: totals[c.id] ?? 0,
  }));
  const strength = [...reasoning].sort((a, b) => b.total - a.total)[0].c;

  // Weakest of ALL six (english can be the weak point — and its crisis copy is
  // the most on-brand). Fall back if it collides with the strength.
  const allSorted = [...CONSTRUCTS]
    .map((c) => ({ c, total: totals[c.id] ?? 0 }))
    .sort((a, b) => a.total - b.total);
  let weak = allSorted[0].c;
  if (weak.id === strength.id) weak = allSorted[1]?.c ?? weak;

  const topEvidence = evidenceByConstruct[strength.id];
  const detected = CONSTRUCTS.filter((c) => (totals[c.id] ?? 0) > 0).length;
  const composite = Math.round(
    (CONSTRUCTS.reduce((s, c) => s + Math.min(SESSION_MAX, totals[c.id] ?? 0), 0) /
      (CONSTRUCTS.length * SESSION_MAX)) *
      100,
  );

  const persona = PERSONA[strength.id];
  const risk = RISK[weak.id];

  return (
    <section className="mx-auto max-w-2xl px-4 pb-24 sm:px-6">
      <p className="pt-2 text-center font-mono text-[11px] uppercase tracking-tighter2 text-accent">
        AI Talent Report · AI 인재 리포트
      </p>

      {/* ── HERO: AI 인재 지수 ── */}
      <div className="mt-3 overflow-hidden rounded-3xl border border-ink/12 bg-ink text-on-dark">
        <div className="p-7 text-center">
          <p className="font-mono text-[11px] uppercase tracking-tighter2 text-on-dark/55">
            AI 인재 지수
          </p>
          <div className="mt-2 flex items-end justify-center gap-1">
            <span className="font-kr text-[72px] font-bold leading-none tracking-tighter2">
              {composite}
            </span>
            <span className="mb-2.5 font-kr text-xl text-on-dark/55">/ 100</span>
          </div>
          <p className="mt-3 font-kr text-[15px] font-semibold text-accent-soft">
            {indexBand(composite)}
          </p>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-on-dark/15">
            <div
              className="h-full rounded-full bg-accent transition-all duration-700"
              style={{ width: `${composite}%` }}
            />
          </div>
        </div>
        <div className="border-t border-on-dark/10 px-7 py-3 text-center font-mono text-[11px] uppercase tracking-tighter2 text-on-dark/45">
          6개 사고 영역 중 {detected}곳에서 또렷한 신호 감지
        </div>
      </div>

      {/* ── English recap — right under the score ── */}
      <button
        type="button"
        onClick={onRecap}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-4 font-kr text-base font-semibold text-on-dark transition hover:opacity-90"
      >
        영어로 정리하고 따라 쓰기
        <span className="font-mono text-sm">→</span>
      </button>
      <p className="mt-2 text-center text-[13px] leading-relaxed text-ink/55">
        오늘의 사고 과정을 한 편의 영어 문단으로 — 따라 쓰고, 소리 내어 읽으며
      </p>

      {/* ── Strength (with own words) ── */}
      <div className="mt-7 rounded-3xl border border-accent/30 bg-accent-soft/30 p-5">
        <p className="font-mono text-[11px] uppercase tracking-tighter2 text-accent">
          가장 두드러진 강점 · {strength.englishName}
        </p>
        <h2 className="mt-1 font-kr text-xl font-bold tracking-tighter2">
          {strength.koreanName}
        </h2>
        {topEvidence && (
          <blockquote className="mt-3 border-l-2 border-accent pl-3 text-[15px] leading-relaxed text-ink/85">
            “{topEvidence.quote}”
          </blockquote>
        )}
      </div>

      {/* ── Persona reading: how this student thinks + how to learn ── */}
      <div className="mt-4 rounded-3xl border border-ink/10 bg-paper-2 p-5">
        <p className="font-mono text-[11px] uppercase tracking-tighter2 text-ink/45">
          사고 성향 분석
        </p>
        <h2 className="mt-1 font-kr text-lg font-bold">이렇게 사고하는 사람이에요</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink/80">{persona.tendency}</p>
        <div className="mt-4 rounded-2xl border border-accent/25 bg-accent-soft/40 px-4 py-3">
          <p className="font-kr text-[13px] font-semibold text-accent">📚 이렇게 배우면 폭발해요</p>
          <p className="mt-1 text-[14px] leading-relaxed text-ink/80">{persona.study}</p>
        </div>
      </div>

      {/* ── Crisis: the weakness, framed as AI-era readiness (visceral) ── */}
      <div className="mt-4 rounded-3xl border border-ink/15 bg-ink p-6 text-on-dark">
        <p className="font-mono text-[11px] uppercase tracking-tighter2 text-accent-soft">
          ⚠ 지금 놓치면, AI 시대 준비가 늦어요
        </p>
        <h2 className="mt-2 font-kr text-lg font-bold">{risk.weak}</h2>
        <p className="mt-2 text-[14.5px] leading-relaxed text-on-dark/75">{risk.crisis}</p>
      </div>

      {/* ── Gate / unlocked ── */}
      {unlocked ? (
        <UnlockedReport weak={weak} />
      ) : (
        <SignupGate composite={composite} weakName={weak.koreanName} totals={totals} />
      )}

      <button
        type="button"
        onClick={onRestart}
        className="mt-6 w-full rounded-xl border border-ink/15 bg-paper py-3 font-kr text-sm text-ink/70 transition hover:border-accent/50"
      >
        다른 문제로 다시 진단하기 ↻
      </button>
    </section>
  );
}

/* ── The decisive stop: the fix + comparison + future are gated. ── */
function SignupGate({
  composite,
  weakName,
  totals,
}: {
  composite: number;
  weakName: string;
  totals: Record<ConstructId, number>;
}) {
  return (
    <div className="relative mt-8">
      <div className="pointer-events-none select-none space-y-4 blur-[7px]" aria-hidden>
        <LockedBreakdownCard totals={totals} />
        <LockedPeerCard composite={composite} />
        <LockedRoadmapCard />
      </div>

      <div className="pointer-events-none absolute inset-x-0 -top-8 h-20 bg-gradient-to-b from-paper to-transparent" />

      <div className="absolute inset-0 flex items-start justify-center px-2 pt-6">
        <div className="w-full max-w-md rounded-3xl border border-ink/15 bg-paper/95 p-6 text-center shadow-[0_8px_40px_rgba(20,17,12,0.12)] backdrop-blur-sm">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-ink text-on-dark">
            <span aria-hidden className="text-lg">🔒</span>
          </div>
          <h2 className="mt-4 font-kr text-xl font-bold tracking-tighter2 text-ink">
            그래서, 무엇부터 하면 될까요?
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink/65">
            <b className="text-ink">‘{weakName}’</b>을 강점으로 바꾸는 처방과, 또래 중 내
            위치까지 — 진짜 리포트는 여기서부터예요.
          </p>

          <ul className="mx-auto mt-5 max-w-xs space-y-2 text-left">
            {[
              ["🧭", "맞춤 학습 처방", `‘${weakName}’을 키우는 구체적 행동 3가지`],
              ["🎯", "또래 비교", "내 AI 인재 지수가 상위 몇 %인지"],
              ["📈", "12주 성장 로드맵", "지금 → 미래, 어떻게 자라는지"],
              ["👨‍👩‍👧", "부모님 리포트", "매주 갱신되는 성장 기록"],
            ].map(([icon, t, d]) => (
              <li key={t} className="flex items-start gap-2.5">
                <span aria-hidden className="mt-0.5">{icon}</span>
                <span className="text-[13.5px] leading-snug">
                  <b className="font-semibold text-ink">{t}</b>
                  <span className="text-ink/55"> · {d}</span>
                </span>
              </li>
            ))}
          </ul>

          <Link
            href="/signup"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 font-kr text-[15px] font-bold text-on-dark transition hover:opacity-90"
          >
            30초, 무료로 가입하고 전체 리포트 받기
            <span className="font-mono text-sm">→</span>
          </Link>
          <p className="mt-2.5 text-[11.5px] leading-relaxed text-ink/45">
            오늘 결과는 이미 저장돼 있어요 · 카드 없이 · 광고 없이
          </p>
        </div>
      </div>
    </div>
  );
}

function LockedBreakdownCard({ totals }: { totals: Record<ConstructId, number> }) {
  return (
    <div className="rounded-3xl border border-ink/10 bg-paper-2 p-6">
      <p className="font-mono text-[11px] uppercase tracking-tighter2 text-ink/45">
        6가지 사고력 상세
      </p>
      <div className="mt-4 space-y-3">
        {CONSTRUCTS.map((c) => {
          const pct = (Math.min(SESSION_MAX, totals[c.id] ?? 0) / SESSION_MAX) * 100;
          return (
            <div key={c.id} className="flex items-center gap-3">
              <span className="w-24 shrink-0 font-kr text-[13px] text-ink/75">
                {c.koreanName}
              </span>
              <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-ink/10">
                <span className="absolute inset-y-0 left-0 rounded-full bg-accent" style={{ width: `${pct}%` }} />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LockedPeerCard({ composite }: { composite: number }) {
  return (
    <div className="rounded-3xl border border-ink/10 bg-paper-2 p-6">
      <p className="font-mono text-[11px] uppercase tracking-tighter2 text-ink/45">
        또래 비교 · 상위 ●●%
      </p>
      <div className="relative mt-5 h-3 w-full rounded-full bg-ink/10">
        <div
          className="absolute -top-1 h-5 w-5 rounded-full border-2 border-paper bg-accent"
          style={{ left: `${Math.min(92, composite)}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-ink/40">
        <span>하위</span>
        <span>또래 평균</span>
        <span>상위</span>
      </div>
    </div>
  );
}

function LockedRoadmapCard() {
  const steps = ["지금", "4주", "8주", "12주"];
  return (
    <div className="rounded-3xl border border-ink/10 bg-paper-2 p-6">
      <p className="font-mono text-[11px] uppercase tracking-tighter2 text-ink/45">
        12주 성장 로드맵
      </p>
      <div className="mt-5 flex items-end justify-between gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full rounded-t-lg bg-accent/70" style={{ height: `${24 + i * 22}px` }} />
            <span className="font-mono text-[10px] text-ink/45">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Unlocked (post-signup) — reveal the prescription + roadmap for real. ── */
function UnlockedReport({
  weak,
}: {
  weak: { id: ConstructId; koreanName: string };
}) {
  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-3xl border border-accent/30 bg-accent-soft/30 p-5">
        <p className="font-mono text-[11px] uppercase tracking-tighter2 text-accent">
          맞춤 학습 처방 · {weak.koreanName}
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-ink/80">
          {RISK[weak.id].crisis}
        </p>
      </div>
      <LockedRoadmapCard />
    </div>
  );
}
