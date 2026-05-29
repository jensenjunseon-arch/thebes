import type { Config } from "tailwindcss";

// Design tokens from PRD §7 — keep this file as the single source of truth.
// Do not introduce new accent colors here without product approval; the brand
// rule is one accent (terracotta) on a cream-paper field.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#F6F2E8",
          2: "#EEE8DA",
        },
        ink: {
          DEFAULT: "#14110C",
          card: "#15120D",
        },
        accent: {
          DEFAULT: "#B5411B",
          soft: "#ECCEB6",
        },
        "on-dark": "#F6F2E8",
      },
      fontFamily: {
        // English serif accent moments — "Frame it", "Plan it", etc.
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
        // English body / UI labels
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        // Korean — Pretendard. Never apply serif italic to Korean text.
        kr: ["Pretendard Variable", "Pretendard", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightish: "-0.01em",
        tighter2: "-0.02em",
      },
    },
  },
  plugins: [],
};

export default config;
