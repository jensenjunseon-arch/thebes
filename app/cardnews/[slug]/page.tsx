import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { getDeck, DECKS } from "@/lib/cardnews/decks";
import { CardThumb } from "@/components/cardnews/CardThumb";

const pad2 = (n: number) => String(n).padStart(2, "0");

export function generateStaticParams() {
  return DECKS.map((d) => ({ slug: d.slug }));
}

// Review view — every card in the deck, scaled to fit, each with a link to its
// full-bleed export route for a clean 1080×1080 capture.
export default async function DeckReview({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const deck = getDeck(slug);
  if (!deck) notFound();

  const total = deck.cards.length;
  return (
    <div className="cn-stage">
      <div className="cn-shell">
        <Link href="/cardnews" className="cn-back">
          ← 모든 덱
        </Link>
        <div className="cn-eyebrow-l" style={{ marginTop: 22 }}>
          {deck.channel ?? "카드뉴스"}
        </div>
        <h1 className="cn-h1">{deck.title}</h1>
        <p className="cn-sub">
          토픽 — {deck.topic}
          <br />각 카드의 <code>PNG 내보내기</code>를 새 탭에서 열면 1080×1080 풀사이즈로 캡처됩니다.
        </p>

        <div className="cn-grid">
          {deck.cards.map((card, i) => (
            <div key={i} className="cn-cell">
              <CardThumb
                card={card}
                index={i}
                total={total}
                size={deck.size}
                width={340}
                tagline={deck.tagline}
              />
              <div className="cn-cell-cap">
                <span>
                  {pad2(i + 1)} · {card.template}
                </span>
                <Link href={`/cardnews/${deck.slug}/${i}` as Route} target="_blank">
                  PNG 내보내기 ↗
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
