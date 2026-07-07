import { Fragment } from "react";
import type { Card, CardSize } from "@/lib/cardnews/types";

/* ── Brand mark (graduation arc) — mirrors app/page.tsx ──────────────────── */
function BrandMark({ size = 34, onDark = false }: { size?: number; onDark?: boolean }) {
  const ink = onDark ? "#F6F2E8" : "#14110C";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M6 28 V14 a10 10 0 0 1 20 0 V28" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      <path d="M11 28 V18 a5 5 0 0 1 10 0 V28" stroke="#B5411B" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="11" r="1.6" fill="#B5411B" />
    </svg>
  );
}

/* ── Rich text: "\n" → break, "*x*" → accent emphasis ────────────────────── */
function renderRich(text: string) {
  return text.split("\n").map((line, li) => (
    <Fragment key={li}>
      {li > 0 && <br />}
      {line.split(/(\*[^*]+\*)/g).map((part, pi) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <em key={pi} className="cn-em">
            {part.slice(1, -1)}
          </em>
        ) : (
          <Fragment key={pi}>{part}</Fragment>
        ),
      )}
    </Fragment>
  ));
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/* ── Top bar: brand + page number ────────────────────────────────────────── */
function TopBar({ index, total, onDark }: { index: number; total: number; onDark: boolean }) {
  return (
    <header className="cn-top">
      <div className="cn-brand">
        <BrandMark onDark={onDark} />
        <span className="cn-wordmark">
          Thebes<span className="cn-wordmark-ai">AI</span>
        </span>
      </div>
      <span className="cn-page">
        {pad2(index + 1)} <span className="cn-page-sep">/</span> {pad2(total)}
      </span>
    </header>
  );
}

/* ── Bottom bar: tag / url + swipe hint ──────────────────────────────────── */
function BottomBar({
  card,
  index,
  total,
  tagline,
}: {
  card: Card;
  index: number;
  total: number;
  tagline?: string;
}) {
  const isLast = index === total - 1;
  return (
    <footer className="cn-bot">
      {card.template === "cta" ? (
        <span className="cn-bot-url">{card.url}</span>
      ) : (
        <span className="cn-bot-tag">{tagline ?? "사고를 가르치는 AI 코치"}</span>
      )}
      {!isLast && card.template !== "cta" && <span className="cn-swipe">밀어서 보기 →</span>}
    </footer>
  );
}

/* ── Per-template body ───────────────────────────────────────────────────── */
function CardBody({ card }: { card: Card }) {
  switch (card.template) {
    case "cover":
      return (
        <div className="cn-body cn-body-cover">
          {card.kicker && <div className="cn-kicker">{card.kicker}</div>}
          <h1 className="cn-title cn-title-cover">{renderRich(card.title)}</h1>
          {card.note && <p className="cn-cover-note">{card.note}</p>}
        </div>
      );

    case "statement":
      return (
        <div className="cn-body cn-body-statement">
          {card.kicker && <div className="cn-kicker">{card.kicker}</div>}
          <h2 className="cn-title cn-title-statement">{renderRich(card.title)}</h2>
          {card.body && <p className="cn-lede">{card.body}</p>}
        </div>
      );

    case "compare":
      return (
        <div className="cn-body cn-body-compare">
          {card.kicker && <div className="cn-kicker">{card.kicker}</div>}
          <h2 className="cn-heading">{renderRich(card.heading)}</h2>
          <div className="cn-compare">
            <div className="cn-col cn-col-us">
              <div className="cn-col-label">{card.us.label}</div>
              <div className="cn-col-h">{card.us.h}</div>
              <p className="cn-col-p">{card.us.p}</p>
            </div>
            <div className="cn-col cn-col-them">
              <div className="cn-col-label">{card.them.label}</div>
              <div className="cn-col-h">{card.them.h}</div>
              <p className="cn-col-p">{card.them.p}</p>
            </div>
          </div>
        </div>
      );

    case "process":
      return (
        <div className="cn-body cn-body-process">
          {card.kicker && <div className="cn-kicker">{card.kicker}</div>}
          <h2 className="cn-heading">{renderRich(card.heading)}</h2>
          <ol className="cn-steps">
            {card.steps.map((s, i) => (
              <li key={i} className="cn-step">
                <span className="cn-step-n">{pad2(i + 1)}</span>
                <span className="cn-step-k">{s}</span>
              </li>
            ))}
          </ol>
          {card.foot && <p className="cn-foot">{card.foot}</p>}
        </div>
      );

    case "list":
      return (
        <div className="cn-body cn-body-list">
          {card.kicker && <div className="cn-kicker">{card.kicker}</div>}
          <h2 className="cn-heading">{renderRich(card.heading)}</h2>
          <ul className="cn-list">
            {card.items.map((it, i) => (
              <li key={i} className="cn-li">
                <span className="cn-li-n">{pad2(i + 1)}</span>
                <span className="cn-li-k">{it.k}</span>
                {it.en && <span className="cn-li-en">{it.en}</span>}
              </li>
            ))}
          </ul>
        </div>
      );

    case "report": {
      const max = 5;
      return (
        <div className="cn-body cn-body-report">
          {card.kicker && <div className="cn-kicker">{card.kicker}</div>}
          <h2 className="cn-heading">{renderRich(card.heading)}</h2>
          <div className="cn-bars">
            {card.bars.map((b, i) => (
              <div key={i} className="cn-bar-row">
                <span className="cn-bar-k">{b.k}</span>
                <span className="cn-bar-track">
                  <span className="cn-bar-fill" style={{ width: `${(b.v / max) * 100}%` }} />
                </span>
                <span className="cn-bar-v">{b.v.toFixed(1)}</span>
              </div>
            ))}
          </div>
          {card.foot && <p className="cn-foot">{card.foot}</p>}
        </div>
      );
    }

    case "cta":
      return (
        <div className="cn-body cn-body-cta">
          {card.kicker && <div className="cn-kicker">{card.kicker}</div>}
          <h2 className="cn-title cn-title-cta">{renderRich(card.title)}</h2>
          {card.sub && <p className="cn-lede">{renderRich(card.sub)}</p>}
          <div className="cn-cta-row">
            <span className="cn-cta-pill">{card.pill ?? "사고력 진단 무료로 시작 →"}</span>
            {card.handle && <span className="cn-cta-handle">{card.handle}</span>}
          </div>
        </div>
      );
  }
}

/* ── Public component — one 1080×1080 card ───────────────────────────────── */
export function CardNewsCard({
  card,
  index,
  total,
  size,
  tagline,
}: {
  card: Card;
  index: number;
  total: number;
  size: CardSize;
  tagline?: string;
}) {
  const theme = card.theme ?? "paper";
  const onDark = theme === "dark";
  return (
    <div
      className={`cn-card cn-${theme} cn-tpl-${card.template}`}
      style={{ width: size.w, height: size.h }}
    >
      <TopBar index={index} total={total} onDark={onDark} />
      <CardBody card={card} />
      <BottomBar card={card} index={index} total={total} tagline={tagline} />
    </div>
  );
}
