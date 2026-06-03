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

export const metadata: Metadata = {
  title: "Thebes AI — 답이 아니라 사고를 키우는 AI 코치",
  description:
    "답은 AI가 냅니다. Thebes AI는 답이 아니라, 문제를 영어로 ‘어떻게 생각하는가’ — AI 시대의 사고력을 키웁니다.",
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
