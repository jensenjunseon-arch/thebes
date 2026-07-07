import { SiteHeader } from "@/components/SiteHeader";
import { LyricsApp } from "@/components/lyrics/LyricsApp";
import { topChart, kpopChart } from "@/lib/lyrics/charts";
import { EIGENLYRIC } from "@/lib/brand";

export const metadata = {
  title: "Eigenlyric — 차트 속 가사로 단어 공부",
  description:
    "차트에 오른 노래를 고르면, 그 안의 영어(와 한국어) 단어를 눌러 뜻·맥락·다른 노래까지 배우고, 더 궁금한 건 바로 물어보는 자기주도 어휘 학습.",
};

// Re-fetch the live chart at most hourly (ISR).
export const revalidate = 3600;

export default async function LyricsPage() {
  const [globalChart, kpop] = await Promise.all([
    topChart(0, 10), // global
    kpopChart(), // curated K-pop chart snapshot — see lib/lyrics/charts.ts
  ]);
  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader label="Lyrics" brand={EIGENLYRIC} />
      <LyricsApp globalChart={globalChart} kpopChart={kpop} />
    </main>
  );
}
