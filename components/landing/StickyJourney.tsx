"use client";

// The Apple chip-story pattern, translated: a STICKY visual on the left morphs
// through four stages of one problem's journey while the copy steps scroll by
// on the right. IntersectionObserver drives the active stage.

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const STEPS = [
  {
    k: "photo",
    label: "STEP 1 · 올리기",
    title: "교과서 문제를 찍어 올립니다.",
    body: "사진이든, 붙여넣기든, 문제가 없으면 만들어주기까지. 10초면 준비 끝.",
  },
  {
    k: "english",
    label: "STEP 2 · 영어로",
    title: "AI가 읽고, 영어 문제로 바꿉니다.",
    body: "문장에 손을 올리면 한국어 해석이, 핵심 어휘는 내 단어장으로. 도형은 직접 돌려봅니다.",
  },
  {
    k: "lines",
    label: "STEP 3 · 한 줄씩",
    title: "풀이 계획을 영어로 써 내려갑니다.",
    body: "코치가 줄마다 1초 만에 반응해요. 막히면 모범 문장을 따라 쓰며 배웁니다.",
  },
  {
    k: "artifact",
    label: "STEP 4 · 결과물",
    title: "내 풀이가 게임이 되어 돌아옵니다.",
    body: "이 자리에서 바로 플레이하고, 마음에 안 들면 AI에게 고치라고 시키고, 링크로 자랑하세요.",
  },
];

function Visual({ stage }: { stage: number }) {
  return (
    <div className="sj-visual">
      {/* stage 0 — the photo */}
      <div className={cn("sj-scene", stage === 0 && "on")}>
        <div className="sj-photo">
          <span className="sj-photo-badge">📷</span>
          <p className="sj-kr">
            직사각형 모양의 정원이 있습니다. 가로는 12m이고, 세로는 가로보다 4m 짧습니다. 이
            정원의 둘레는 몇 m일까요?
          </p>
        </div>
      </div>
      {/* stage 1 — english + vocab + figure */}
      <div className={cn("sj-scene", stage === 1 && "on")}>
        <div className="sj-card">
          <p className="sj-en">
            There is a <u>rectangular garden</u>. The <u>width</u> is 12 m… What is the{" "}
            <u>perimeter</u>?
          </p>
          <div className="sj-strip">직사각형 모양의 정원이 있습니다 …</div>
          <svg viewBox="0 0 120 64" className="sj-fig" aria-hidden>
            <rect
              x="22"
              y="10"
              width="76"
              height="44"
              rx="2"
              fill="rgba(11,87,208,0.07)"
              stroke="#1F1F1F"
              strokeWidth="1.6"
            />
            <text x="60" y="8" fontSize="7" textAnchor="middle" fill="#6E7276">
              12 m
            </text>
            <text x="60" y="62" fontSize="7" textAnchor="middle" fill="#0B57D0">
              드래그해서 돌려보세요 ↻
            </text>
          </svg>
        </div>
      </div>
      {/* stage 2 — line coaching */}
      <div className={cn("sj-scene", stage === 2 && "on")}>
        <div className="sj-card">
          <p className="sj-en">1&nbsp; First, I need to find the length.</p>
          <span className="sj-verdict">✓ 멋진 수</span>
          <p className="sj-comment">정확해요! 길이를 구하는 게 첫 단계네요.</p>
          <p className="sj-en dim">2&nbsp; Then, the perimeter is two times…</p>
          <span className="sj-verdict alt">👍 좋아요</span>
        </div>
      </div>
      {/* stage 3 — the game */}
      <div className={cn("sj-scene", stage === 3 && "on")}>
        <div className="sj-game">
          <p className="sj-game-title">둘레 수비대 🛡️</p>
          <p className="sj-game-sub">FINAL LEVEL — 너의 바로 그 문제</p>
          <div className="sj-game-row">
            <span className="sj-game-pill">PLAY ▶</span>
            <span className="sj-game-link">/play/x7k2a9 🔗</span>
          </div>
          <p className="sj-game-quote">&ldquo;네가 말한 대로였어.&rdquo;</p>
        </div>
      </div>
    </div>
  );
}

export function StickyJourney() {
  const [stage, setStage] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll-driven (not IO, not rAF-deferred — throttled tabs freeze both):
  // the step whose center sits closest to the viewport center is active.
  // Four rect reads per coalesced scroll tick is nothing.
  useEffect(() => {
    function pick() {
      const mid = window.innerHeight / 2;
      let best = 0;
      let bestDist = Infinity;
      stepRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const d = Math.abs((r.top + r.bottom) / 2 - mid);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setStage(best);
    }
    pick();
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick, { passive: true });
    return () => {
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
    };
  }, []);

  return (
    <div className="sj-grid">
      <div className="sj-sticky">
        <Visual stage={stage} />
        <div className="sj-progress">
          {STEPS.map((s, i) => (
            <span key={s.k} className={cn("sj-tick", i <= stage && "on")} />
          ))}
        </div>
      </div>
      <div className="sj-steps">
        {STEPS.map((s, i) => (
          <div
            key={s.k}
            data-idx={i}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            className={cn("sj-step", stage === i && "on")}
          >
            <p className="sj-label">{s.label}</p>
            <h3 className="sj-title">{s.title}</h3>
            <p className="sj-body">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
