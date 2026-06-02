import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/LogoutButton";

interface Props {
  label?: string;
}

export async function SiteHeader({ label }: Props) {
  let user = null;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
      <Link href="/" className="font-mono text-[18px] font-medium tracking-tight">
        Thebes <span className="font-semibold text-accent">AI</span>
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
            href="/login"
            className="font-mono text-xs uppercase tracking-tighter2 text-ink/60 hover:text-accent"
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}
