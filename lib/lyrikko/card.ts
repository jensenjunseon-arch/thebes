// Lyrikko collectible word card — pure data/layout helpers, no rendering here
// (see app/api/lyrikko/card/route.tsx for the actual satori/next-og render).
//
// Deliberately NO idol photos, likenesses, group logos, or official chart
// branding on the card — see the expansion-validation research: unlicensed
// member photocards are an actively-enforced 부정경쟁방지법 (타)목 violation in
// Korea (지식재산처 first corrective orders, 2026-03-05). Everything here is
// either factual metadata (song/artist/date as text) or generated identity
// (era palette, personal collection number) — nothing that requires a label
// license. Faces are reserved for after a real label deal exists.

// The physical 포카(photocard) aspect ratio, 55mm × 85mm ≈ 1:1.545. Rendered
// at 12x for a crisp save/print resolution.
export const CARD_W = 660;
export const CARD_H = 1020;

// Instagram Story canvas, 2025+ spec: 1080×1920 with ~250px top/bottom safe
// zones so the card isn't clipped by the UI chrome.
export const STORY_W = 1080;
export const STORY_H = 1920;
export const STORY_SAFE = 250;

export interface EraPalette {
  /** CSS color for the gradient's first stop. */
  from: string;
  /** CSS color for the gradient's second stop. */
  to: string;
  /** Foreground ink color that reads well against this gradient. */
  ink: string;
  /** Softer foreground for secondary text. */
  inkSoft: string;
  /** Story-canvas backdrop stops: same era hue pulled way down in lightness,
   *  so the vivid card floats on a deep tinted field instead of blending in. */
  bgFrom: string;
  bgTo: string;
}

// FNV-1a-style string hash — deterministic, no crypto dependency. Same
// song+artist always yields the same hue, so every card from one comeback
// reads as a matching "era" set without needing an AI call or an official
// color reference.
function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function eraPalette(song: string, artist: string): EraPalette {
  const hue = hashString(`${song}|${artist}`) % 360;
  const hue2 = (hue + 38) % 360;
  return {
    from: `hsl(${hue}, 62%, 46%)`,
    to: `hsl(${hue2}, 58%, 24%)`,
    ink: "#FBF9F4",
    inkSoft: "rgba(251, 249, 244, 0.72)",
    bgFrom: `hsl(${hue}, 48%, 11%)`,
    bgTo: `hsl(${hue2}, 42%, 5%)`,
  };
}
