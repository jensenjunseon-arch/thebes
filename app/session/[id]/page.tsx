import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SessionView } from "@/components/session/SessionView";
import {
  PUBLIC_PROBLEMS,
  DEFAULT_PROBLEM_ID,
  toPublicProblem,
  getProblemById,
} from "@/lib/problems";
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

  // ── demo route — full problem pool + difficulty picker ──────────────────────
  if (id === "demo" || !isSupabaseConfigured()) {
    return (
      <SessionShell sessionLabel={id}>
        <SessionView
          problems={[...PUBLIC_PROBLEMS]}
          initialProblemId={DEFAULT_PROBLEM_ID}
          sessionId={null}
          enablePicker
        />
      </SessionShell>
    );
  }

  // ── live route ──────────────────────────────────────────────────────────────
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

  const problem = toPublicProblem(getProblemById(DEFAULT_PROBLEM_ID)!);

  return (
    <SessionShell sessionLabel={id.slice(0, 8)}>
      <SessionView
        problems={[problem]}
        initialProblemId={problem.id}
        sessionId={id}
        initialTurns={turns}
        initialStep={session.active_step <= 2 ? (session.active_step as 1 | 2) : 2}
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
    </main>
  );
}
