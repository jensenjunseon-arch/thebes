import { NextResponse } from "next/server";
import { createSession } from "@/lib/supabase/queries";
import { DEMO_PROBLEM_ID } from "@/lib/demo";

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ sessionId: "demo" });
  }

  try {
    const session = await createSession(DEMO_PROBLEM_ID);
    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error("[POST /api/sessions]", err);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 },
    );
  }
}
