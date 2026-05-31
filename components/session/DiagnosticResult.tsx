"use client";

import Link from "next/link";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { CONSTRUCTS, type ConstructId } from "@/lib/constructs";

// Per-construct ceiling for the radar — one stage scores each construct 1–5
// (english accrues up to ~5 too), so 6 gives a touch of headroom.
const SESSION_MAX = 6;

// One-line growth tip per construct (rule-based v0).
const GROWTH_TIP: Record<ConstructId, string> = {
  redefine: "상황을 더 자주 ‘자신의 말로’ 바꿔 말해보면 좋아요.",
  decompose: "상황 속에 어떤 요소들이 있는지 한 번 더 또렷이 짚어보면 좋아요.",
  relate: "요소들이 서로 어떻게 영향을 주는지 연결해보면 좋아요.",
  relevance: "이 사고가 내 삶 어디에 쓸모 있을지 떠올려보면 좋아요.",
  transfer: "하나의 원리를 주변과 미래로 더 넓게 적용해보면 좋아요.",
  english: "생각을 영어로 한 문장 더 길게 써보면 좋아요.",
};

export interface EvidenceByConstruct {
  [k: string]: { quote: string; rationale: string } | undefined;
}

interface Props {
  totals: Record<ConstructId, number>;
  evidenceByConstruct: EvidenceByConstruct;
  onRestart: () => void;
  onRecap: () => void;
  // When true (future: authenticated), the gated section is revealed.
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
  const sorted = [...reasoning].sort((a, b) => b.total - a.total);
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];
  const balanced = top.total === bottom.total;

  const radarData = CONSTRUCTS.map((c) => ({
    subject: c.koreanName,
    점수: Math.round(Math.min(SESSION_MAX, totals[c.id] ?? 0)),
    fullMark: SESSION_MAX,
  }));

  const topEvidence = evidenceByConstruct[top.c.id];

  // Composite "AI 인재 지수" (0–100) — computed for integrity; shown only when unlocked.
  const composite = Math.round(
    (CONSTRUCTS.reduce((s, c) => s + Math.min(SESSION_MAX, totals[c.id] ?? 0), 0) /
      (CONSTRUCTS.length * SESSION_MAX)) *
      100,
  );

  return (
    <section className="mx-auto max-w-2xl px-4 pb-24 sm:px-6">
      {/* ── FREE: the proof. Enough to make them believe it read them. ── */}
      <div className="pt-2 text-center">
        <p className="font-mono text-[11px] uppercase tracking-tighter2 text-accent">
          AI Talent Report
        </p>
        <h1 className="mt-2 font-kr text-2xl font-semibold tracking-tighter2 sm:text-3xl">
          AI 인재 리포트
        </h1>
      </div>

      {/* Radar */}
      <div className="mt-6 rounded-3xl border border-ink/10 bg-paper-2 p-4">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
              <PolarGrid stroke="#14110C20" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{
                  fontSize: 11,
                  fill: "#14110C99",
                  fontFamily: "Pretendard Variable, Pretendard, sans-serif",
                }}
              />
              <Radar name="점수" dataKey="점수" stroke="#B5411B" fill="#B5411B" fillOpacity={0.28} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* One-sentence profile */}
      <p className="mt-6 text-center font-kr text-xl font-semibold leading-relaxed text-ink sm:text-2xl">
        {balanced ? (
          <>
            여섯 가지 사고력이 고르게 단단해요.
            <br />
            다음엔 <span className="text-accent">{bottom.c.koreanName}</span>을 한 단계 더 깊이.
          </>
        ) : (
          <>
            가장 두드러진 강점은 <span className="text-accent">{top.c.koreanName}</span>,
            <br />
            다음 목표는 <span className="text-accent">{bottom.c.koreanName}</span>.
          </>
        )}
      </p>

      {/* Strength — with the student's OWN words. The wow that earns trust. */}
      <div className="mt-8 rounded-3xl border border-accent/30 bg-accent-soft/30 p-5">
        <p className="font-mono text-[11px] uppercase tracking-tighter2 text-accent">
          강점 · {top.c.englishName}
        </p>
        <h2 className="mt-1 font-kr text-lg font-semibold">{top.c.koreanName}</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink/65">{top.c.definition}</p>
        {topEvidence && (
          <blockquote className="mt-3 border-l-2 border-accent pl-3 text-[15px] leading-relaxed text-ink/85">
            “{topEvidence.quote}”
          </blockquote>
        )}
      </div>

      {/* English recap — free engagement tool. */}
      <button
        type="button"
        onClick={onRecap}
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-4 font-kr text-base font-semibold text-on-dark transition hover:opacity-90"
      >
        영어로 정리하고 따라 쓰기
        <span className="font-mono text-sm">→</span>
      </button>
      <p className="mt-2 text-center text-[13px] leading-relaxed text-ink/55">
        오늘의 사고 과정을 한 편의 영어 문단으로 — 따라 쓰고, 소리 내어 읽으며
      </p>

      {/* ── THE GATE / or the unlocked aspirational report ── */}
      {unlocked ? (
        <UnlockedReport composite={composite} bottom={bottom} />
      ) : (
        <SignupGate composite={composite} bottomName={bottom.c.koreanName} />
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

/* ── The decisive stop: free proof above → blurred future below + signup wall ── */
function SignupGate({ composite, bottomName }: { composite: number; bottomName: string }) {
  return (
    <div className="relative mt-10">
      {/* Blurred preview — they SEE the shape of the value behind the wall. */}
      <div
        className="pointer-events-none select-none space-y-4 blur-[7px]"
        aria-hidden
      >
        <LockedIndexCard composite={composite} />
        <LockedRoadmapCard />
        <LockedPrescriptionCard bottomName={bottomName} />
      </div>

      {/* Fade from the clear section above into the blur. */}
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-24 bg-gradient-to-b from-paper to-transparent" />

      {/* The wall. */}
      <div className="absolute inset-0 flex items-start justify-center px-2 pt-8">
        <div className="w-full max-w-md rounded-3xl border border-ink/15 bg-paper/95 p-6 text-center shadow-[0_8px_40px_rgba(20,17,12,0.12)] backdrop-blur-sm">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-ink text-on-dark">
            <span aria-hidden className="text-lg">🔒</span>
          </div>
          <h2 className="mt-4 font-kr text-xl font-bold tracking-tighter2 text-ink">
            여기서부터가, 진짜 리포트입니다
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink/65">
            오늘의 스냅샷을 넘어 — 이 학생이 AI 시대에 <b className="text-ink">어떤 인재로
            자라는지</b>까지 보여드릴게요.
          </p>

          <ul className="mx-auto mt-5 max-w-xs space-y-2 text-left">
            {[
              ["🎯", "AI 인재 지수", "또래와 비교한 종합 사고력 위치"],
              ["📈", "12주 성장 로드맵", "지금 → 미래, 어떻게 자라는지"],
              ["🧭", "맞춤 학습 처방", `‘${bottomName}’을 강점으로 바꾸는 길`],
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

/* ── Blurred teaser cards (shapes of value behind the wall) ── */
function LockedIndexCard({ composite }: { composite: number }) {
  return (
    <div className="rounded-3xl border border-ink/12 bg-ink p-6 text-on-dark">
      <p className="font-mono text-[11px] uppercase tracking-tighter2 text-on-dark/55">
        AI 인재 지수
      </p>
      <div className="mt-1 flex items-end gap-3">
        <span className="font-kr text-5xl font-bold">{composite}</span>
        <span className="mb-1 font-kr text-sm text-on-dark/60">/ 100 · 상위 ●●%</span>
      </div>
      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-on-dark/15">
        <div className="h-full rounded-full bg-accent" style={{ width: `${composite}%` }} />
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
            <div
              className="w-full rounded-t-lg bg-accent/70"
              style={{ height: `${24 + i * 22}px` }}
            />
            <span className="font-mono text-[10px] text-ink/45">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LockedPrescriptionCard({ bottomName }: { bottomName: string }) {
  return (
    <div className="rounded-3xl border border-ink/10 bg-paper-2 p-6">
      <p className="font-mono text-[11px] uppercase tracking-tighter2 text-ink/45">
        맞춤 학습 처방 · {bottomName}
      </p>
      <div className="mt-4 space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="h-6 w-6 shrink-0 rounded-full bg-accent/30" />
            <span className="h-3 flex-1 rounded-full bg-ink/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Unlocked view (post-signup) — real growth area + index ── */
function UnlockedReport({
  composite,
  bottom,
}: {
  composite: number;
  bottom: { c: { id: ConstructId; koreanName: string; englishName: string } };
}) {
  return (
    <div className="mt-10 space-y-4">
      <LockedIndexCard composite={composite} />
      <div className="rounded-3xl border border-ink/10 bg-paper-2 p-5">
        <p className="font-mono text-[11px] uppercase tracking-tighter2 text-ink/45">
          성장 영역 · {bottom.c.englishName}
        </p>
        <h2 className="mt-1 font-kr text-lg font-semibold">{bottom.c.koreanName}</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink/65">
          {GROWTH_TIP[bottom.c.id]}
        </p>
      </div>
    </div>
  );
}
