import { SiteHeader } from "@/components/SiteHeader";
import { LyricsApp } from "@/components/lyrics/LyricsApp";

export const metadata = {
  title: "Thebes — 차트 속 가사로 단어 공부",
  description:
    "차트에 오른 노래를 고르면, 그 안의 영어(와 한국어) 단어를 눌러 뜻·맥락·다른 노래까지 배우고, 더 궁금한 건 바로 물어보는 자기주도 어휘 학습.",
};

export default function LyricsPage() {
  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader label="Lyrics" />
      <LyricsApp />
    </main>
  );
}
