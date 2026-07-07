import Link from "next/link";
import type { Route } from "next";
import { DECKS } from "@/lib/cardnews/decks";
import { CardThumb } from "@/components/cardnews/CardThumb";

// Gallery of every card-news deck. Each deck is generated from a single topic
// line and rendered entirely in code from the brand tokens.
export default function CardnewsGallery() {
  return (
    <div className="cn-stage">
      <div className="cn-shell">
        <div className="cn-eyebrow-l">Card News Studio</div>
        <h1 className="cn-h1">코드로 렌더링하는 카드뉴스</h1>
        <p className="cn-sub">
          토픽 한 줄 → 카드뉴스 한 세트. 모든 카드는 브랜드 토큰으로 코드에서 그려지며,
          덱을 열어 카드별 PNG를 1080×1080으로 내보낼 수 있습니다.
        </p>

        <div className="cn-decks">
          {DECKS.map((deck) => (
            <Link key={deck.slug} href={`/cardnews/${deck.slug}` as Route} className="cn-deck-link">
              <CardThumb
                card={deck.cards[0]}
                index={0}
                total={deck.cards.length}
                size={deck.size}
                width={360}
                tagline={deck.tagline}
              />
              <div className="cn-deck-meta">
                <div className="cn-deck-title">{deck.title}</div>
                <div className="cn-deck-topic">{deck.topic}</div>
                {deck.channel && (
                  <div className="cn-deck-chan">
                    {deck.channel} · {deck.cards.length}컷
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
