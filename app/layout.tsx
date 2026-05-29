import type { Metadata } from "next/types";
import { Instrument_Serif } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import "katex/dist/katex.min.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Thebes AI — 영어로 수학을 풀게 하는 1:1 AI 코치",
  description:
    "영어로 수학을 풀게 하며, 점수가 아니라 AI 시대의 사고력을 키웁니다.",
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
      <body>{children}</body>
    </html>
  );
}
