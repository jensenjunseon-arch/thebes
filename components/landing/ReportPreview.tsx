"use client";

import { useState } from "react";

type ConstructKey = "redefine" | "assume" | "paths" | "verify" | "logic" | "english";

interface Construct {
  key: ConstructKey;
  name: string;
  en: string;
  score: number;
  delta: number;
  pct: number;
  desc: string;
  quote: string;
}

const CONSTRUCTS: Construct[] = [
  {
    key: "redefine",
    name: "문제 재정의",
    en: "REDEFINE",
    score: 18,
    delta: 5,
    pct: 72,
    desc: "문제를 자신의 언어로 다시 서술하는 능력. 단순히 문제를 읽는 것이 아니라, 무엇을 구해야 하는지·무엇이 주어졌는지를 명확히 분리합니다.",
    quote: "I need to find the speed — and I'm given the distance and time, so that's what I'll use.",
  },
  {
    key: "assume",
    name: "가정 명시",
    en: "ASSUME",
    score: 14,
    delta: 3,
    pct: 56,
    desc: "암묵적 가정을 드러내는 능력. '속도가 일정하다'처럼 문제에 깔린 전제를 명시적으로 서술할 수 있어야 합니다.",
    quote: "I'm assuming the speed stays constant throughout — the problem says so.",
  },
  {
    key: "paths",
    name: "풀이 경로",
    en: "PATHS",
    score: 16,
    delta: 4,
    pct: 64,
    desc: "여러 풀이 경로를 생각하고, 그중 하나를 선택해 이유를 설명하는 능력. 단일 공식 암기와 구별되는 핵심 지표입니다.",
    quote: "I could use the ratio directly, or find the speed first. I'll find the speed first — cleaner.",
  },
  {
    key: "verify",
    name: "검증",
    en: "VERIFY",
    score: 20,
    delta: 6,
    pct: 80,
    desc: "답을 다른 방법으로 확인하는 능력. 계산 오류를 잡는 것 이상으로, 답이 논리적으로 타당한지 검토합니다.",
    quote: "Let me check: 48 × 5 = 240 ✓ and 48 × 8 = 384 ✓",
  },
  {
    key: "logic",
    name: "논리 흐름",
    en: "LOGIC",
    score: 17,
    delta: 4,
    pct: 68,
    desc: "각 단계가 논리적으로 연결되는 방식으로 풀이를 전개하는 능력. 앞 단계의 결론이 다음 단계의 전제가 되어야 합니다.",
    quote: "Since speed is constant, 8 hours is 8/5 of 5 hours — so distance is also 8/5 of 240.",
  },
  {
    key: "english",
    name: "영어 표현",
    en: "ENGLISH",
    score: 15,
    delta: 3,
    pct: 60,
    desc: "수학적 사고를 영어로 정확하게 표현하는 능력. 문법 정확도보다 '수학적 명제를 영어로 논리적으로 전달할 수 있는가'를 봅니다.",
    quote: "The distance increases proportionally with time, since the speed is constant.",
  },
];

const WEEKS = ["4/28", "5/5", "5/12", "5/19"];
const CHART_DATA: Record<ConstructKey, number[]> = {
  redefine: [45, 52, 64, 72],
  assume:   [30, 38, 48, 56],
  paths:    [35, 42, 55, 64],
  verify:   [40, 55, 70, 80],
  logic:    [38, 48, 58, 68],
  english:  [42, 50, 55, 60],
};

function MiniLineChart({ data }: { data: number[] }) {
  const W = 300, H = 120;
  const PAD = 10;
  const maxV = 100;
  const pts = data.map((v, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v / maxV) * (H - PAD * 2));
    return `${x},${y}`;
  });
  const d = `M ${pts.join(" L ")}`;

  return (
    <div className="lp-report-chart">
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 8, textTransform: "uppercase" }}>
        <span>4주 추이</span>
        <span>최근</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
        {/* grid lines */}
        {[25, 50, 75].map((v) => {
          const y = H - PAD - ((v / maxV) * (H - PAD * 2));
          return (
            <line key={v} x1={PAD} y1={y} x2={W - PAD} y2={y}
              stroke="rgba(20,17,12,0.07)" strokeWidth={1} strokeDasharray="4 4" />
          );
        })}
        {/* area fill */}
        <path
          d={`${d} L ${W - PAD},${H - PAD} L ${PAD},${H - PAD} Z`}
          fill="rgba(181,65,27,0.08)"
        />
        {/* line */}
        <path d={d} stroke="var(--accent)" strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {/* dots */}
        {data.map((v, i) => {
          const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
          const y = H - PAD - ((v / maxV) * (H - PAD * 2));
          return <circle key={i} cx={x} cy={y} r={4} fill="var(--accent)" stroke="var(--paper)" strokeWidth={2} />;
        })}
        {/* x-axis labels */}
        {WEEKS.map((w, i) => {
          const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
          return (
            <text key={i} x={x} y={H - 0} textAnchor="middle"
              style={{ font: "10px var(--font-mono)", fill: "var(--ink-4)", letterSpacing: "0.08em" }}>
              {w}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export function ReportPreview() {
  const [active, setActive] = useState<ConstructKey>("redefine");
  const detail = CONSTRUCTS.find((c) => c.key === active)!;

  return (
    <div className="lp-report-wrap">
      {/* header */}
      <div className="lp-report-head">
        <div className="who">
          이민준 학생
          <small>2학년 · 세션 12회 완료</small>
        </div>
        <div className="period">
          5월 3주차 · 2026-05-12 – 05-19
          <span className="delta">+17pt 성장</span>
        </div>
      </div>

      {/* body */}
      <div className="lp-report-body">
        {/* construct list */}
        <div className="lp-report-list">
          {CONSTRUCTS.map((c) => (
            <button
              key={c.key}
              className={`lp-construct${active === c.key ? " active" : ""}`}
              onClick={() => setActive(c.key)}
            >
              <div className="row">
                <span className="name">{c.name}</span>
                <span className="en">{c.en}</span>
              </div>
              <div className="row">
                <div className="bar">
                  <div className="fill" style={{ width: `${c.pct}%` }} />
                </div>
                <span className="score">
                  {c.score}pt
                  <span className="up">+{c.delta}</span>
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* detail */}
        <div className="lp-report-detail">
          <div className="lbl">{detail.en}</div>
          <h3>{detail.name}</h3>
          <p className="desc">{detail.desc}</p>
          <MiniLineChart data={CHART_DATA[active]} />
          <div className="lp-report-example">
            <div className="et">발화 근거</div>
            <p className="quote">"{detail.quote}"</p>
          </div>
        </div>
      </div>
    </div>
  );
}
