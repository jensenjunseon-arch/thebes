// POST /api/lyrikko/review — submit one flashcard answer.
//
// Body: { id, correct } → applies the Leitner move server-side (the client
// never chooses the box or the next date — that's what will make "mastered"
// trustworthy for the future fandom meter/card credit) and returns the
// updated scheduling fields.

import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { applyReview } from "@/lib/lyrikko/leitner";
import type { ReviewBox } from "@/lib/lyrikko/types";

export const maxDuration = 15;

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "no_db" }, { status: 503 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let body: { id?: string; correct?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const id = body.id?.trim();
  if (!id || typeof body.correct !== "boolean") {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // RLS scopes the read to the session user — a foreign id just misses.
  const { data: word } = await supabase
    .from("saved_words")
    .select("id, box, review_count")
    .eq("id", id)
    .maybeSingle();
  if (!word) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const move = applyReview(word.box as ReviewBox, body.correct);
  const { data, error } = await supabase
    .from("saved_words")
    .update({
      box: move.box,
      next_review_at: move.nextReviewAt,
      last_reviewed_at: new Date().toISOString(),
      review_count: (word.review_count as number) + 1,
    })
    .eq("id", id)
    .select("id, box, review_count, next_review_at, last_reviewed_at")
    .single();

  if (error) {
    console.error("[lyrikko/review]", error);
    return NextResponse.json({ error: "db_failed" }, { status: 500 });
  }
  return NextResponse.json({ word: data });
}
