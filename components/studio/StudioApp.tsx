"use client";

// The Studio orchestrator: entry → (reading…) → workspace → payoff.
// One problem in, one artifact out — no login, no DB, everything in-session.

import { useEffect, useRef, useState } from "react";
import { Entry, type EntrySubmit } from "@/components/studio/Entry";
import { TiltLoader } from "@/components/studio/TiltLoader";
import { ProblemView } from "@/components/studio/ProblemView";
import { FigureView } from "@/components/studio/FigureView";
import { SolveFlow } from "@/components/studio/SolveFlow";
import { Payoff } from "@/components/studio/Payoff";
import { ToolDock } from "@/components/studio/tools/ToolDock";
import type { PlanLine, ProblemPack } from "@/lib/studio/types";

type Phase = "entry" | "loading" | "work" | "payoff";

const LOADING_LINES = [
  "문제를 읽고 있어요…",
  "영어로 옮기는 중…",
  "핵심 어휘를 고르는 중…",
  "학습 도구를 준비하는 중…",
];

const ERROR_COPY: Record<string, string> = {
  not_math: "이 사진에서 수학 문제를 찾지 못했어요. 문제가 잘 보이게 다시 찍어볼까요?",
  no_key: "AI 연결이 아직 준비되지 않았어요. 잠시 후 다시 시도해 주세요.",
  ai_failed: "문제를 읽다가 막혔어요. 한 번만 다시 시도해 주세요.",
  bad_request: "내용이 너무 짧아요. 문제 전체를 올려주세요.",
};

export function StudioApp() {
  const [phase, setPhase] = useState<Phase>("entry");
  const [pack, setPack] = useState<ProblemPack | null>(null);
  const [lines, setLines] = useState<PlanLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingIdx, setLoadingIdx] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase !== "loading") return;
    setLoadingIdx(0);
    const t = setInterval(
      () => setLoadingIdx((i) => Math.min(i + 1, LOADING_LINES.length - 1)),
      2800,
    );
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [phase]);

  async function start(s: EntrySubmit) {
    setError(null);
    setPhase("loading");
    try {
      const url = s.generate ? "/api/studio/generate" : "/api/studio/ingest";
      const body = s.generate
        ? { level: s.generate.level, topic: s.generate.topic }
        : { image: s.image, text: s.text };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "ai_failed");
      }
      const p = (await res.json()) as ProblemPack;
      setPack(p);
      setLines([]);
      setPhase("work");
    } catch (err) {
      setError(ERROR_COPY[(err as Error).message] ?? ERROR_COPY.ai_failed);
      setPhase("entry");
    }
  }

  function restart() {
    setPack(null);
    setLines([]);
    setError(null);
    setPhase("entry");
  }

  return (
    <div ref={topRef}>
      {phase === "entry" && (
        <>
          {error && (
            <div className="mx-auto mt-4 w-full max-w-3xl px-5">
              <p className="rounded-2xl border border-accent/40 bg-accent-soft/40 px-4 py-3 font-kr text-[13px] leading-relaxed text-ink/75 break-keep">
                {error}
              </p>
            </div>
          )}
          <Entry onSubmit={(s) => void start(s)} busy={false} />
        </>
      )}

      {phase === "loading" && (
        <div className="mx-auto flex min-h-[calc(100dvh-64px)] w-full max-w-3xl flex-col items-center justify-center px-5">
          <TiltLoader status={LOADING_LINES[loadingIdx]} />
        </div>
      )}

      {phase === "work" && pack && (
        <div className="mx-auto w-full max-w-3xl space-y-4 px-5 pb-32 pt-6">
          <ProblemView pack={pack} />
          {pack.figure && <FigureView figure={pack.figure} />}
          <SolveFlow
            pack={pack}
            lines={lines}
            onLines={setLines}
            onFinish={() => setPhase("payoff")}
          />
          <ToolDock />
        </div>
      )}

      {phase === "payoff" && pack && (
        <div className="mx-auto w-full max-w-3xl space-y-4 px-5 pb-32 pt-6">
          <Payoff pack={pack} lines={lines} onRestart={restart} />
          <button
            type="button"
            onClick={() => setPhase("work")}
            className="font-kr text-[12.5px] text-ink/45 underline-offset-4 hover:text-accent hover:underline"
          >
            ← 풀이로 돌아가기
          </button>
        </div>
      )}
    </div>
  );
}
