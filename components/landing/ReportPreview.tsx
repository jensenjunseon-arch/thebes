"use client";

import { useState } from "react";
import { CountUp } from "@/components/landing/CountUp";

type ConstructKey = "redefine" | "decompose" | "relate" | "relevance" | "transfer" | "english";

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
    en: "REFRAME",
    score: 18,
    delta: 5,
    pct: 72,
    desc: "문제를 그대로 읽지 않고, ‘무엇에 대한 이야기인지’를 자기 말로 다시 잡아내는 힘.",
    quote: "It's basically about a trip where the car goes one speed there and a different speed back.",
  },
  {
    key: "decompose",
    name: "구성 요소 분해",
    en: "DECOMPOSE",
    score: 16,
    delta: 4,
    pct: 64,
    desc: "상황 속에서 무엇이 정말 중요한 정보인지 골라내는 힘.",
    quote: "The things that matter are the two speeds, the distance, and the total time.",
  },
  {
    key: "relate",
    name: "관계 파악",
    en: "RELATE",
    score: 20,
    delta: 6,
    pct: 80,
    desc: "요소들이 서로 어떻게 영향을 주고받는지 보는 힘.",
    quote: "When the car drives slower, that part of the trip takes more time.",
  },
  {
    key: "relevance",
    name: "실생활 연결",
    en: "RELEVANCE",
    score: 14,
    delta: 3,
    pct: 56,
    desc: "이 사고가 자신의 삶에 어떤 의미인지 연결하는 힘.",
    quote: "This would help me plan when to leave so I'm not late, even with traffic.",
  },
  {
    key: "transfer",
    name: "확장적 사고",
    en: "TRANSFER",
    score: 17,
    delta: 4,
    pct: 68,
    desc: "한 상황의 원리를 주변과 미래로 넓혀 적용하는 힘.",
    quote: "If everyone broke problems down like this, people would make smarter decisions.",
  },
  {
    key: "english",
    name: "영어 표현",
    en: "ENGLISH",
    score: 15,
    delta: 3,
    pct: 60,
    desc: "이 모든 과정을 영어로 논리적으로 표현하는 힘. 문법이 아니라 사고 전달을 봅니다.",
    quote: "The average depends on the time spent, not just the two speeds.",
  },
];

const WEEKS = ["4/28", "5/5", "5/12", "5/19"];
const CHART_DATA: Record<ConstructKey, number[]> = {
  redefine:  [45, 52, 64, 72],
  decompose: [35, 42, 55, 64],
  relate:    [40, 55, 70, 80],
  relevance: [30, 38, 48, 56],
  transfer:  [38, 48, 58, 68],
  english:   [42, 50, 55, 60],
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
          <CountUp end={17} prefix="+" suffix="pt 성장" easing="cubic" duration={1200} className="delta" />
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
