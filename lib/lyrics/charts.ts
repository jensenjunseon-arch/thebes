// Live chart feed for the song presets — keeps "what's hot right now" actually
// current instead of a stale hardcoded list. Source: Deezer's public chart API
// (keyless, free, daily-fresh, includes album art + a 30s preview). Cached for
// an hour via Next's fetch revalidation. Falls back to a small recent set if
// the feed is unreachable so the UI is never empty.

import type { ChartEntry } from "@/lib/lyrics/types";

const FALLBACK: ChartEntry[] = [
  { rank: 1, title: "APT.", artist: "ROSÉ & Bruno Mars", artwork: "", preview: "" },
  { rank: 2, title: "Whiplash", artist: "aespa", artwork: "", preview: "" },
  { rank: 3, title: "Supernatural", artist: "NewJeans", artwork: "", preview: "" },
  { rank: 4, title: "Mantra", artist: "JENNIE", artwork: "", preview: "" },
  { rank: 5, title: "How Sweet", artist: "NewJeans", artwork: "", preview: "" },
];

interface DeezerTrack {
  title?: string;
  title_short?: string;
  preview?: string;
  artist?: { name?: string };
  album?: { cover_medium?: string; cover?: string };
}

// ── K-pop chart ───────────────────────────────────────────────────────────
// Deezer's genre-16 "Asian Music" chart (used previously) drifts toward
// general Asian pop rather than staying K-pop-specific. There's no public,
// license-friendly live K-pop chart API (Melon/Circle have none), so this
// column is pinned to a real Korean chart snapshot the user supplied
// (2026-07-02) instead — an honest curated list beats an imprecise live feed.
const KPOP_SNAPSHOT: Array<{ rank: number; title: string; artist: string }> = [
  { rank: 1, title: "갑자기", artist: "IOI" },
  { rank: 2, title: "REDRED", artist: "CORTIS" },
  { rank: 3, title: "LOVE ATTACK", artist: "RESCENE" },
  { rank: 4, title: "LEMONADE", artist: "aespa" },
  { rank: 5, title: "It's Me", artist: "ILLIT" },
  { rank: 6, title: "소문의 낙원", artist: "AKMU" },
  { rank: 7, title: "캐치 캐치", artist: "YENA" },
  { rank: 8, title: "Joy, Sorrow, A Beautiful Heart", artist: "AKMU" },
  { rank: 9, title: "RUDE!", artist: "Hearts2Hearts" },
  { rank: 10, title: "Drowning", artist: "WOODZ" },
];

function normalizeName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9가-힣]/g, "");
}

// Several of these (new/rookie-group) releases return WRONG Deezer search
// hits — karaoke covers, unrelated same-named artists. Only trust a hit
// whose artist genuinely matches; otherwise leave artwork empty (the UI
// already renders a plain placeholder for missing art).
function artistMatches(target: string, hit: string): boolean {
  const a = normalizeName(target);
  const b = normalizeName(hit);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

async function findArtwork(
  title: string,
  artist: string,
): Promise<{ artwork: string; preview: string }> {
  try {
    const q = encodeURIComponent(`${title} ${artist}`);
    const res = await fetch(`https://api.deezer.com/search?q=${q}&limit=3`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return { artwork: "", preview: "" };
    const data = (await res.json()) as { data?: DeezerTrack[] };
    const hit = (data.data || []).find((t) => artistMatches(artist, t.artist?.name || ""));
    if (!hit) return { artwork: "", preview: "" };
    return { artwork: hit.album?.cover_medium || hit.album?.cover || "", preview: hit.preview || "" };
  } catch {
    return { artwork: "", preview: "" };
  }
}

export async function kpopChart(): Promise<ChartEntry[]> {
  return Promise.all(
    KPOP_SNAPSHOT.map(async (e) => {
      const { artwork, preview } = await findArtwork(e.title, e.artist);
      return { rank: e.rank, title: e.title, artist: e.artist, artwork, preview };
    }),
  );
}

// genreId 0 = global chart. (K-pop no longer uses the genre-16 proxy — see kpopChart above.)
export async function topChart(genreId = 0, limit = 12): Promise<ChartEntry[]> {
  try {
    const res = await fetch(
      `https://api.deezer.com/chart/${genreId}/tracks?limit=${limit}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return FALLBACK;
    const data = (await res.json()) as { data?: DeezerTrack[] };
    const rows = Array.isArray(data.data) ? data.data : [];
    const entries: ChartEntry[] = rows
      .map((t, i) => ({
        rank: i + 1,
        title: String(t.title_short || t.title || "").trim(),
        artist: String(t.artist?.name || "").trim(),
        artwork: String(t.album?.cover_medium || t.album?.cover || ""),
        preview: String(t.preview || ""),
      }))
      .filter((e) => e.title && e.artist);
    return entries.length ? entries : FALLBACK;
  } catch {
    return FALLBACK;
  }
}
