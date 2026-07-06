// GET /api/lyrikko/card — renders one collectible word card as a PNG.
//
// ?format=card  → the poca-ratio card only (660×1020), for camera-roll save.
// ?format=story → the same card centered on a 1080×1920 Instagram Story
//                 canvas with safe zones, for the story-relay share path.
//
// No idol photos/likenesses/logos — see lib/lyrikko/card.ts for why. Only
// factual text (song/artist/date), a deterministic era palette, and the
// learner's own stats (review level, personal collection number) are drawn.
// This is a public, unauthenticated GET (the query params ARE the card data,
// already scrubbed by the caller) so it can be used as a plain <img src>.

import { ImageResponse } from "next/og";
import {
  CARD_H,
  CARD_W,
  STORY_H,
  STORY_SAFE,
  STORY_W,
  eraPalette,
} from "@/lib/lyrikko/card";

export const runtime = "nodejs";

const FONT_BASE = "https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static";
let fontCache: Promise<{ bold: ArrayBuffer; regular: ArrayBuffer }> | null = null;

function loadFonts() {
  if (!fontCache) {
    fontCache = Promise.all([
      fetch(`${FONT_BASE}/Pretendard-Bold.otf`).then((r) => r.arrayBuffer()),
      fetch(`${FONT_BASE}/Pretendard-Regular.otf`).then((r) => r.arrayBuffer()),
    ]).then(([bold, regular]) => ({ bold, regular }));
  }
  return fontCache;
}

function clip(s: string, max: number): string {
  const v = (s ?? "").trim();
  return v.length > max ? `${v.slice(0, max - 1)}…` : v;
}

// Split the sung line around the term so the term renders in the accent
// color — mirrors the frontend's highlight() helper, satori-compatible.
function highlightParts(line: string, term: string): { text: string; hit: boolean }[] {
  if (!line) return [];
  if (!term) return [{ text: line, hit: false }];
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return line
    .split(new RegExp(`(${esc})`, "ig"))
    .filter((p) => p.length > 0)
    .map((p) => ({ text: p, hit: p.toLowerCase() === term.toLowerCase() }));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams;
  const format = q.get("format") === "story" ? "story" : "card";

  const song = clip(q.get("song") ?? "", 60);
  const artist = clip(q.get("artist") ?? "", 40);
  const term = clip(q.get("term") ?? "", 40);
  const line = clip(q.get("line") ?? "", 90);
  const gloss = clip(q.get("gloss") ?? "", 40);
  const meaning = clip(q.get("meaning") ?? "", 140);
  const direction = q.get("direction") === "ko" ? "KO" : "EN";
  const box = Math.min(5, Math.max(1, Number(q.get("box")) || 1));
  const mine = Math.max(1, Number(q.get("mine")) || 1);

  if (!term || !song) {
    return new Response("bad_request", { status: 400 });
  }

  const { bold, regular } = await loadFonts();
  const palette = eraPalette(song, artist);
  const parts = highlightParts(line, term);

  const card = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: CARD_W,
        height: CARD_H,
        padding: "44px 40px",
        borderRadius: 28,
        backgroundImage: `linear-gradient(150deg, ${palette.from}, ${palette.to})`,
        fontFamily: "Pretendard",
        color: palette.ink,
      }}
    >
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            display: "flex",
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: 2,
            color: palette.ink,
          }}
        >
          LYRIKKO
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              display: "flex",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1,
              padding: "5px 11px",
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.16)",
            }}
          >
            {direction}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1,
              padding: "5px 11px",
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.16)",
            }}
          >
            Lv.{box}
          </div>
        </div>
      </div>

      {/* hero — vertically centered in the space between header and footer */}
      <div
        style={{
          display: "flex",
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: 0,
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", fontSize: 58, fontWeight: 700, lineHeight: 1.08 }}>
          {term}
        </div>
        {parts.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", marginTop: 18, fontSize: 20 }}>
            <span style={{ marginRight: 6, color: palette.inkSoft }}>🎵</span>
            {parts.map((p, i) => (
              <span
                key={i}
                style={{
                  color: p.hit ? palette.ink : palette.inkSoft,
                  fontWeight: p.hit ? 700 : 400,
                  marginRight: 4,
                }}
              >
                {p.text}
              </span>
            ))}
          </div>
        )}
        {gloss && (
          <div style={{ display: "flex", marginTop: 22, fontSize: 27, fontWeight: 700 }}>
            {gloss}
          </div>
        )}
        {meaning && (
          <div
            style={{
              display: "flex",
              marginTop: 8,
              fontSize: 17,
              lineHeight: 1.5,
              color: palette.inkSoft,
            }}
          >
            {meaning}
          </div>
        )}
      </div>

      {/* footer — factual metadata only, no artist photo/logo */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            height: 1,
            backgroundColor: "rgba(255,255,255,0.22)",
            marginBottom: 18,
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 19, fontWeight: 700 }}>{song}</div>
            <div style={{ display: "flex", fontSize: 14, marginTop: 2, color: palette.inkSoft }}>
              {artist}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 13,
              fontWeight: 700,
              color: palette.inkSoft,
              letterSpacing: 0.5,
            }}
          >
            내 단어 #{mine}
          </div>
        </div>
      </div>
    </div>
  );

  const fonts = [
    { name: "Pretendard", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Pretendard", data: regular, weight: 400 as const, style: "normal" as const },
  ];

  if (format === "card") {
    return new ImageResponse(card, { width: CARD_W, height: CARD_H, fonts });
  }

  // Story canvas: same gradient extended full-bleed, card centered, safe zones
  // clear top/bottom for the platform's own UI chrome.
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: STORY_W,
          height: STORY_H,
          backgroundImage: `linear-gradient(160deg, ${palette.from}, ${palette.to})`,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: STORY_SAFE,
          paddingBottom: STORY_SAFE,
        }}
      >
        {card}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: STORY_SAFE - 60,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 3,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          LYRIKKO
        </div>
      </div>
    ),
    { width: STORY_W, height: STORY_H, fonts },
  );
}
