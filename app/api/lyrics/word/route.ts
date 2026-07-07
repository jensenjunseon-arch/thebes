// POST /api/lyrics/word — a tapped word in, its card out. Split for speed:
// the default call returns only the CORE (hook + meaning) so the card paints
// fast, and each folded section (why / slang / examples / cross) is requested
// separately — `section` in the body — when the learner opens that toggle.
// Honest-by-design: cross-song lists may be empty, never invented.

import { NextResponse } from "next/server";
import { hasKey } from "@/lib/studio/ai";
import { wordCardCore, wordSection } from "@/lib/lyrics/ai";
import { cachedJson, cacheKey } from "@/lib/lyrics/cache";
import type { Direction, WordSectionKey } from "@/lib/lyrics/types";

export const maxDuration = 60;

const SECTIONS: WordSectionKey[] = ["why", "slang", "examples", "cross"];

export async function POST(req: Request) {
  if (!hasKey()) {
    return NextResponse.json({ error: "no_key" }, { status: 503 });
  }

  let body: {
    song?: string;
    artist?: string;
    term?: string;
    direction?: string;
    section?: string;
  };
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
  if (body.section !== undefined && !SECTIONS.includes(body.section as WordSectionKey)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const section = body.section as WordSectionKey | undefined;

  try {
    if (section) {
      const data = await cachedJson(
        cacheKey("word", direction, artist, song, term, section),
        () => wordSection(section, song, artist, term, direction),
        // examples/cross may be legitimately empty; prose sections need text.
        (r) => (section === "why" || section === "slang" ? Boolean(r.text) : true),
      );
      return NextResponse.json(data);
    }

    const card = await cachedJson(
      cacheKey("word", direction, artist, song, term),
      () => wordCardCore(song, artist, term, direction),
      (c) => c.meaning.length > 0,
    );
    if (!card.meaning) {
      return NextResponse.json({ error: "ai_failed" }, { status: 502 });
    }
    return NextResponse.json(card);
  } catch (err) {
    console.error("[lyrics/word]", err);
    return NextResponse.json({ error: "ai_failed" }, { status: 502 });
  }
}
