// POST /api/lyrics/ask — the conversational layer. The learner asks a follow-up
// about the tapped word (in the song's context); we answer in their language.
// This is the self-directed loop: see a word → tap → ask → keep pulling the
// thread yourself.

import { NextResponse } from "next/server";
import { hasKey } from "@/lib/studio/ai";
import { chatAnswer } from "@/lib/lyrics/ai";
import type { ChatTurn, Direction } from "@/lib/lyrics/types";

export const maxDuration = 30;

export async function POST(req: Request) {
  if (!hasKey()) {
    return NextResponse.json({ error: "no_key" }, { status: 503 });
  }

  let body: {
    song?: string;
    artist?: string;
    term?: string;
    direction?: string;
    question?: string;
    history?: ChatTurn[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const song = body.song?.trim();
  const artist = body.artist?.trim() ?? "";
  const term = body.term?.trim();
  const question = body.question?.trim();
  const direction: Direction = body.direction === "ko" ? "ko" : "en";
  const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
  if (!song || !term || !question) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const answer = await chatAnswer({ song, artist, term, direction, history, question });
    if (!answer) {
      return NextResponse.json({ error: "ai_failed" }, { status: 502 });
    }
    return NextResponse.json({ answer });
  } catch (err) {
    console.error("[lyrics/ask]", err);
    return NextResponse.json({ error: "ai_failed" }, { status: 502 });
  }
}
