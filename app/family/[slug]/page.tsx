import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

// /family/<slug> — the parent's view. A student finishes a study session and
// sends this link home; the parent opens it on their phone and reads (or
// listens to) a warm digest of what their child learned, in their OWN language.
// Built for Korea's multicultural families, where a language barrier can cut the
// parent off from the child's school life. The page chrome is deliberately
// language-neutral — all the words live inside the digest, in the home language.
//
// The digest HTML renders ONLY inside a sandbox="allow-scripts" iframe.

export const dynamic = "force-dynamic";

interface Row {
  kind: string;
  title: string | null;
  topic: string | null;
  level: string | null;
  content: string;
  views: number;
}

function isConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

async function fetchRow(slug: string): Promise<Row | null> {
  if (!isConfigured() || !/^[a-z0-9]{4,16}$/.test(slug)) return null;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("shared_artifacts")
      .select("kind, title, topic, level, content, views")
      .eq("slug", slug)
      .maybeSingle();
    const row = (data as Row | null) ?? null;
    return row && row.kind === "family" ? row : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const row = await fetchRow(slug);
  if (!row) return { title: "Thebes" };
  const title = row.title?.trim() || "Today your child studied math";
  return {
    title: `${title} — Thebes`,
    description: "A warm summary of what your child learned today, in your language.",
    openGraph: {
      title,
      description: "See what your child studied today — in your language.",
    },
  };
}

export default async function FamilyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const row = await fetchRow(slug);
  if (!row) notFound();

  // Count the visit (non-fatal).
  try {
    const admin = createAdminClient();
    await admin
      .from("shared_artifacts")
      .update({ views: row.views + 1 })
      .eq("slug", slug);
  } catch {
    /* non-fatal */
  }

  return (
    <main className="flex min-h-dvh flex-col bg-[#f4f6fa] text-ink">
      <header className="flex items-center justify-between px-5 py-3">
        <Link href="/" className="font-sans text-[15px] font-semibold tracking-tightish">
          Thebes <span className="g-grad-text font-bold">AI</span>
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-tighter2 text-ink/40">
          for families
        </span>
      </header>

      <div className="mx-auto w-full max-w-xl flex-1 px-3 pb-8">
        <div className="overflow-hidden rounded-3xl border border-ink/8 bg-transparent">
          <iframe
            srcDoc={row.content}
            sandbox="allow-scripts"
            title={row.title ?? "Family digest"}
            className="h-[78dvh] min-h-[560px] w-full bg-transparent"
          />
        </div>
      </div>
    </main>
  );
}
