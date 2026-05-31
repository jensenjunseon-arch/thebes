"use client";

import { useState } from "react";

type Step = 0 | 1 | 2 | 3 | 4;

// The widening-arc demo (formerly the Pólya 4-step demo). The coach never asks
// for the answer — it widens the student's thinking outward.
const STEPS = [
  { n: "01", t: "Reframe", sub: "재정의" },
  { n: "02", t: "Decompose", sub: "구성요소" },
  { n: "03", t: "Relate", sub: "관계" },
  { n: "04", t: "Relevance", sub: "실생활" },
  { n: "05", t: "Transfer", sub: "확장" },
];

type Bubble = { role: "ai" | "you"; text: string; anno?: string };

const CHATS: Bubble[][] = [
  // Reframe
  [
    { role: "ai", text: "Forget the answer — any AI gets that in seconds. In your own words: what is this situation actually about?", anno: "REFRAME" },
    { role: "you", text: "It's about a car making a round trip, but driving a different speed each way." },
  ],
  // Decompose
  [
    { role: "ai", text: "Nice — you saw it your own way. Now, what are the key things that matter here?", anno: "DECOMPOSE" },
    { role: "you", text: "The two speeds, the distance, and the total time of the trip." },
  ],
  // Relate
  [
    { role: "ai", text: "Here's the interesting part — how do those things affect each other?", anno: "RELATE" },
    { role: "you", text: "When the car drives slower on the way back, that part takes more time." },
  ],
  // Relevance
  [
    { role: "ai", text: "Step back from the numbers — where in your own life would understanding this actually help you?", anno: "RELEVANCE" },
    { role: "you", text: "Planning when to leave so I'm not late, even when traffic changes my speed." },
  ],
  // Transfer
  [
    { role: "ai", text: "Last one — zoom all the way out. If lots of people could think like this?", anno: "TRANSFER" },
    { role: "you", text: "They'd make smarter decisions instead of just trusting the first number they see." },
    { role: "ai", text: "That's the leap from solving to thinking — and you did it in English.", anno: "ENGLISH" },
  ],
];

const SKILLS = [
  { key: "REDEFINE",  label: "문제 재정의",   pcts: [60, 62, 64, 66, 68] },
  { key: "DECOMPOSE", label: "구성 요소 분해", pcts: [18, 64, 66, 68, 70] },
  { key: "RELATE",    label: "관계 파악",     pcts: [12, 28, 70, 72, 74] },
  { key: "RELEVANCE", label: "실생활 연결",   pcts: [8, 12, 18, 68, 70] },
  { key: "TRANSFER",  label: "확장적 사고",   pcts: [8, 10, 14, 20, 74] },
  { key: "ENGLISH",   label: "영어 표현",     pcts: [42, 52, 60, 66, 76] },
];

export function PolyaDemo() {
  const [step, setStep] = useState<Step>(0);

  return (
    <div className="lp-demo-wrap">
      {/* top bar */}
      <div className="lp-demo-top">
        <div className="left">
          <span className="pill">중2 · 속력</span>
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
            <div className="n">STEP {s.n}</div>
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
            A car travels from A to B at <strong>40 km/h</strong> and returns at{" "}
            <strong>60 km/h</strong>. What is its average speed?
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
            disabled={step === 4}
            onClick={() => setStep((step + 1) as Step)}
          >
            다음 단계 →
          </button>
        </div>
      </div>
    </div>
  );
}
