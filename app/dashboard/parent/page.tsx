import { SiteHeader } from "@/components/SiteHeader";
import { ConstructRadar } from "@/components/dashboard/ConstructRadar";
import { WeeklyBarChart, ConstructBreakdown } from "@/components/dashboard/WeeklyBarChart";
import { EvidenceSection } from "@/components/dashboard/EvidenceCard";
import {
  getWeeklyScores,
  getRecentEvidence,
  getConstructTotals,
} from "@/lib/supabase/queries";
import {
  MOCK_WEEKLY_SCORES,
  MOCK_CURRENT_TOTALS,
  MOCK_PREV_TOTALS,
  MOCK_EVIDENCE,
  MOCK_SESSION_COUNT,
  MOCK_TURN_COUNT,
} from "@/lib/dashboard/mockData";
import type { ConstructId } from "@/lib/constructs";

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

// For now, studentId comes from a query param. Auth (parent ↔ student link)
// lands in M2 — this page is accessible without login for demo purposes.
export default async function ParentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const { student: studentId } = await searchParams;
  const liveMode = isSupabaseConfigured() && Boolean(studentId);

  // ── data ──────────────────────────────────────────────────────────────────
  let weeklyScores = MOCK_WEEKLY_SCORES;
  let currentTotals = MOCK_CURRENT_TOTALS;
  let prevTotals = MOCK_PREV_TOTALS;
  let evidence = MOCK_EVIDENCE;
  let sessionCount = MOCK_SESSION_COUNT;

  if (liveMode) {
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    thisWeekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);

    const [weeks, ev, thisTotals, lastTotals] = await Promise.all([
      getWeeklyScores(studentId!, 4),
      getRecentEvidence(studentId!, 5),
      getConstructTotals(studentId!, thisWeekStart),
      getConstructTotals(studentId!, lastWeekStart),
    ]);

    weeklyScores = weeks;
    evidence = ev;
    currentTotals = thisTotals as Record<ConstructId, number>;
    prevTotals = lastTotals as Record<ConstructId, number>;
  }

  const currentWeek = weeklyScores[weeklyScores.length - 1];

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader label={liveMode ? "학부모 리포트 · 실데이터" : "학부모 리포트 · 목 데이터"} />

      <section className="mx-auto max-w-6xl px-6 pb-16">
        {/* ── headline ── */}
        <p className="font-mono text-[10px] uppercase tracking-tighter2 text-ink/50">
          이번 주의 사고력 리포트
        </p>
        <h1 className="mt-2 font-kr text-3xl font-semibold tracking-tighter2 sm:text-4xl">
          점수표가 아닙니다.{" "}
          <span className="text-accent">진단 리포트</span>입니다.
        </h1>
        <p className="mt-4 max-w-2xl text-ink/70">
          학원이 점수를 책임진다면, 우리는 그 점수가 측정하지 못하는 사고력을
          책임집니다. 아래 6개 구인은{" "}
          <span className="font-serif italic">Pólya (1945)</span> 와 추론 연구에서
          도출된 측정 지표입니다.
        </p>

        {/* ── summary stats ── */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "완료 세션", value: String(sessionCount) },
            {
              label: "총 발화",
              value: String(MOCK_TURN_COUNT),
            },
            {
              label: "성장한 구인",
              value: String(
                Object.entries(currentTotals).filter(
                  ([k, v]) => v > (prevTotals[k as ConstructId] ?? 0),
                ).length,
              ) + " / 6",
            },
            {
              label: "최고 구인",
              value: (
                Object.entries(currentTotals) as [ConstructId, number][]
              ).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "—",
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl border border-ink/10 bg-paper-2 px-4 py-3"
            >
              <p className="font-mono text-[10px] uppercase tracking-tighter2 text-ink/50">
                {label}
              </p>
              <p className="mt-1 font-kr text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        {/* ── charts grid ── */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* radar */}
          <div className="rounded-3xl border border-ink/10 bg-paper-2 p-6">
            <p className="font-mono text-[10px] uppercase tracking-tighter2 text-ink/50">
              이번 주 스냅샷 · 6개 구인
            </p>
            <h2 className="mt-1 font-kr text-lg font-semibold">
              이번 주 vs 지난 주
            </h2>
            <div className="mt-4">
              <ConstructRadar
                current={currentTotals}
                previous={prevTotals}
                ceiling={30}
              />
            </div>
          </div>

          {/* weekly bar */}
          <div className="rounded-3xl border border-ink/10 bg-paper-2 p-6">
            <p className="font-mono text-[10px] uppercase tracking-tighter2 text-ink/50">
              주간 합산 사고력 포인트
            </p>
            <h2 className="mt-1 font-kr text-lg font-semibold">
              4주 추이
            </h2>
            <div className="mt-4">
              <WeeklyBarChart weeks={weeklyScores} />
            </div>
          </div>
        </div>

        {/* ── this week breakdown ── */}
        {currentWeek && (
          <div className="mt-6 rounded-3xl border border-ink/10 bg-paper-2 p-6">
            <p className="font-mono text-[10px] uppercase tracking-tighter2 text-ink/50">
              구인별 상세 · {currentWeek.weekLabel}
            </p>
            <h2 className="mt-1 font-kr text-lg font-semibold">
              이번 주 구인 세부
            </h2>
            <div className="mt-5">
              <ConstructBreakdown scores={currentWeek.scores} ceiling={15} />
            </div>
          </div>
        )}

        {/* ── evidence quotes ── */}
        <div className="mt-8">
          <p className="font-mono text-[10px] uppercase tracking-tighter2 text-ink/50">
            발화 근거 · 최근 {evidence.length}건
          </p>
          <h2 className="mt-1 font-kr text-lg font-semibold">
            이 점수는 여기서 나왔습니다
          </h2>
          <p className="mt-2 mb-5 text-sm text-ink/60">
            "사고력이 늘었다"는 주장은 학생이 실제로 한 말로 뒷받침됩니다.
          </p>
          <EvidenceSection items={evidence} />
        </div>
      </section>
    </main>
  );
}
