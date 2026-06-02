import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { issueBillingKey, chargeBilling, TossError } from "@/lib/billing/toss";
import { recordSuccessfulCharge, addOneMonth, newOrderId } from "@/lib/billing/store";
import { PLAN, customerKeyFor } from "@/lib/billing/plan";

export const runtime = "nodejs";

// Toss redirects here after the customer registers a card (successUrl), with
// ?authKey=...&customerKey=... . We exchange the authKey for a billingKey, charge
// the first cycle, persist, then bounce back to /billing.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const authKey = url.searchParams.get("authKey");
  const customerKey = url.searchParams.get("customerKey");
  const back = (q: string) => NextResponse.redirect(new URL(`/billing?${q}`, url.origin));

  if (!authKey || !customerKey) return back("error=missing_params");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login?next=/subscribe", url.origin));
  if (customerKey !== customerKeyFor(user.id)) return back("error=key_mismatch");

  try {
    const { billingKey } = await issueBillingKey({ authKey, customerKey });
    const orderId = newOrderId(user.id);
    const payment = await chargeBilling({
      billingKey,
      customerKey,
      amount: PLAN.amount,
      orderId,
      orderName: PLAN.name,
    });
    const start = new Date();
    await recordSuccessfulCharge({
      userId: user.id,
      payment,
      orderId,
      periodStart: start,
      periodEnd: addOneMonth(start),
      billingKey,
      customerKey,
    });
    return back("welcome=1");
  } catch (e) {
    console.error("[billing/confirm]", e);
    const code = e instanceof TossError ? e.code : "charge_failed";
    return back(`error=${encodeURIComponent(code)}`);
  }
}
