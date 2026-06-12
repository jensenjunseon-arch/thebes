"use client";

// The payoff: the student's plan lines come back as ONE clean English paragraph
// — their thinking, in their order, reading like a prompt. Trace it, then turn
// it into a real AI artifact (game / video / quiz) with the shared maker engine.

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { traceMatchPercent } from "@/lib/recap";
import {
  MAKERS,
  ITERATE_CHIPS,
  levelBand,
  makerPrompt,
  type MakerKind,
} from "@/lib/makers";
import type { PlanLine, ProblemPack } from "@/lib/studio/types";

export function Payoff({
  pack,
  lines,
  onRestart,
}: {
  pack: ProblemPack;
  lines: PlanLine[];
  onRestart: () => void;
}) {
  const [paragraph, setParagraph] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [draft, setDraft] = useState("");
  const [active, setActive] = useState<MakerKind | null>(null);
  const [copied, setCopied] = useState(false);

  const realLines = lines
    .map((l) => l.text)
    .filter((t) => !t.startsWith("(The student says:") && t !== "💭 막혔어요…");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/studio/recap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ english: pack.english, lines: realLines }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { paragraph: string };
        if (!cancelled) setParagraph(data.paragraph);
      } catch {
        if (!cancelled) {
          // Graceful: stitch the raw lines so the payoff still works offline.
          setParagraph(realLines.join(" "));
          setFailed(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Best student quotes: great lines first, then good — verbatim.
  const quotes = [
    ...lines.filter((l) => l.feedback?.verdict === "great"),
    ...lines.filter((l) => l.feedback?.verdict === "good"),
  ]
    .map((l) => l.text)
    .filter((t) => !t.startsWith("(The student says:") && t !== "💭 막혔어요…")
    .slice(0, 3);

  const pct = paragraph ? traceMatchPercent(draft, paragraph) : 0;
  const prompt =
    active && paragraph
      ? makerPrompt(paragraph, active, levelBand(pack.level), {
          statement: pack.english,
          korean: pack.korean,
          topic: pack.topic,
        }, quotes)
      : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* selectable below */
    }
  }

  function openIn(tool: "chatgpt" | "claude") {
    void copy();
    const url = tool === "chatgpt" ? "https://chatgpt.com/" : "https://claude.ai/new";
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (paragraph === null) {
    return (
      <section className="rounded-3xl border border-accent/30 bg-accent-soft/25 p-6">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
          <p className="font-kr text-[13.5px] text-ink/65">
            당신의 풀이를 한 편의 영어 글로 엮는 중…
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-accent/30 bg-accent-soft/25">
      <div className="p-5 sm:p-6">
        <p className="font-kr text-[14px] font-semibold leading-relaxed text-ink/80 break-keep">
          방금 쓴 풀이가, 한 편의 영어 글이 됐어요{failed ? " (오프라인 버전)" : ""}.
        </p>

        <div className="relative mt-3 rounded-2xl border border-ink/12 bg-paper p-4">
          <span className="absolute right-3 top-3 font-mono text-[9px] uppercase tracking-tighter2 text-ink/30">
            prompt
          </span>
          <p className="font-sans text-[15px] leading-relaxed text-ink/85">{paragraph}</p>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-baseline justify-between">
            <p className="font-kr text-[13px] font-semibold text-ink/75">따라 써보기</p>
            <span className="font-mono text-[11px] tabular-nums text-accent">{pct}%</span>
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="위 문단을 영어로 따라 써보세요…"
            rows={2}
            className="w-full resize-none rounded-xl border border-ink/15 bg-paper px-3.5 py-2.5 text-[14px] leading-relaxed outline-none placeholder:text-ink/35 focus:border-accent"
          />
          {pct >= 90 && (
            <p className="mt-1.5 font-kr text-[12px] text-accent">
              거의 똑같이 옮겼어요. 훌륭해요!
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-accent/20 bg-paper/40 p-5 sm:p-6">
        <p className="font-kr text-[13px] font-semibold text-ink/75">
          이 생각으로, 무엇을 만들어볼까요?
        </p>
        <p className="mt-1 font-kr text-[12.5px] leading-relaxed text-ink/55 break-keep">
          버튼 하나면, 방금 그 문제와 당신의 풀이가 그대로 들어간 진짜 AI 결과물이 나옵니다.
        </p>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {MAKERS.map((m) => (
            <button
              key={m.kind}
              type="button"
              onClick={() => {
                setActive(m.kind);
                setCopied(false);
              }}
              className={cn(
                "rounded-2xl border px-3 py-3 text-left transition",
                active === m.kind
                  ? "border-accent bg-accent text-on-dark"
                  : "border-ink/15 bg-paper text-ink hover:border-accent/60",
              )}
            >
              <span className="block font-kr text-[14px] font-semibold">{m.label}</span>
              <span
                className={cn(
                  "mt-0.5 block font-kr text-[11.5px] leading-snug break-keep",
                  active === m.kind ? "text-on-dark/70" : "text-ink/50",
                )}
              >
                {m.hint}
              </span>
            </button>
          ))}
        </div>

        {active && (
          <div className="mt-3 rounded-2xl border border-ink/12 bg-paper p-4">
            <p className="font-mono text-[10px] uppercase tracking-tighter2 text-ink/40">
              완성된 프롬프트
            </p>
            <textarea
              readOnly
              value={prompt}
              rows={8}
              onFocus={(e) => e.currentTarget.select()}
              className="mt-2 w-full resize-none rounded-xl border border-ink/12 bg-paper-2 px-3 py-2.5 font-sans text-[12.5px] leading-relaxed text-ink/75 outline-none"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void copy()}
                className="rounded-xl bg-ink px-4 py-2.5 font-kr text-[13px] font-semibold text-on-dark transition hover:bg-accent"
              >
                {copied ? "복사됐어요!" : "프롬프트 복사"}
              </button>
              <button
                type="button"
                onClick={() => openIn("claude")}
                className="rounded-xl border border-ink/15 bg-paper px-4 py-2.5 font-kr text-[13px] font-medium text-ink transition hover:border-accent/60"
              >
                Claude에서 열기 →
              </button>
              <button
                type="button"
                onClick={() => openIn("chatgpt")}
                className="rounded-xl border border-ink/15 bg-paper px-4 py-2.5 font-kr text-[13px] font-medium text-ink transition hover:border-accent/60"
              >
                ChatGPT에서 열기 →
              </button>
            </div>
            <p className="mt-2.5 font-kr text-[11.5px] leading-relaxed text-ink/45 break-keep">
              열기를 누르면 프롬프트가 복사돼요. AI 입력창에 붙여넣기(⌘/Ctrl+V)하면 30초쯤 뒤
              결과물이 나옵니다.
            </p>
            <div className="mt-3 rounded-xl bg-accent-soft/40 px-3.5 py-3">
              <p className="font-kr text-[12px] font-semibold text-ink/70">
                결과물이 나오면, 이렇게 답장해보세요
              </p>
              <p className="mt-1 font-kr text-[12px] leading-relaxed text-ink/55 break-keep">
                {ITERATE_CHIPS.map((c, i) => (
                  <span key={c}>
                    {i > 0 && <span className="text-ink/30"> · </span>}
                    &ldquo;{c}&rdquo;
                  </span>
                ))}
              </p>
              <p className="mt-1.5 font-kr text-[11.5px] leading-relaxed text-ink/45 break-keep">
                AI에게 고치라고 시키는 것 — 그게 진짜 AI를 다루는 기술이에요.
              </p>
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between">
          <p className="font-kr text-[12.5px] leading-relaxed text-ink/55 break-keep">
            생각을 프롬프트로, 프롬프트를 결과물로.
          </p>
          <button
            type="button"
            onClick={onRestart}
            className="rounded-full border border-ink/15 px-4 py-2 font-kr text-[12.5px] font-medium text-ink/60 transition hover:border-accent/50 hover:text-accent"
          >
            새 문제 풀기 ↺
          </button>
        </div>
      </div>
    </section>
  );
}
