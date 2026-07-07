import Link from "next/link";
import type { Route } from "next";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/LogoutButton";
import { THEBES, type Brand } from "@/lib/brand";

interface Props {
  label?: string;
  /** Which product owns this page — controls the wordmark and logo link. */
  brand?: Brand;
}

export async function SiteHeader({ label, brand = THEBES }: Props) {
  let user = null;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  // Keep a non-thebes login within its own brand: after login, come back here.
  const loginHref = (
    brand.home === "/" ? "/login" : `/login?next=${encodeURIComponent(brand.home)}`
  ) as Route;

  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
      <Link
        href={brand.home as Route}
        className="font-sans text-[18px] font-semibold tracking-tightish"
      >
        {brand.name} <span className="g-grad-text font-bold">{brand.suffix}</span>
      </Link>

      <div className="flex items-center gap-5">
        {label && (
          <p className="font-mono text-xs uppercase tracking-tighter2 text-ink/50">
            {label}
          </p>
        )}
        {user ? (
          <div className="flex items-center gap-4">
            <p className="hidden font-mono text-xs tracking-tighter2 text-ink/50 sm:block">
              {user.email}
            </p>
            <LogoutButton />
          </div>
        ) : (
          <Link
            href={loginHref}
            className="font-mono text-xs uppercase tracking-tighter2 text-ink/60 hover:text-accent"
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}
