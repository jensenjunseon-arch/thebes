import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

// /play/<slug> — the shareable face of a student-built artifact. Whoever opens
// the link plays a Thebes-branded game/quiz (or reads the script) and gets ONE
// clear invitation: make your own from your own problem.
//
// Shared HTML renders ONLY inside a sandbox="allow-scripts" iframe — opaque
// origin, no cookies, no parent DOM access.

export const dynamic = "force-dynamic";

interface Row {
  kind: "game" | "video" | "quiz";
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
    return (data as Row | null) ?? null;
  } catch {
    return null;
  }
}

const KIND_LABEL: Record<Row["kind"], string> = {
  game: "게임",
  quiz: "퀴즈",
  video: "영상 대본",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const row = await fetchRow(slug);
  if (!row) return { title: "Thebes Studio" };
  const what = KIND_LABEL[row.kind];
  const title = row.title ? `「${row.title}」` : `내가 만든 ${what}`;
  return {
    title: `${title} — Thebes Studio`,
    description: `수학 문제 하나로 학생이 직접 만든 ${what}이에요. 지금 바로 해보세요 — 너의 문제로도 만들 수 있어요.`,
    openGraph: {
      title: `${title} 해볼래?`,
      description: `Thebes Studio에서 수학 문제 하나로 직접 만든 ${what}. 너도 네 문제로 만들 수 있어.`,
    },
  };
}

export default async function PlayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const row = await fetchRow(slug);
  if (!row) notFound();

  // Count the visit (fire-and-forget quality — a failure shouldn't block play).
  try {
    const admin = createAdminClient();
    await admin
      .from("shared_artifacts")
      .update({ views: row.views + 1 })
      .eq("slug", slug);
  } catch {
    /* non-fatal */
  }

  const what = KIND_LABEL[row.kind];

  return (
    <main className="flex min-h-dvh flex-col bg-paper text-ink">
      {/* slim brand header */}
      <header className="flex items-center justify-between border-b border-ink/8 px-5 py-3.5">
        <Link href="/" className="font-sans text-[16px] font-semibold tracking-tightish">
          Thebes <span className="g-grad-text font-bold">AI</span>
        </Link>
        <span className="font-kr text-[11.5px] text-ink/45">
          학생이 직접 만든 {what}
        </span>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <h1 className="font-kr text-[19px] font-bold tracking-tighter2">
            {row.title ? `「${row.title}」` : `내가 만든 ${what}`}
          </h1>
          <span className="font-kr text-[12px] text-ink/45">
            {[row.topic, row.level].filter(Boolean).join(" · ")}
            {row.views > 0 && ` · ${row.views + 1}번째 플레이어예요`}
          </span>
        </div>
        <p className="mt-1 font-kr text-[13px] leading-relaxed text-ink/55 break-keep">
          수학 문제 하나에서 출발해, 한 학생이 자기 생각으로 설계하고 AI에게 시켜서 만든{" "}
          {what}입니다.
        </p>

        {/* the artifact */}
        <div className="mt-4 flex-1 overflow-hidden rounded-3xl border border-ink/10 bg-paper shadow-sm">
          {row.kind === "video" ? (
            <div className="max-h-[64dvh] overflow-y-auto px-5 py-4">
              <pre className="whitespace-pre-wrap font-kr text-[13.5px] leading-relaxed text-ink/85">
                {row.content}
              </pre>
            </div>
          ) : (
            <iframe
              srcDoc={row.content}
              sandbox="allow-scripts"
              title={row.title ?? what}
              className="h-[64dvh] min-h-[420px] w-full bg-white"
            />
          )}
        </div>

        {/* THE invitation */}
        <div className="mt-4 overflow-hidden rounded-3xl border border-accent/25 bg-accent-soft/30 px-5 py-5 text-center sm:px-8">
          <p className="font-kr text-[15.5px] font-bold leading-snug tracking-tighter2 break-keep">
            이 {what}, 수학 문제 <span className="text-accent">하나</span>에서 시작됐어요.
          </p>
          <p className="mt-1.5 font-kr text-[13px] leading-relaxed text-ink/60 break-keep">
            네 교과서 문제를 사진으로 올리면 — 영어로 생각하고, 너만의 {what}이 나와.
          </p>
          <Link
            href="/studio"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-ink px-6 py-3 font-kr text-[14px] font-semibold text-on-dark transition hover:bg-accent"
          >
            내 문제로 만들어보기
            <span className="font-mono text-[12px]">→</span>
          </Link>
          <p className="mt-2.5 font-kr text-[11.5px] text-ink/40">
            무료 · 로그인 없이 바로 · 5분이면 충분해요
          </p>
        </div>
      </div>
    </main>
  );
}
