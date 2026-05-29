import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles email confirmation links from Supabase.
// After the user clicks the link, Supabase redirects here with a code;
// we exchange it for a session and send the user where they need to go.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
}
