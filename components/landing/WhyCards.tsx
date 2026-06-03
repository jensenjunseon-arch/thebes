"use client";

import { useEffect, useRef, useState } from "react";

const CARDS = [
  {
    n: "1",
    title: "AI는 속으로 영어로 사고합니다",
    body: "한국어로 물어도 AI는 속으론 영어로 바꿔 생각합니다. 영어로 사고하는 사람이 AI를 가장 정확히 부립니다.",
    quote: "\"수학을 영어로 사고하는 순간, AI의 모국어로 사고하게 됩니다.\"",
  },
  {
    n: "2",
    title: "‘괜찮다’는 Okay일까, No thanks일까",
    body: "‘괜찮다’처럼 맥락에 기댄 말을 AI는 못 읽습니다. 영어로 사고하면 ‘무엇을·왜’가 또렷해집니다.",
    quote: "\"‘알아서 해줘’는 AI에게 가장 약한 말입니다.\"",
  },
  {
    n: "3",
    title: "언어로 사고하는 힘이, AI 시대의 직업이 됩니다",
    body: "AI를 언어로 다루는 직업(프롬프트 엔지니어)은 전공 무관, 시작 연봉 최대 1억 원. 사고를 언어로 표현하는 힘이 곧 무기입니다.",
    quote: "\"기술은 1년이면 바뀝니다. 변하지 않는 건, 자신의 언어로 사고하는 힘입니다.\"",
  },
];

// The three "why English" cards, revealed one by one as the row scrolls in.
export function WhyCards() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="lp-why-three" ref={ref}>
      {CARDS.map((c, i) => (
        <div
          key={c.n}
          className="lp-why-card"
          style={{
            opacity: shown ? 1 : 0,
            transform: shown ? "none" : "translateY(16px)",
            transition: `opacity .55s cubic-bezier(.22,1,.36,1) ${i * 180}ms, transform .55s cubic-bezier(.22,1,.36,1) ${i * 180}ms`,
          }}
        >
          <div className="ord">{c.n}</div>
          <h3>{c.title}</h3>
          <p>{c.body}</p>
          <div className="quote">{c.quote}</div>
        </div>
      ))}
    </div>
  );
}
