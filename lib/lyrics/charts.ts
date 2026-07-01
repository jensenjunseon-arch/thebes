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

export async function topChart(limit = 12): Promise<ChartEntry[]> {
  try {
    const res = await fetch(
      `https://api.deezer.com/chart/0/tracks?limit=${limit}`,
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
