// Two products share this codebase and its auth. Rather than hard-code one
// name into shared chrome (SiteHeader, AuthCard), surfaces pass the brand that
// owns them. Thebes (the math-thinking coach) is shelved; Lyrikko (chart-lyric
// vocabulary) is the active product and owns the auth flow, so LYRIKKO is the
// default for the login/signup surface.

export interface Brand {
  /** Wordmark base, e.g. "Lyrikko". */
  name: string;
  /** Wordmark suffix rendered in the accent gradient, e.g. "AI". */
  suffix: string;
  /** Where the logo links — each brand's own home, never the other's. */
  home: string;
}

export const THEBES: Brand = { name: "Thebes", suffix: "AI", home: "/" };
export const LYRIKKO: Brand = { name: "Lyrikko", suffix: "AI", home: "/lyrics" };
