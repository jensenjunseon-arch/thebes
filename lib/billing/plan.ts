// The subscription plan. Safe to import on the client (no secrets).
// EDIT `amount` to your real monthly price (KRW).
export const PLAN = {
  id: "monthly",
  name: "Thebes AI 월 구독",
  amount: 19900, // ₩19,900 / month — EDIT ME
  currency: "KRW",
  interval: "month" as const,
} as const;

export function formatKRW(amount: number): string {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

// Toss customerKey — stable per user, identifies the saved card across cycles.
// The auth uid (a UUID) satisfies Toss's allowed charset and length.
export function customerKeyFor(userId: string): string {
  return userId;
}
