import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require authentication.
const PROTECTED_PREFIXES = ["/dashboard", "/subscribe", "/billing"];

// Public demo routes — accessible without login (pre-launch; mock data only).
const PUBLIC_DEMO = new Set(["/session/demo", "/dashboard/parent"]);

// /session/* and /dashboard/* are protected EXCEPT the public demo routes.
function isProtected(pathname: string): boolean {
  if (PUBLIC_DEMO.has(pathname)) return false;
  if (pathname.startsWith("/session/")) return true;
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  // Without Supabase credentials the app runs in demo mode — skip auth checks.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refreshes the session cookie — must be called before any protected check.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && isProtected(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect already-logged-in users away from auth pages — honor `next` so
  // e.g. a Lyrikko user bounced through /login mid-flow lands back on
  // /lyrics instead of the marketing homepage. Only accept an internal path
  // (starts with "/", not "//") to avoid an open-redirect via a crafted
  // `next` value.
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const next = request.nextUrl.searchParams.get("next");
    const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Exclude /api (public connector endpoints run without the auth round-trip).
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
