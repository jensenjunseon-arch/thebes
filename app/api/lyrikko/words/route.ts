// /api/lyrikko/words — the personal word book (단어장).
//
//   POST   save one word (a point-in-time snapshot of the card the learner saw)
//   GET    list my words (+ how many are due for review)
//   DELETE remove one word (?id=)
//
// POST requires a Lyrikko profile (403 profile_required) — that row's
// existence is the proof of the 14+ age gate and required consents, so no
// learner data accumulates for an account that never passed onboarding.
// The sung fragment is re-capped server-side (capLine, ≤9 words) so nothing
// resembling a full lyric line can be persisted no matter what the client
// sends. RLS scopes every query to the session user.

import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { capLine } from "@/lib/lyrics/ai";

export const maxDuration = 15;

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function s(x: unknown, max: number): string {
  return typeof x === "string" ? x.trim().slice(0, max) : "";
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "no_db" }, { status: 503 });
  }
  const { supabase, user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("saved_words")
    .select(
      "id, direction, song, artist, term, line, gloss, meaning, box, review_count, next_review_at, last_reviewed_at, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[lyrikko/words:get]", error);
    return NextResponse.json({ error: "db_failed" }, { status: 500 });
  }
  const now = Date.now();
  const dueCount = (data ?? []).filter(
    (w) => new Date(w.next_review_at as string).getTime() <= now,
  ).length;
  return NextResponse.json({ words: data ?? [], dueCount });
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "no_db" }, { status: 503 });
  }
  const { supabase, user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  // Gate every write on a completed onboarding (age + consents).
  const { data: profile } = await supabase
    .from("lyrikko_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) {
    return NextResponse.json({ error: "profile_required" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const direction = body.direction === "ko" ? "ko" : "en";
  const song = s(body.song, 200);
  const artist = s(body.artist, 200);
  const term = s(body.term, 80);
  if (!song || !term) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const row = {
    user_id: user.id,
    direction,
    song,
    artist,
    term,
    line: capLine(body.line),
    gloss: s(body.gloss, 200),
    meaning: s(body.meaning, 600),
  };

  // Upsert on the natural key so double-saves are a no-op, not an error —
  // and never downgrade an existing word's review progress.
  const { data, error } = await supabase
    .from("saved_words")
    .upsert(row, {
      onConflict: "user_id,direction,song,artist,term",
      ignoreDuplicates: true,
    })
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[lyrikko/words:post]", error);
    return NextResponse.json({ error: "db_failed" }, { status: 500 });
  }
  return NextResponse.json({ saved: true, id: data?.id ?? null });
}

export async function DELETE(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "no_db" }, { status: 503 });
  }
  const { supabase, user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const { error } = await supabase.from("saved_words").delete().eq("id", id);
  if (error) {
    console.error("[lyrikko/words:delete]", error);
    return NextResponse.json({ error: "db_failed" }, { status: 500 });
  }
  return NextResponse.json({ deleted: true });
}
