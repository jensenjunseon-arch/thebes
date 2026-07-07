// GET/POST /api/lyrikko/profile — the Lyrikko onboarding gate.
//
// POST creates the profile that every word-book write requires. The 만 14세
// age gate is enforced in three layers: the client blocks under-14 input
// before submitting, THIS route re-validates and refuses BEFORE any insert
// (so an under-14 birth date is never persisted — 개인정보보호법 제22조의2:
// we refuse under-14 signups outright instead of collecting guardian
// consent), and the DB CHECK constraint is the last line of defense.
//
// Uses the session-scoped Supabase client so RLS ("own row") applies — no
// service role anywhere in the Lyrikko routes.

import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { isAtLeast14 } from "@/lib/lyrikko/leitner";

export const maxDuration = 15;

export async function GET() {
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

  const { data } = await supabase
    .from("lyrikko_profiles")
    .select("nickname, birth_date, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({ profile: data ?? null });
}

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

  let body: {
    nickname?: string;
    birthDate?: string;
    agreeTerms?: boolean;
    agreePrivacy?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const nickname = body.nickname?.trim() ?? "";
  const birthDate = body.birthDate?.trim() ?? "";
  if (!nickname || nickname.length > 20) {
    return NextResponse.json({ error: "bad_nickname" }, { status: 400 });
  }
  // Both consents are REQUIRED — a profile row existing implies both were
  // given at consent_at. No optional consents are collected in v1 (minimal
  // collection: no marketing/night-push features exist yet, so no consent
  // is asked for them).
  if (body.agreeTerms !== true || body.agreePrivacy !== true) {
    return NextResponse.json({ error: "consent_required" }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return NextResponse.json({ error: "bad_birth_date" }, { status: 400 });
  }
  // Refuse BEFORE any write — the under-14 birth date is not persisted.
  if (!isAtLeast14(birthDate)) {
    return NextResponse.json({ error: "under_14" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("lyrikko_profiles")
    .upsert(
      {
        user_id: user.id,
        nickname,
        birth_date: birthDate,
        age_verified: true,
      },
      { onConflict: "user_id", ignoreDuplicates: false },
    )
    .select("nickname, birth_date, created_at")
    .single();

  if (error) {
    console.error("[lyrikko/profile]", error);
    return NextResponse.json({ error: "db_failed" }, { status: 500 });
  }
  return NextResponse.json({ profile: data });
}
