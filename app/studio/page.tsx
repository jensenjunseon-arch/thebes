import { SiteHeader } from "@/components/SiteHeader";
import { StudioApp } from "@/components/studio/StudioApp";

export const metadata = {
  title: "Thebes Studio — 문제를 올리면, 영어로 풀어요",
  description:
    "수학 문제 사진을 올리면 영어로 바꿔주고, 한 줄씩 풀이를 코칭하고, 당신의 풀이를 게임·영상·퀴즈로 만들어주는 AI 학습 스튜디오.",
};

export default function StudioPage() {
  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader label="Studio" />
      <StudioApp />
    </main>
  );
}
