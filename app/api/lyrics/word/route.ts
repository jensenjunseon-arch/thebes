// POST /api/lyrics/word — a tapped word/phrase in, its deep card out: meaning,
// why it fits this song (interpretation), other songs that use it, and slang/
// trend note. Honest-by-design: cross-song lists may be empty, never invented.

import { NextResponse } from "next/server";
import { hasKey } from "@/lib/studio/ai";
import { wordCard } from "@/lib/lyrics/ai";
import { cachedJson, cacheKey } from "@/lib/lyrics/cache";
import type { Direction, WordCard } from "@/lib/lyrics/types";

// Web-search grounding for brand-new songs can add a few seconds.
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!hasKey()) {
    return NextResponse.json({ error: "no_key" }, { status: 503 });
  }

  let body: { song?: string; artist?: string; term?: string; direction?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const song = body.song?.trim();
  const artist = body.artist?.trim() ?? "";
  const term = body.term?.trim();
  const direction: Direction = body.direction === "ko" ? "ko" : "en";
  if (!song || !term) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const card = await cachedJson(
      cacheKey("word", direction, artist, song, term),
      () => wordCard(song, artist, term, direction),
      (c) => c.meaning.length > 0,
    );
    if (!card.meaning) {
      return NextResponse.json({ error: "ai_failed" }, { status: 502 });
    }
    return NextResponse.json(card satisfies WordCard);
  } catch (err) {
    console.error("[lyrics/word]", err);
    return NextResponse.json({ error: "ai_failed" }, { status: 502 });
  }
}
