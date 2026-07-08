// OG image for /lyrics (and nested routes) — what messengers show when an
// eigenlyric.com link is shared. Without this, scrapers grabbed the first
// large <img> on the page: whatever album art topped the chart that hour.
// Instead we draw the product's own concept: a lyric line, the tapped word,
// and its meaning card — the wow loop in one frame.
//
// Same satori constraints as the collectible card (flexbox subset only,
// real font binaries required) — see app/api/lyrikko/card/route.tsx.

import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "eigenlyric — 차트 속 노래 가사로 배우는 영어 & 한국어";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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

// Fixed palette (the teal-navy "era" family) rather than a hash — the share
// image is the brand's face, so it should look identical on every share.
const BG_FROM = "hsl(228, 45%, 10%)";
const BG_TO = "hsl(190, 48%, 8%)";
const CHIP_FROM = "hsl(190, 62%, 46%)";
const CHIP_TO = "hsl(228, 58%, 24%)";
const INK = "#FBF9F4";
const INK_SOFT = "rgba(251, 249, 244, 0.66)";
const GOLD = "#FFD966";
const TEAL = "#5EDAD0";

export default async function OpengraphImage() {
  const { bold, regular } = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "56px 72px",
          backgroundImage: `linear-gradient(155deg, ${BG_FROM}, ${BG_TO})`,
          fontFamily: "Pretendard",
          color: INK,
          justifyContent: "space-between",
        }}
      >
        {/* wordmark */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: 1 }}>
            eigenlyric
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: TEAL }}>AI</div>
        </div>

        {/* the concept in one frame: lyric line → tapped word → meaning card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22, fontSize: 66 }}>
            <div style={{ display: "flex", color: INK_SOFT }}>🎵 I&apos;ll make it</div>
            <div
              style={{
                display: "flex",
                fontWeight: 700,
                color: GOLD,
                borderBottom: `8px solid ${GOLD}`,
                paddingBottom: 4,
              }}
            >
              LEMONADE
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignSelf: "flex-start",
              gap: 14,
              padding: "38px 48px",
              borderRadius: 32,
              backgroundImage: `linear-gradient(150deg, ${CHIP_FROM}, ${CHIP_TO})`,
              boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
              <div style={{ display: "flex", fontSize: 54, fontWeight: 700 }}>lemonade</div>
              <div style={{ display: "flex", fontSize: 34, color: INK_SOFT }}>레모네이드</div>
            </div>
            <div style={{ display: "flex", fontSize: 34, color: INK }}>
              쓴 현실을 달콤하게 바꿔버리는 힘 🍋
            </div>
          </div>
        </div>

        {/* tagline */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 27,
          }}
        >
          <div style={{ display: "flex", color: INK_SOFT }}>
            차트에 오른 노래 가사로 배우는 영어 & 한국어
          </div>
          <div style={{ display: "flex", color: TEAL, fontWeight: 700 }}>eigenlyric.com</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: bold, weight: 700, style: "normal" },
        { name: "Pretendard", data: regular, weight: 400, style: "normal" },
      ],
    },
  );
}
