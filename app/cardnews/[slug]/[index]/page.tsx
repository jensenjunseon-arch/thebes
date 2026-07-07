import { notFound } from "next/navigation";
import { getDeck } from "@/lib/cardnews/decks";
import { CardNewsCard } from "@/components/cardnews/CardNewsCard";

// Full-bleed single card at exact canvas size. Resize the viewport to the card
// dimensions (1080×1080) and screenshot for a pixel-perfect PNG export.
export default async function CardExport({
  params,
}: {
  params: Promise<{ slug: string; index: string }>;
}) {
  const { slug, index } = await params;
  const deck = getDeck(slug);
  if (!deck) notFound();

  const i = Number(index);
  if (!Number.isInteger(i) || i < 0 || i >= deck.cards.length) notFound();

  return (
    <div className="cn-export">
      <CardNewsCard
        card={deck.cards[i]}
        index={i}
        total={deck.cards.length}
        size={deck.size}
        tagline={deck.tagline}
      />
    </div>
  );
}
