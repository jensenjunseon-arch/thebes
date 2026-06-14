import type { Metadata } from "next/types";
import "./cardnews.css";

// Internal content-studio tool — keep it out of search indexes.
export const metadata: Metadata = {
  title: "Card News Studio — Thebes AI",
  robots: { index: false, follow: false },
};

export default function CardnewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
