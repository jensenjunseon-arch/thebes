import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { chargeBilling } from "@/lib/billing/toss";
import { recordSuccessfulCharge, addOneMonth, newOrderId } from "@/lib/billing/store";
import { PLAN } from "@/lib/billing/plan";

export const runtime = "nodejs";

// Recurring charge runner — point a daily cron at this. Charges every active
// subscription whose period has ended. Protected by CRON_SECRET (Vercel Cron
// sends `Authorization: Bearer <CRON_SECRET>` automatically).
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

async function run() {
  const admin = createAdminClient();
  const { data: due, error } = await admin
    .from("subscriptions")
    .select("user_id, billing_key, customer_key, cancel_at_period_end")
    .eq("status", "active")
    .lte("current_period_end", new Date().toISOString())
    .limit(100);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  let charged = 0;
  let canceled = 0;
  let failed = 0;

  for (const sub of due ?? []) {
    if (sub.cancel_at_period_end) {
      await admin
        .from("subscriptions")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("user_id", sub.user_id);
      canceled++;
      continue;
    }
    if (!sub.billing_key || !sub.customer_key) {
      failed++;
      continue;
    }
    try {
      const orderId = newOrderId(sub.user_id);
      const payment = await chargeBilling({
        billingKey: sub.billing_key,
        customerKey: sub.customer_key,
        amount: PLAN.amount,
        orderId,
        orderName: PLAN.name,
      });
      const start = new Date();
      await recordSuccessfulCharge({
        userId: sub.user_id,
        payment,
        orderId,
        periodStart: start,
        periodEnd: addOneMonth(start),
      });
      charged++;
    } catch (e) {
      console.error("[billing/charge-due] failed", sub.user_id, e);
      await admin
        .from("subscriptions")
        .update({ status: "past_due", updated_at: new Date().toISOString() })
        .eq("user_id", sub.user_id);
      failed++;
    }
  }

  return NextResponse.json({ ok: true, charged, canceled, failed });
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ ok: false }, { status: 401 });
  return run();
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ ok: false }, { status: 401 });
  return run();
}
