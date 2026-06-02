import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Toss payment webhook. Carries the payment object (orderId + status). We sync
// the payment log; a failed/voided charge flips the subscription to past_due.
// For stronger trust you can re-query the payment via the Toss API before acting.
export async function POST(req: NextRequest) {
  let parsed: { data?: Record<string, unknown> } & Record<string, unknown>;
  try {
    parsed = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const data = (parsed.data ?? parsed) as Record<string, unknown>;
  const orderId = typeof data.orderId === "string" ? data.orderId : null;
  const status = typeof data.status === "string" ? data.status : null;

  if (orderId && status) {
    try {
      const admin = createAdminClient();
      await admin
        .from("billing_payments")
        .update({ status, raw: data })
        .eq("order_id", orderId);

      if (status === "CANCELED" || status === "ABORTED" || status === "EXPIRED") {
        const { data: row } = await admin
          .from("billing_payments")
          .select("user_id")
          .eq("order_id", orderId)
          .maybeSingle();
        if (row?.user_id) {
          await admin
            .from("subscriptions")
            .update({ status: "past_due", updated_at: new Date().toISOString() })
            .eq("user_id", row.user_id);
        }
      }
    } catch (e) {
      // Swallow internal errors so Toss doesn't retry-storm us; we log instead.
      console.error("[billing/webhook]", e);
    }
  }

  return NextResponse.json({ ok: true });
}
