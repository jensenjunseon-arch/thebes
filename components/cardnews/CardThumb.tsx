import { CardNewsCard } from "./CardNewsCard";
import type { Card, CardSize } from "@/lib/cardnews/types";

// Renders a full-fidelity card scaled down to `width` px via CSS transform, so
// the review thumbnail is pixel-identical to the exported full-size artwork.
export function CardThumb({
  card,
  index,
  total,
  size,
  width,
}: {
  card: Card;
  index: number;
  total: number;
  size: CardSize;
  width: number;
}) {
  const scale = width / size.w;
  return (
    <div className="cn-thumb" style={{ width, height: size.h * scale }}>
      <div
        className="cn-thumb-inner"
        style={{ width: size.w, height: size.h, transform: `scale(${scale})` }}
      >
        <CardNewsCard card={card} index={index} total={total} size={size} />
      </div>
    </div>
  );
}
