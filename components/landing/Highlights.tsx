"use client";

// "한눈에 보기." — the Apple-style horizontal snap carousel. Four soft-pastel
// cards (cool gray / blush / chartreuse / slate), each a mini-mockup of one
// beat of the product loop, with dot navigation that tracks scroll position.
// Light cards flip to ink text + white mock panels; the slate card stays dark.

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

// Per-card gradients (shared across locales).
const GRAD = {
  photo: "radial-gradient(130% 110% at 50% 16%, #EEF1F4, #DEE3E8 58%, #CDD4DB 100%)",
  lines: "radial-gradient(130% 110% at 50% 16%, #F4E4E6, #EAD2D5 58%, #DCC0C5 100%)",
  build: "radial-gradient(130% 110% at 50% 16%, #EDF0A9, #DFE591 58%, #CED674 100%)",
  share: "radial-gradient(130% 110% at 50% 16%, #808FAB, #6C7C99 58%, #5A6A87 100%)",
};

const CARDS_KO = [
  {
    k: "photo",
    tone: "light" as const,
    eyebrow: "사진 한 장이면",
    title: "한국어 문제가\n영어 문제가 됩니다.",
    grad: GRAD.photo,
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
    tone: "light" as const,
    eyebrow: "정답이 아니라",
    title: "풀이 계획을\n한 줄씩, 영어로.",
    grad: GRAD.lines,
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
    tone: "light" as const,
    eyebrow: "풀이가 끝나면",
    title: "내 생각이\n게임이 됩니다.",
    grad: GRAD.build,
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
    tone: "dark" as const,
    eyebrow: "그리고",
    title: "링크 하나로\n친구에게 자랑.",
    grad: GRAD.share,
    mock: (
      <div className="hl-mock">
        <div className="hl-bubble">내가 만든 게임 해봐 👀</div>
        <div className="hl-link">thebes.ai/play/x7k2a9</div>
        <p className="hl-ko">받은 친구도 자기 문제로 만들 수 있어요</p>
      </div>
    ),
  },
];

const CARDS_EN = [
  {
    k: "photo",
    tone: "light" as const,
    eyebrow: "One photo,",
    title: "your problem,\nnow in English.",
    grad: GRAD.photo,
    mock: (
      <div className="hl-mock">
        <div className="hl-chip-row">
          <span className="hl-chip">📷 Problem photo</span>
          <span className="hl-arrow">→</span>
          <span className="hl-chip on">English</span>
        </div>
        <p className="hl-en">
          A garden is <u>12 m</u> wide. What is the <u>perimeter</u>?
        </p>
        <p className="hl-ko">Hover any underlined word for its meaning.</p>
      </div>
    ),
  },
  {
    k: "lines",
    tone: "light" as const,
    eyebrow: "Not the answer —",
    title: "your plan,\none line at a time.",
    grad: GRAD.lines,
    mock: (
      <div className="hl-mock">
        <p className="hl-en">First, I need to find the length…</p>
        <div className="hl-chip-row">
          <span className="hl-chip on">✓ Sharp move</span>
          <span className="hl-chip">coach replies in ~1s</span>
        </div>
        <p className="hl-ko">Stuck? — &ldquo;Try writing it like this.&rdquo;</p>
      </div>
    ),
  },
  {
    k: "build",
    tone: "light" as const,
    eyebrow: "When you're done,",
    title: "your idea\nbecomes a game.",
    grad: GRAD.build,
    mock: (
      <div className="hl-mock">
        <div className="hl-game">
          <span className="hl-game-title">More speed, less time</span>
          <span className="hl-game-btn">PLAY ▶</span>
        </div>
        <p className="hl-ko">One tap → ~90s → it plays right here.</p>
      </div>
    ),
  },
  {
    k: "share",
    tone: "dark" as const,
    eyebrow: "And then,",
    title: "one link —\n“play my game.”",
    grad: GRAD.share,
    mock: (
      <div className="hl-mock">
        <div className="hl-bubble">play the game I made 👀</div>
        <div className="hl-link">thebes.ai/play/x7k2a9</div>
        <p className="hl-ko">Whoever opens it can build their own.</p>
      </div>
    ),
  },
];

export function Highlights({ lang = "ko" }: { lang?: "ko" | "en" }) {
  const CARDS = lang === "en" ? CARDS_EN : CARDS_KO;
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
          <article
            key={c.k}
            className={cn("hl-card", c.tone === "light" && "hl-card--light")}
            style={{ background: c.grad }}
          >
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
            aria-label={lang === "en" ? `Card ${i + 1}` : `${i + 1}번째 카드`}
            onClick={() => goTo(i)}
            className={cn("hl-dot", active === i && "on")}
          />
        ))}
      </div>
    </div>
  );
}
