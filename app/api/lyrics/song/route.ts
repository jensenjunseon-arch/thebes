// POST /api/lyrics/song — a charting song in, its notable words/phrases out
// (the tappable chips). Words only, never full lyrics. Bidirectional via
// `direction`: "en" teaches the English to a Korean fan, "ko" teaches the
// Korean to a global fan.

import { NextResponse } from "next/server";
import { hasKey } from "@/lib/studio/ai";
import { songWords } from "@/lib/lyrics/ai";
import { cachedJson, cacheKey } from "@/lib/lyrics/cache";
import type { Direction, SongWords } from "@/lib/lyrics/types";

// Web-search grounding for brand-new songs can add a few seconds.
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!hasKey()) {
    return NextResponse.json({ error: "no_key" }, { status: 503 });
  }

  let body: { song?: string; artist?: string; direction?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const song = body.song?.trim();
  const artist = body.artist?.trim() ?? "";
  const direction: Direction = body.direction === "ko" ? "ko" : "en";
  if (!song) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    // Cache per song+direction; only cache recognized songs so an unknown-song
    // answer doesn't stick after the model becomes able to ground it.
    const { known, note, words } = await cachedJson(
      cacheKey("song", direction, artist, song),
      () => songWords(song, artist, direction),
      (r) => r.known && r.words.length > 0,
    );
    return NextResponse.json({
      song,
      artist,
      direction,
      known,
      note,
      words,
    } satisfies SongWords);
  } catch (err) {
    console.error("[lyrics/song]", err);
    return NextResponse.json({ error: "ai_failed" }, { status: 502 });
  }
}
