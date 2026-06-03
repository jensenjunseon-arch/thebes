import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { CancelButton } from "@/components/billing/CancelButton";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { PLAN, formatKRW } from "@/lib/billing/plan";

const ERROR_COPY: Record<string, string> = {
  missing_params: "결제 정보가 누락됐어요. 다시 시도해 주세요.",
  key_mismatch: "결제 계정이 일치하지 않아요. 다시 로그인 후 시도해 주세요.",
  auth_canceled: "카드 등록이 취소됐어요.",
  charge_failed: "결제에 실패했어요. 카드를 확인하고 다시 시도해 주세요.",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; error?: string }>;
}) {
  const sp = await searchParams;

  if (!isSupabaseConfigured()) {
    return (
      <main className="grid min-h-dvh place-items-center bg-paper px-6 text-center text-ink">
        <p className="max-w-sm break-keep text-sm leading-relaxed text-ink/60">
          결제는 백엔드(Supabase + Toss) 설정 후 이용할 수 있어요.
        </p>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/billing");

  // Safe columns only — billing_key / customer_key never leave the server.
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status, plan_id, amount, current_period_end, cancel_at_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  const active = sub?.status === "active";
  const pastDue = sub?.status === "past_due";
  const errorMsg = sp.error ? (ERROR_COPY[sp.error] ?? "문제가 발생했어요.") : null;

  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader label="Billing" />
      <section className="mx-auto max-w-md break-keep px-5 pb-24 pt-8 sm:px-6">
        <p className="font-mono text-[11px] uppercase tracking-tighter2 text-accent">
          Billing · 구독 관리
        </p>
        <h1 className="mt-3 font-kr text-2xl font-bold tracking-tighter2">내 구독</h1>

        {sp.welcome && (
          <div className="mt-5 rounded-2xl border border-accent/30 bg-accent-soft/40 px-4 py-3 font-kr text-sm leading-relaxed text-ink/80">
            구독이 시작됐어요 — 환영합니다! 첫 결제가 완료됐습니다.
          </div>
        )}
        {errorMsg && (
          <div className="mt-5 rounded-2xl border border-ink/20 bg-paper-2 px-4 py-3 font-kr text-sm leading-relaxed text-ink/75">
            {errorMsg}
          </div>
        )}

        <div className="mt-6 rounded-3xl border border-ink/10 bg-paper-2 p-6">
          {active ? (
            <>
              <div className="flex items-center justify-between">
                <span className="font-kr text-base font-semibold">{PLAN.name}</span>
                <span className="rounded-full bg-accent px-3 py-1 font-kr text-[12px] font-semibold text-on-dark">
                  구독 중
                </span>
              </div>
              <p className="mt-3 font-kr text-sm leading-relaxed text-ink/65">
                {formatKRW(sub!.amount)} / 월 · 다음 결제일{" "}
                <b className="text-ink">{fmtDate(sub!.current_period_end)}</b>
              </p>
              <Link
                href="/report"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 font-kr text-sm font-semibold text-on-dark transition hover:bg-accent"
              >
                전체 리포트 보기 →
              </Link>
              {sub!.cancel_at_period_end ? (
                <p className="mt-4 font-kr text-sm leading-relaxed text-ink/55">
                  해지 예약됨 — {fmtDate(sub!.current_period_end)}까지 이용할 수 있어요.
                </p>
              ) : (
                <div className="mt-5">
                  <CancelButton />
                </div>
              )}
            </>
          ) : pastDue ? (
            <>
              <div className="flex items-center justify-between">
                <span className="font-kr text-base font-semibold">{PLAN.name}</span>
                <span className="rounded-full bg-ink/10 px-3 py-1 font-kr text-[12px] font-semibold text-ink/60">
                  결제 실패
                </span>
              </div>
              <p className="mt-3 font-kr text-sm leading-relaxed text-ink/65">
                마지막 결제가 실패했어요. 카드를 다시 등록해 주세요.
              </p>
              <Link
                href="/subscribe"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 font-kr text-sm font-semibold text-on-dark transition hover:bg-accent"
              >
                카드 다시 등록 →
              </Link>
            </>
          ) : (
            <>
              <p className="font-kr text-base font-semibold">아직 구독 중이 아니에요</p>
              <p className="mt-2 font-kr text-sm leading-relaxed text-ink/60">
                {PLAN.name} · {formatKRW(PLAN.amount)} / 월
              </p>
              <Link
                href="/subscribe"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 font-kr text-sm font-semibold text-on-dark transition hover:bg-accent"
              >
                구독 시작 →
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
