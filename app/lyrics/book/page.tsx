import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { WordBook } from "@/components/lyrikko/WordBook";
import { EIGENLYRIC } from "@/lib/brand";

export const metadata = {
  title: "내 단어장 — Eigenlyric",
  description: "노래에서 모은 단어를 복습하고 쌓아가는 나만의 단어장.",
};

export default function WordBookPage() {
  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader label="Word Book" brand={EIGENLYRIC} />
      <div className="mx-auto max-w-3xl px-6 pb-24">
        <Link
          href={"/lyrics" as never}
          className="font-kr text-sm text-ink/50 transition hover:text-ink"
        >
          ← 노래로
        </Link>
        <h1 className="mt-4 font-kr text-2xl font-semibold tracking-tightish text-ink">
          📖 내 <span className="g-grad-text font-bold">단어장</span>
        </h1>
        <WordBook />
      </div>
    </main>
  );
}
