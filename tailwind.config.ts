import type { Config } from "tailwindcss";

// Design tokens — single source of truth (mirrors the CSS vars in globals.css).
// Brand rule: Gemini-clean — white surfaces, cool grays, ONE blue accent; the
// blue→purple→coral gradient is reserved for spark moments (brand "AI", glow).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#FFFFFF",
          2: "#F0F4F9",
        },
        ink: {
          DEFAULT: "#1F1F1F",
          card: "#1F1F1F",
        },
        accent: {
          DEFAULT: "#0B57D0",
          soft: "#D3E3FD",
        },
        "on-dark": "#F8FAFD",
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
