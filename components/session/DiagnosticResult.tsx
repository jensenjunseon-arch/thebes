"use client";

import Link from "next/link";
import { CONSTRUCTS, type ConstructId } from "@/lib/constructs";

// Per-construct ceiling — one stage scores each construct 1–5 (english ~5 too).
const SESSION_MAX = 6;

// Strength reading, built to feel personal and expert — not a label restatement:
//   contrast    : how the average student handles this vs. how THEY did (①)
//   consequence : the failure pattern when this strength outruns the weak area (②)
//   parentNote  : what learning environment fits / what to avoid (④, buyer-facing)
const STRENGTH_READING: Record<
  ConstructId,
  { contrast: string; consequence: string; parentNote: string }
> = {
  redefine: {
    contrast:
      "대부분의 학생은 문제를 ‘유형’으로 봐요 — ‘아, 이거 속력 문제네’ 하고. 당신은 그걸 ‘상황’으로 다시 봤습니다.",
    consequence:
      "시작은 누구보다 정확한데, 마무리에서 한 번 더 확인하지 않아 아깝게 흘리는 일이 생겨요.",
    parentNote:
      "이 아이에겐 ‘유형 반복 풀이’ 학원이 오히려 독일 수 있어요. 스스로 문제를 다시 정의하려는 본능을 ‘시키는 대로 풀어’가 눌러버리거든요. 필요한 건 더 많은 문제가 아니라, 더 깊은 질문입니다.",
  },
  decompose: {
    contrast:
      "대부분은 눈에 띄는 숫자만 주워 담아요. 당신은 ‘무엇이 무엇과 엮여 있는지’ 구조를 먼저 봤습니다.",
    consequence:
      "분석은 잔뜩 해놓고 ‘그래서 결론이 뭐냐’가 안 나오는 일이 생겨요.",
    parentNote:
      "정답 ‘속도’만 재는 환경은 이 아이의 강점을 죽여요. 큰 과제를 스스로 쪼개 설계해보는 경험에서 훨씬 크게 자랍니다.",
  },
  relate: {
    contrast:
      "대부분은 값을 구하는 데 곧장 직진해요. 당신은 ‘이게 바뀌면 저건 어떻게 되지?’를 봤습니다.",
    consequence:
      "빠르게 연결하다 근거를 건너뛰고 헛다리를 짚는 일이 생겨요.",
    parentNote:
      "암기·반복 위주 학원은 이 아이에겐 지루함이자 손해예요. 개념을 ‘연결해 설명’하게 하는 환경에서 폭발합니다.",
  },
  relevance: {
    contrast:
      "대부분은 ‘그래서 답이 뭐’에서 멈춰요. 당신은 ‘이게 내 삶에 무슨 의미인지’까지 갔습니다.",
    consequence:
      "꽂힌 것만 깊게 파고 나머지는 손도 안 대는 ‘편식’이 굳어지기 쉬워요.",
    parentNote:
      "‘일단 외워’식 주입은 이 아이의 엔진을 꺼버려요. 왜 배우는지가 보이는 프로젝트형 학습이 답입니다.",
  },
  transfer: {
    contrast:
      "대부분은 이 문제 하나로 끝내요. 당신은 ‘그럼 다른 데서도 되겠네?’로 넓혔습니다.",
    consequence:
      "여기저기 건드리다 정작 한 군데도 끝을 못 보는 일이 생겨요.",
    parentNote:
      "한 문제집만 반복시키면 이 아이는 금세 흥미를 잃어요. 배운 걸 다른 분야로 옮겨보게 하는 ‘폭’이 필요합니다.",
  },
  english: {
    contrast:
      "대부분은 한국어로 풀고 영어는 단어만 외워요. 당신은 생각 자체를 영어로 굴렸습니다.",
    consequence:
      "말은 유창한데 정작 속 논리가 얕아 보이는 함정에 빠질 수 있어요.",
    parentNote:
      "영어와 수학을 ‘따로’ 시키는 건 이 아이에겐 두 배로 비효율이에요. 영어로 사고하는 환경 하나면, 둘이 동시에 자랍니다.",
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
      "AI는 속으로 영어로 사고합니다. 수학을 한국어로만 익히면, 정작 AI가 ‘생각하는 언어’로는 한 박자 늦어요. ‘영어 따로·수학 따로’는 AI 시대 준비가 안 됐다는 신호입니다.",
  },
};

