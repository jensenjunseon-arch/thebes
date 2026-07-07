// Two products share this codebase and its auth. Rather than hard-code one
// name into shared chrome (SiteHeader, AuthCard), surfaces pass the brand that
// owns them. Thebes (the math-thinking coach) is shelved; Eigenlyric (the
// chart-lyric vocabulary app at eigenlyric.com) is the active product and owns
// the auth flow, so EIGENLYRIC is the default for the login/signup surface.
//
// The code still uses the internal `lyrikko` namespace (routes, lib, DB tables)
// — that's an implementation detail users never see; only this display brand
// changed when the product took the eigenlyric.com domain.

export interface Brand {
  /** Wordmark base, e.g. "Eigenlyric". */
  name: string;
  /** Wordmark suffix rendered in the accent gradient, e.g. "AI". */
  suffix: string;
  /** Where the logo links — each brand's own home, never the other's. */
  home: string;
}

export const THEBES: Brand = { name: "Thebes", suffix: "AI", home: "/" };
export const EIGENLYRIC: Brand = { name: "eigenlyric", suffix: "AI", home: "/lyrics" };
