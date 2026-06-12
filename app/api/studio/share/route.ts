// POST /api/studio/share — give a built artifact a short public URL.
// Body: { kind, content, title?, topic?, level? } → { slug }
// Writes via the service-role client (the table has no anon policies);
// this route is the only gatekeeper, so the caps live here.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const KIND_OK = new Set(["game", "video", "quiz"]);
const MAX_CONTENT = 450_000; // chars — generous for a single-file game

function makeSlug(): string {
  // 8 url-safe chars from crypto randomness (no lookalike issues that matter here).
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 8);
}

function isConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function POST(req: Request) {
  if (!isConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let body: {
    kind?: string;
    content?: string;
    title?: string;
    topic?: string;
    level?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const kind = body.kind ?? "";
  const content = body.content ?? "";
  if (!KIND_OK.has(kind) || !content.trim() || content.length > MAX_CONTENT) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  // Game/quiz must be a complete HTML document (what the player iframe expects).
  if (kind !== "video" && (!content.includes("<html") || !content.includes("</html>"))) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const row = {
    kind,
    content,
    title: body.title?.toString().slice(0, 120) || null,
    topic: body.topic?.toString().slice(0, 60) || null,
    level: body.level?.toString().slice(0, 30) || null,
  };

  try {
    const admin = createAdminClient();
    // Two attempts in the (astronomically unlikely) event of a slug collision.
    for (let attempt = 0; attempt < 2; attempt++) {
      const slug = makeSlug();
      const { error } = await admin.from("shared_artifacts").insert({ ...row, slug });
      if (!error) return NextResponse.json({ slug });
      if (!error.message.includes("duplicate")) {
        console.error("[studio/share]", error);
        return NextResponse.json({ error: "db_failed" }, { status: 502 });
      }
    }
    return NextResponse.json({ error: "db_failed" }, { status: 502 });
  } catch (err) {
    console.error("[studio/share]", err);
    return NextResponse.json({ error: "db_failed" }, { status: 502 });
  }
}
