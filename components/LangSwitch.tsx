import Link from "next/link";

function Globe() {
  return (
    <svg
      className="lp-lang-globe"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

/**
 * Segmented language switch (KO | EN). The current locale is the filled segment;
 * the other is a link to its page. Reads as a toggle, not a menu item.
 */
export function LangSwitch({ active }: { active: "ko" | "en" }) {
  return (
    <div className="lp-lang" role="group" aria-label="Language · 언어 선택">
      <Globe />
      {active === "ko" ? (
        <span className="lp-lang-opt is-active" aria-current="true">
          KO
        </span>
      ) : (
        <Link href="/" className="lp-lang-opt" aria-label="한국어로 전환">
          KO
        </Link>
      )}
      {active === "en" ? (
        <span className="lp-lang-opt is-active" aria-current="true">
          EN
        </span>
      ) : (
        <Link href="/en" className="lp-lang-opt" aria-label="Switch to English">
          EN
        </Link>
      )}
    </div>
  );
}
