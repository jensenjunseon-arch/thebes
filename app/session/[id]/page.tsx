import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SessionView } from "@/components/session/SessionView";
import { DEMO_PROBLEM } from "@/lib/demo";
import { getSessionById, getSessionTurns } from "@/lib/supabase/queries";
import type { Turn } from "@/components/session/ChatPanel";

// UUID v4 pattern — distinguishes real session IDs from the "demo" slug.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ── demo route ────────────────────────────────────────────────────────────
  if (id === "demo" || !isSupabaseConfigured()) {
    return (
      <SessionShell sessionLabel={id}>
        <SessionView
          problem={{
            topic: DEMO_PROBLEM.topic,
            difficulty: DEMO_PROBLEM.difficulty,
            englishStatement: DEMO_PROBLEM.englishStatement,
            koreanSupport: DEMO_PROBLEM.koreanSupport,
          }}
          sessionId={null}
        />
      </SessionShell>
    );
  }

  // ── live route ────────────────────────────────────────────────────────────
  if (!UUID_RE.test(id)) notFound();

  const [session, dbTurns] = await Promise.all([
    getSessionById(id),
    getSessionTurns(id),
  ]);

  if (!session) notFound();

  const turns: Turn[] = dbTurns.map((t) => ({
    id: t.id,
    speaker: t.speaker === "student" ? "student" : "coach",
    content: t.content,
  }));

  return (
    <SessionShell sessionLabel={id.slice(0, 8)}>
      <SessionView
        problem={{
          topic: DEMO_PROBLEM.topic,
          difficulty: DEMO_PROBLEM.difficulty,
          englishStatement: DEMO_PROBLEM.englishStatement,
          koreanSupport: DEMO_PROBLEM.koreanSupport,
        }}
        sessionId={id}
        initialTurns={turns}
        initialStep={session.active_step}
      />
    </SessionShell>
  );
}

function SessionShell({
  sessionLabel,
  children,
}: {
  sessionLabel: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader label={`Session · ${sessionLabel}`} />

      {children}

      <footer className="mx-auto max-w-7xl px-6 pb-12">
        <p className="max-w-2xl border-l-2 border-accent pl-5 font-serif italic text-ink/70">
          "Right — you noticed that 'average of the two numbers' might be a trap."
        </p>
      </footer>
    </main>
  );
}
