"use client";

import { useState } from "react";
import { buildRecap, traceMatchPercent } from "@/lib/recap";
import type { Coaching } from "@/lib/problems";
import type { EvidenceByConstruct } from "@/components/session/DiagnosticResult";
import { cn } from "@/lib/cn";

type MakerKind = "game" | "video" | "quiz";

const MAKERS: { kind: MakerKind; label: string; hint: string }[] = [
  { kind: "game", label: "게임으로 만들기", hint: "이 개념을 배우는 미니 게임" },
  { kind: "video", label: "영상 풀이로 만들기", hint: "60초 설명 영상 대본" },
  { kind: "quiz", label: "퀴즈로 만들기", hint: "이해를 점검하는 5문제" },
];

function makerPrompt(paragraph: string, kind: MakerKind): string {
  const base = `Here's how I think about a math problem, in my own words:\n\n"${paragraph}"\n\n`;
  switch (kind) {
    case "game":
      return (
        base +
        "Using the idea above, build a simple, fun browser game as a single self-contained HTML file that helps someone learn this concept. Keep it playable in under a minute, then briefly tell me how to play."
      );
    case "video":
      return (
        base +
        "Using the idea above, write a short, engaging 60-second video script — with scene directions and narration — that explains this concept to a friend."
      );
    case "quiz":
      return (
        base +
        "Using the idea above, create a 5-question quiz (with answers and a one-line explanation for each) that checks whether someone truly understands this concept."
      );
  }
}

// The student-facing payoff: their 5-minute chat, distilled into one English
// paragraph that IS a prompt — then one tap turns it into a game / video / quiz
// in a real AI tool. The revelation: your conversation was prompt-engineering.
export function PromptStudio({
  coaching,
  evidence,
  onDetail,
}: {
  coaching: Coaching;
  evidence: EvidenceByConstruct;
  onDetail?: () => void;
}) {
  const { paragraph } = buildRecap(coaching, evidence);
  const [draft, setDraft] = useState("");
  const [active, setActive] = useState<MakerKind | null>(null);
  const [copied, setCopied] = useState(false);

  const pct = traceMatchPercent(draft, paragraph);
  const prompt = active ? makerPrompt(paragraph, active) : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard blocked — the textarea below is still selectable */
    }
  }

  function openIn(tool: "chatgpt" | "claude") {
    copy();
    const url =
      tool === "chatgpt"
        ? `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`
        : `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-accent/30 bg-accent-soft/25">
      <div className="p-5 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-tighter2 text-accent">
          당신의 대화가 만든 것 · Your prompt
        </p>
        <h2 className="mt-2 font-kr text-xl font-bold leading-snug tracking-tighter2 break-keep">
          방금 그 5분 대화는,
          <br />
          AI에게 시킬 ‘프롬프트’였어요.
        </h2>

        {/* The prompt itself */}
        <div className="relative mt-4 rounded-2xl border border-ink/12 bg-paper p-4">
          <span className="absolute right-3 top-3 font-mono text-[9px] uppercase tracking-tighter2 text-ink/30">
            prompt
          </span>
          <p className="font-sans text-[15px] leading-relaxed text-ink/85">{paragraph}</p>
        </div>

        {/* Trace it */}
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
            <p className="mt-1.5 font-kr text-[12px] text-accent">거의 똑같이 옮겼어요. 훌륭해요!</p>
          )}
        </div>
      </div>

      {/* Make something with the prompt */}
      <div className="border-t border-accent/20 bg-paper/40 p-5 sm:p-6">
        <p className="font-kr text-[13px] font-semibold text-ink/75">
          이 프롬프트로 무엇을 만들어볼까요?
        </p>
        <p className="mt-1 font-kr text-[12.5px] leading-relaxed text-ink/55">
          버튼을 누르면 당신의 프롬프트가 만들어집니다 — 진짜 AI에 넣어 결과물을 받아보세요.
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
                  "mt-0.5 block font-kr text-[11.5px] leading-snug",
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
              rows={5}
              onFocus={(e) => e.currentTarget.select()}
              className="mt-2 w-full resize-none rounded-xl border border-ink/12 bg-paper-2 px-3 py-2.5 font-sans text-[12.5px] leading-relaxed text-ink/75 outline-none"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copy}
                className="rounded-xl bg-ink px-4 py-2.5 font-kr text-[13px] font-semibold text-on-dark transition hover:bg-accent"
              >
                {copied ? "복사됐어요!" : "프롬프트 복사"}
              </button>
              <button
                type="button"
                onClick={() => openIn("chatgpt")}
                className="rounded-xl border border-ink/15 bg-paper px-4 py-2.5 font-kr text-[13px] font-medium text-ink transition hover:border-accent/60"
              >
                ChatGPT에서 열기 →
              </button>
              <button
                type="button"
                onClick={() => openIn("claude")}
                className="rounded-xl border border-ink/15 bg-paper px-4 py-2.5 font-kr text-[13px] font-medium text-ink transition hover:border-accent/60"
              >
                Claude에서 열기 →
              </button>
            </div>
            <p className="mt-2.5 font-kr text-[11.5px] leading-relaxed text-ink/45">
              열기를 누르면 프롬프트가 복사돼요. AI 입력창에 붙여넣기(⌘/Ctrl+V)만 하면 됩니다.
            </p>
          </div>
        )}

        <p className="mt-4 font-kr text-[12.5px] leading-relaxed text-ink/55">
          생각을 프롬프트로, 프롬프트를 결과물로 — 이게 AI 인재가 일하는 방식이에요.
          {onDetail && (
            <>
              {" "}
              <button
                type="button"
                onClick={onDetail}
                className="font-semibold text-accent underline-offset-4 hover:underline"
              >
                문장별로 자세히 보기
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
