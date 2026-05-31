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

const SESSION_MAX = 20;

// One-line growth tip per construct (rule-based v0).
const GROWTH_TIP: Record<ConstructId, string> = {
  redefine: "상황을 더 자주 ‘네 말로’ 바꿔 말해보면 좋아요.",
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
}

export function DiagnosticResult({ totals, evidenceByConstruct, onRestart }: Props) {
  // Headline strength/growth are chosen among the five REASONING constructs
  // (english is shown on the radar but never headlines — it rarely carries a
  // quote and a reasoning headline is more compelling). english stays on radar.
  const reasoning = CONSTRUCTS.filter((c) => c.id !== "english").map((c) => ({
    c,
    total: totals[c.id] ?? 0,
  }));
  // Stable sort by score desc → top = strongest, bottom = weakest. Sorting
  // (not reduce-min/max) guarantees top !== bottom even when scores tie.
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

  return (
    <section className="mx-auto max-w-2xl px-4 pb-24 sm:px-6">
      <div className="pt-2 text-center">
        <p className="font-mono text-[11px] uppercase tracking-tighter2 text-accent">
          Diagnostic complete
        </p>
        <h1 className="mt-2 font-kr text-2xl font-semibold tracking-tighter2 sm:text-3xl">
          너의 사고력 스냅샷
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
              <Radar
                name="점수"
                dataKey="점수"
                stroke="#B5411B"
                fill="#B5411B"
                fillOpacity={0.28}
              />
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
            가장 두드러진 강점은{" "}
            <span className="text-accent">{top.c.koreanName}</span>,
            <br />
            다음 목표는 <span className="text-accent">{bottom.c.koreanName}</span>.
          </>
        )}
      </p>

      {/* Strength */}
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

      {/* Growth */}
      <div className="mt-4 rounded-3xl border border-ink/10 bg-paper-2 p-5">
        <p className="font-mono text-[11px] uppercase tracking-tighter2 text-ink/45">
          성장 영역 · {bottom.c.englishName}
        </p>
        <h2 className="mt-1 font-kr text-lg font-semibold">{bottom.c.koreanName}</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink/65">
          {GROWTH_TIP[bottom.c.id]}
        </p>
      </div>

      {/* Parent report teaser + CTA */}
      <div className="mt-8 rounded-3xl border border-ink/12 bg-ink p-6 text-on-dark">
        <p className="font-mono text-[11px] uppercase tracking-tighter2 text-on-dark/55">
          이건 한 문제로 본 스냅샷이에요
        </p>
        <p className="mt-2 font-kr text-lg font-semibold leading-relaxed">
          매주 이렇게 쌓이면,
          <br />
          아이의 사고력 성장 리포트가 됩니다.
        </p>
        <Link
          href="/signup"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 font-kr text-sm font-semibold text-on-dark transition hover:opacity-90"
        >
          결과 저장하고 부모님 리포트 받기
          <span className="font-mono text-xs">→</span>
        </Link>
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-tighter2 text-on-dark/40">
          로그인은 결과를 저장할 때만
        </p>
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="mt-4 w-full rounded-xl border border-ink/15 bg-paper py-3 font-kr text-sm text-ink/70 transition hover:border-accent/50"
      >
        다른 문제로 다시 진단하기 ↻
      </button>
    </section>
  );
}
