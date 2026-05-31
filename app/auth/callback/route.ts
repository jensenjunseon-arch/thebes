import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles OAuth (Google) and email-confirmation redirects from Supabase.
// Supabase returns either `?code=...` (success → exchange for a session) or
// `?error=...&error_description=...` (provider/config failure). We surface the
// real reason on the login page instead of swallowing it, so failures are
// diagnosable rather than a mysterious dead end.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const providerError =
    searchParams.get("error_description") ?? searchParams.get("error");
  const next = searchParams.get("next") ?? "/";

  const fail = (msg: string) =>
    NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(msg)}`);

  if (providerError) {
    console.error("[auth/callback] provider error:", providerError);
    return fail(providerError);
  }

  if (!code) {
    return fail("로그인 정보를 받지 못했어요 (인증 코드 없음). 잠시 후 다시 시도해 주세요.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
    return fail(`세션 생성에 실패했어요: ${error.message}`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
