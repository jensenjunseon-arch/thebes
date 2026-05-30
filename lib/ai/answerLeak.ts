// Defensive filter. The system prompt already forbids leaking the answer,
// but production models slip occasionally. We check the assistant reply
// against a per-problem token list before showing it to the student.
// On a hit, the caller is expected to retry once with a stronger reminder.

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Build a matcher for one token. For tokens that start/end with a digit we add
// a digit-boundary so the answer "3" does NOT false-match inside "13" or "30",
// while still catching a standalone "3". Non-numeric edges fall back to plain
// substring containment.
function buildMatcher(token: string): RegExp {
  const escaped = escapeRegExp(token.toLowerCase());
  const startsDigit = /^\d/.test(token);
  const endsDigit = /\d$/.test(token);
  const left = startsDigit ? "(?<![\\d.,])" : "";
  const right = endsDigit ? "(?![\\d.,])" : "";
  return new RegExp(`${left}${escaped}${right}`);
}

export function detectAnswerLeak(
  message: string,
  forbiddenTokens: ReadonlyArray<string>,
): { leaked: boolean; matched?: string } {
  const lower = message.toLowerCase();
  for (const token of forbiddenTokens) {
    if (!token) continue;
    if (buildMatcher(token).test(lower)) {
      return { leaked: true, matched: token };
    }
  }
  return { leaked: false };
}
