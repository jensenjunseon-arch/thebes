import type { Metadata, Viewport } from "next/types";
import { Instrument_Serif } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import "katex/dist/katex.min.css";
import { ResultSync } from "@/components/ResultSync";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

// Default (fallback) identity for any page that doesn't set its own title —
// notably the client-rendered /login and /signup, which can't export metadata.
// Eigenlyric is the active product; the shelved thebes landing pages each set
// their own explicit Thebes title, so they're unaffected.
export const metadata: Metadata = {
  title: "eigenlyric AI — 차트 속 가사로 배우는 영어 & 한국어",
  description:
    "차트에 오른 K-pop을 고르면, 그 안의 영어(와 한국어) 단어를 눌러 뜻·맥락·다른 노래까지 배우는 자기주도 어휘 학습.",
};

// resizes-content: when the mobile keyboard opens, the layout (100dvh) shrinks
// so the input rides above the keyboard instead of the page scrolling the
// problem/coach out of view.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      className={`${instrumentSerif.variable} ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body>
        {children}
        <ResultSync />
      </body>
    </html>
  );
}
