import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN } from "./plan";
import type { TossPayment } from "./toss";

export function addOneMonth(from: Date): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() + 1);
  return d;
}

export function newOrderId(userId: string): string {
  return `sub_${userId.slice(0, 8)}_${Date.now()}`;
}

// Persist a successful charge: activate/extend the subscription and append the
// payment to the log. Service-role write (no user session needed).
export async function recordSuccessfulCharge(opts: {
  userId: string;
  payment: TossPayment;
  orderId: string;
  periodStart: Date;
  periodEnd: Date;
  billingKey?: string;
  customerKey?: string;
}): Promise<void> {
  const admin = createAdminClient();
  const nowIso = new Date().toISOString();

  const sub: Record<string, unknown> = {
    user_id: opts.userId,
    status: "active",
    plan_id: PLAN.id,
    amount: PLAN.amount,
    currency: PLAN.currency,
    cancel_at_period_end: false,
    current_period_start: opts.periodStart.toISOString(),
    current_period_end: opts.periodEnd.toISOString(),
    updated_at: nowIso,
  };
  if (opts.billingKey) sub.billing_key = opts.billingKey;
  if (opts.customerKey) sub.customer_key = opts.customerKey;

  const { error: subErr } = await admin
    .from("subscriptions")
    .upsert(sub, { onConflict: "user_id" });
  if (subErr) throw new Error(`subscription upsert failed: ${subErr.message}`);

  const { error: payErr } = await admin.from("billing_payments").insert({
    user_id: opts.userId,
    order_id: opts.orderId,
    payment_key: opts.payment.paymentKey ?? null,
    amount: opts.payment.totalAmount ?? PLAN.amount,
    status: opts.payment.status ?? "DONE",
    raw: opts.payment,
  });
  if (payErr) throw new Error(`payment log failed: ${payErr.message}`);
}