// Student-facing next move — concrete, empowering, second person. (Mutually
// exclusive from the parent content: the student gets identity + action, the
// parent gets assessment + risk + decision.)
const STUDENT_MOVE: Record<ConstructId, string> = {
  redefine:
    "문제를 받으면 풀기 전에 ‘이게 진짜 뭘 묻지?’를 한 줄로 적어보세요. 그 한 줄이, 시키는 대로 푸는 사람과 무엇을 풀지 정하는 사람을 가릅니다.",
  decompose:
    "막막한 과제를 만나면 가장 먼저 ‘이건 몇 조각으로 나뉘지?’를 적어보세요. 큰 문제 앞에서 얼지 않는 사람이 됩니다.",
  relate:
    "새로 배운 걸 ‘예전에 배운 무엇과 닮았지?’로 한 번씩 엮어보세요. 외울 양이 절반으로 줄어듭니다.",
  relevance:
    "배우기 전에 ‘이게 나한테 왜 쓸모 있지?’를 먼저 물어보세요. 동기가 켜지면 누구도 당신을 멈출 수 없습니다.",
  transfer:
    "한 문제를 풀면 ‘이 방법, 또 어디에 쓸 수 있지?’를 떠올려보세요. 하나를 배워 열을 쓰는 사람이 됩니다.",
  english:
    "떠오른 생각을 짧게라도 영어로 먼저 적어보세요. 영어로 ‘사고’하는 순간, 세계 어디서든 통하는 무기가 됩니다.",
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

  const reading = STRENGTH_READING[strength.id];
  const risk = RISK[weak.id];

  return (
    <section className="mx-auto max-w-2xl break-keep px-4 pb-24 sm:px-6">
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

      {/* Neutral one-line summary (shared) */}
      <p className="mt-5 text-center font-kr text-lg font-semibold leading-relaxed text-ink sm:text-xl">
        가장 두드러진 강점은 <span className="text-accent">{strength.koreanName}</span>,
        <br />
        먼저 키울 곳은 <span className="text-accent">{weak.koreanName}</span>입니다.
      </p>

      {/* ───────────── 학생에게 ───────────── */}
      <div className="mt-9 flex items-center gap-3">
        <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-tighter2 text-ink/45">
          학생에게 · For the student
        </span>
        <span className="h-px flex-1 bg-ink/10" />
      </div>

      <div className="mt-4 rounded-3xl border border-accent/30 bg-accent-soft/30 p-5">
        <p className="font-mono text-[11px] uppercase tracking-tighter2 text-accent">
          너의 가장 큰 무기 · {strength.englishName}
        </p>
        <h2 className="mt-1 font-kr text-xl font-bold tracking-tighter2">
          {strength.koreanName}
        </h2>
        {topEvidence && (
          <blockquote className="mt-3 border-l-2 border-accent pl-3 text-[15px] leading-relaxed text-ink/85">
            “{topEvidence.quote}”
          </blockquote>
        )}
        <p className="mt-3 text-[15px] leading-relaxed text-ink/80">{reading.contrast}</p>
        <div className="mt-4 rounded-2xl border border-accent/25 bg-paper px-4 py-3.5">
          <p className="font-kr text-[13px] font-semibold text-accent">이렇게 해보세요</p>
          <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink/85">
            {STUDENT_MOVE[strength.id]}
          </p>
        </div>
      </div>

      {/* student action — English recap */}
      <button
        type="button"
        onClick={onRecap}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-4 font-kr text-base font-semibold text-on-dark transition hover:opacity-90"
      >
        영어로 정리하고 따라 쓰기
        <span className="font-mono text-sm">→</span>
      </button>
      <p className="mt-2 text-center text-[13px] leading-relaxed text-ink/55">
        오늘 한 사고를 한 편의 영어 문단으로 —
        <br />
        따라 쓰고, 소리 내어 읽으며 내 것으로.
      </p>

      {/* ───────────── 학부모에게 ───────────── */}
      <div className="mt-10 flex items-center gap-3">
        <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-tighter2 text-ink/45">
          학부모에게 · For parents
        </span>
        <span className="h-px flex-1 bg-ink/10" />
      </div>

      <div className="mt-4 rounded-3xl border border-ink/10 bg-paper-2 p-5">
        <p className="font-mono text-[11px] uppercase tracking-tighter2 text-ink/45">
          진단 소견
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-ink/80">
          ‘{strength.koreanName}’이 또렷한 강점입니다. 다만 그 힘을 받쳐줄{" "}
          <b className="font-semibold">‘{weak.koreanName}’</b>이 아직 약해,
          <br />
          {reading.consequence}
        </p>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink/55">
          머리가 아니라 ‘습관’의 문제라, 환경만 맞으면 가장 빨리 자라는 부분입니다.
        </p>
      </div>

      <div className="mt-4 rounded-3xl border border-ink/15 bg-ink p-6 text-on-dark">
        <p className="font-mono text-[11px] uppercase tracking-tighter2 text-accent-soft">
          지금 점검하지 않으면
        </p>
        <h3 className="mt-2 font-kr text-lg font-bold">{risk.weak}</h3>
        <p className="mt-2 text-[14.5px] leading-relaxed text-on-dark/75">{risk.crisis}</p>
      </div>

      <div className="mt-4 rounded-3xl border border-ink/10 bg-paper-2 p-5">
        <p className="font-mono text-[11px] uppercase tracking-tighter2 text-ink/45">
          이 아이에게 맞는 학습 환경
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-ink/80">{reading.parentNote}</p>
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
        <div className="w-full max-w-md break-keep rounded-3xl border border-ink/15 bg-paper/95 p-6 text-center shadow-[0_8px_40px_rgba(20,17,12,0.12)] backdrop-blur-sm">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-ink text-on-dark">
            <span aria-hidden className="text-lg">🔒</span>
          </div>
          <h2 className="mt-4 font-kr text-xl font-bold tracking-tighter2 text-ink">
            그래서, 무엇부터 하면 될까요?
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink/65">
            <b className="text-ink">‘{weakName}’</b>을 강점으로 바꾸는 처방과,
            <br />
            또래 중 내 위치까지 — 진짜 리포트는 여기서부터입니다.
          </p>

          <ul className="mx-auto mt-5 max-w-xs space-y-2.5 text-left">
            {[
              ["맞춤 학습 처방", `‘${weakName}’을 키우는 구체적 행동 3가지`],
              ["또래 비교", "내 AI 인재 지수가 상위 몇 %인지"],
              ["12주 성장 로드맵", "지금의 사고가 어떻게 자라는지"],
              ["부모님 리포트", "매주 갱신되는 성장 기록"],
            ].map(([t, d]) => (
              <li key={t} className="flex items-start gap-2.5">
                <span aria-hidden className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
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
