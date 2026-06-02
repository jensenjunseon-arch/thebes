// Server-only Toss Payments billing helpers. Uses TOSS_SECRET_KEY via HTTP Basic
// auth (`base64(secretKey + ":")`). Never import this from a client component —
// it reads the secret key.

const TOSS_API = "https://api.tosspayments.com";

export class TossError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "TossError";
    this.code = code;
  }
}

function authHeader(): string {
  const secret = process.env.TOSS_SECRET_KEY;
  if (!secret) throw new TossError("NO_SECRET_KEY", "TOSS_SECRET_KEY is not set");
  return "Basic " + Buffer.from(`${secret}:`).toString("base64");
}

async function tossPost(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${TOSS_API}${path}`, {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new TossError(
      (data as { code?: string }).code ?? `HTTP_${res.status}`,
      (data as { message?: string }).message ?? `Toss request failed (${res.status})`,
    );
  }
  return data;
}

export interface BillingKeyResult {
  billingKey: string;
  customerKey: string;
  card?: { number?: string; cardType?: string; ownerType?: string };
}

// Exchange the one-time authKey (from the card-registration redirect) for a
// reusable billingKey.
export async function issueBillingKey(params: {
  authKey: string;
  customerKey: string;
}): Promise<BillingKeyResult> {
  return (await tossPost("/v1/billing/authorizations/issue", {
    authKey: params.authKey,
    customerKey: params.customerKey,
  })) as BillingKeyResult;
}

export interface TossPayment {
  paymentKey?: string;
  orderId?: string;
  status?: string; // DONE, CANCELED, ABORTED, ...
  totalAmount?: number;
  approvedAt?: string;
  [k: string]: unknown;
}

// Charge a saved billingKey for one cycle.
export async function chargeBilling(params: {
  billingKey: string;
  customerKey: string;
  amount: number;
  orderId: string;
  orderName: string;
}): Promise<TossPayment> {
  return (await tossPost(`/v1/billing/${params.billingKey}`, {
    customerKey: params.customerKey,
    amount: params.amount,
    orderId: params.orderId,
    orderName: params.orderName,
  })) as TossPayment;
}
