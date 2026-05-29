"use client";

import { useState } from "react";

type Step = 0 | 1 | 2 | 3;

const STEPS = [
  { n: "STEP 01", t: "Frame it", sub: "문제 파악" },
  { n: "STEP 02", t: "Plan it", sub: "계획 세우기" },
  { n: "STEP 03", t: "Work it", sub: "풀이" },
  { n: "STEP 04", t: "Look back", sub: "검토" },
];

type Bubble = { role: "ai" | "you"; text: string; anno?: string };

const CHATS: Bubble[][] = [
  // Frame it
  [
    { role: "ai", text: "Read the problem once more. In your own words — what are you being asked to find?", anno: "REDEFINE" },
    { role: "you", text: "I need to find how far the train will travel in 8 hours." },
    { role: "ai", text: "Good. And what information does the problem give you?", anno: "ASSUME" },
    { role: "you", text: "It travels 240 km in 5 hours. And the speed stays the same." },
  ],
  // Plan it
  [
    { role: "ai", text: "Good. What relationship connects distance, speed, and time?" },
    { role: "you", text: "distance = speed × time" },
    { role: "ai", text: "Exactly. Walk me through your plan — what will you calculate first?", anno: "PATHS" },
    { role: "you", text: "First I'll find the speed using the 240 km and 5 hours. Then use that speed for 8 hours." },
  ],
  // Work it
  [
    { role: "ai", text: "Good plan. Now execute it — show each step clearly." },
    { role: "you", text: "Speed = 240 ÷ 5 = 48 km/h\nDistance = 48 × 8 = 384 km" },
    { role: "ai", text: "Nice. You found the speed first, then applied it. Is your answer labelled with units?", anno: "VERIFY" },
    { role: "you", text: "Yes — 384 km." },
  ],
  // Look back
  [
    { role: "ai", text: "Great. Now verify — does your answer make sense? Check it a different way." },
    { role: "you", text: "If 240 km takes 5 hours, then 8 hours is 8/5 times as far. 240 × 8/5 = 384 ✓", anno: "LOGIC" },
    { role: "ai", text: "Excellent — you used proportional reasoning to verify independently. That's the mark of a strong solver.", anno: "ENGLISH" },
  ],
];

const SKILLS = [
  { key: "REDEFINE",  label: "문제 재정의",  pcts: [38, 55, 67, 72] },
  { key: "ASSUME",    label: "가정 명시",    pcts: [20, 45, 60, 68] },
  { key: "PATHS",     label: "풀이 경로",    pcts: [15, 30, 62, 75] },
  { key: "VERIFY",    label: "검증",         pcts: [10, 22, 55, 80] },
  { key: "LOGIC",     label: "논리 흐름",    pcts: [25, 40, 58, 70] },
  { key: "ENGLISH",   label: "영어 표현",    pcts: [42, 55, 65, 78] },
];

export function PolyaDemo() {
  const [step, setStep] = useState<Step>(0);

  return (
    <div className="lp-demo-wrap">
      {/* top bar */}
      <div className="lp-demo-top">
        <div className="left">
          <span className="pill">중2 · 비율과 비례</span>
          <span>B1 English</span>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.14em", color: "var(--ink-4)", textTransform: "uppercase" }}>
          데모 세션
        </span>
      </div>

      {/* step bar */}
      <div className="lp-demo-step-bar">
        {STEPS.map((s, i) => (
          <button
            key={i}
            className={`stp${step === i ? " active" : ""}${step > i ? " done" : ""}`}
            onClick={() => setStep(i as Step)}
          >
            <div className="n">{s.n}</div>
            <div className="t">
              {s.t}
              <small>{s.sub}</small>
            </div>
          </button>
        ))}
      </div>

      {/* body */}
      <div className="lp-demo-body">
        {/* chat */}
        <div className="lp-demo-chat">
          {CHATS[step].map((b, i) => (
            <div key={i} className={`lp-bubble ${b.role}`}>
              <span className="who">{b.role === "ai" ? "Thebes" : "You"}</span>
              <span style={{ whiteSpace: "pre-line" }}>{b.text}</span>
              {b.anno && <span className="anno">{b.anno}</span>}
            </div>
          ))}
        </div>

        {/* side panel */}
        <div className="lp-demo-side">
          <div className="lbl">문제</div>
          <div className="problem">
            <span className="num">Q. </span>
            A train travels <strong>240 km</strong> in <strong>5 hours</strong> at a constant speed.
            How far will it travel in <strong>8 hours</strong>?
          </div>

          <div className="lp-skills" style={{ marginTop: 24 }}>
            <div className="lbl" style={{ marginBottom: 0 }}>사고력 구인</div>
            {SKILLS.map((sk) => (
              <div key={sk.key} className="lp-skill">
                <span className="n">{sk.label}</span>
                <div className="bar">
                  <div className="fill" style={{ width: `${sk.pcts[step]}%` }} />
                </div>
                <span className="v">{sk.pcts[step]}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="lp-demo-foot">
        <div className="progress">
          {STEPS.map((_, i) => (
            <span key={i} className={step >= i ? "active" : ""} />
          ))}
        </div>
        <div className="nav-btns">
          <button disabled={step === 0} onClick={() => setStep((step - 1) as Step)}>
            ← 이전
          </button>
          <button
            className="primary"
            disabled={step === 3}
            onClick={() => setStep((step + 1) as Step)}
          >
            다음 단계 →
          </button>
        </div>
      </div>
    </div>
  );
}
