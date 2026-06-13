"use client";

// "한눈에 보기." — the Apple-style horizontal snap carousel. Four dark gradient
// cards, each a mini-mockup of one beat of the product loop, with dot
// navigation that tracks scroll position.

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const CARDS = [
  {
    k: "photo",
    eyebrow: "사진 한 장이면",
    title: "한국어 문제가\n영어 문제가 됩니다.",
    grad: "radial-gradient(130% 115% at 22% 6%, rgba(126,182,255,0.42), transparent 52%), linear-gradient(155deg, #0A2A6B 0%, #0B57D0 58%, #2E7DF0 100%)",
    mock: (
      <div className="hl-mock">
        <div className="hl-chip-row">
          <span className="hl-chip">📷 문제 사진</span>
          <span className="hl-arrow">→</span>
          <span className="hl-chip on">English</span>
        </div>
        <p className="hl-en">
          A garden is <u>12 m</u> wide. What is the <u>perimeter</u>?
        </p>
        <p className="hl-ko">밑줄 단어에 손을 올리면 한국어 뜻이 떠요</p>
      </div>
    ),
  },
  {
    k: "lines",
    eyebrow: "정답이 아니라",
    title: "풀이 계획을\n한 줄씩, 영어로.",
    grad: "radial-gradient(130% 115% at 78% 6%, rgba(197,162,255,0.42), transparent 52%), linear-gradient(155deg, #241A54 0%, #5B3FB0 56%, #9F77D6 100%)",
    mock: (
      <div className="hl-mock">
        <p className="hl-en">First, I need to find the length…</p>
        <div className="hl-chip-row">
          <span className="hl-chip on">✓ 멋진 수</span>
          <span className="hl-chip">코치가 1초 만에 반응</span>
        </div>
        <p className="hl-ko">막히면 — &ldquo;이렇게 써보는 건 어때요?&rdquo;</p>
      </div>
    ),
  },
  {
    k: "build",
    eyebrow: "풀이가 끝나면",
    title: "내 생각이\n게임이 됩니다.",
    grad: "radial-gradient(130% 115% at 28% 6%, rgba(255,192,150,0.5), transparent 55%), linear-gradient(155deg, #5A1E3A 0%, #C13E6A 52%, #F2795E 100%)",
    mock: (
      <div className="hl-mock">
        <div className="hl-game">
          <span className="hl-game-title">속도를 더하면 시간이 줄어든다</span>
          <span className="hl-game-btn">PLAY ▶</span>
        </div>
        <p className="hl-ko">버튼 하나 → 90초 → 이 자리에서 바로 플레이</p>
      </div>
    ),
  },
  {
    k: "share",
    eyebrow: "그리고",
    title: "링크 하나로\n친구에게 자랑.",
    grad: "radial-gradient(130% 115% at 72% 6%, rgba(150,228,228,0.4), transparent 52%), linear-gradient(155deg, #0C3550 0%, #14788A 55%, #2FA6B4 100%)",
    mock: (
      <div className="hl-mock">
        <div className="hl-bubble">내가 만든 게임 해봐 👀</div>
        <div className="hl-link">thebes.ai/play/x7k2a9</div>
        <p className="hl-ko">받은 친구도 자기 문제로 만들 수 있어요</p>
      </div>
    ),
  },
];

export function Highlights() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      const w = el.firstElementChild?.clientWidth ?? 1;
      setActive(Math.round(el.scrollLeft / (w + 16)));
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  function goTo(i: number) {
    const el = trackRef.current;
    if (!el) return;
    const w = el.firstElementChild?.clientWidth ?? 0;
    el.scrollTo({ left: i * (w + 16), behavior: "smooth" });
  }

  return (
    <div>
      <div ref={trackRef} className="hl-track">
        {CARDS.map((c) => (
          <article key={c.k} className="hl-card" style={{ background: c.grad }}>
            <p className="hl-eyebrow">{c.eyebrow}</p>
            <h3 className="hl-title">
              {c.title.split("\n").map((l, i) => (
                <span key={i}>
                  {l}
                  <br />
                </span>
              ))}
            </h3>
            {c.mock}
          </article>
        ))}
      </div>
      <div className="hl-dots">
        {CARDS.map((c, i) => (
          <button
            key={c.k}
            type="button"
            aria-label={`${i + 1}번째 카드`}
            onClick={() => goTo(i)}
            className={cn("hl-dot", active === i && "on")}
          />
        ))}
      </div>
    </div>
  );
}
