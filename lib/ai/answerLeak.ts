// Defensive filter. The system prompt already forbids leaking the answer,
// but production models slip occasionally. We check the assistant reply
// against a per-problem token list before showing it to the student.
// On a hit, the caller is expected to retry once with a stronger reminder.

export function detectAnswerLeak(
  message: string,
  forbiddenTokens: ReadonlyArray<string>,
): { leaked: boolean; matched?: string } {
  const lower = message.toLowerCase();
  for (const token of forbiddenTokens) {
    if (!token) continue;
    if (lower.includes(token.toLowerCase())) {
      return { leaked: true, matched: token };
    }
  }
  return { leaked: false };
}
