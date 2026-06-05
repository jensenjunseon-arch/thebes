"use client";

import { useState } from "react";
import { buildRecap, traceMatchPercent } from "@/lib/recap";
import type { Coaching } from "@/lib/problems";
import type { EvidenceByConstruct } from "@/components/session/DiagnosticResult";
import { cn } from "@/lib/cn";

type MakerKind = "game" | "video" | "quiz";
type Band = "elementary" | "middle" | "high";

const MAKERS: { kind: MakerKind; label: string; hint: string }[] = [
  { kind: "game", label: "게임으로 만들기", hint: "개념이 곧 게임 규칙이 되는 미니 게임" },
  { kind: "video", label: "영상 풀이로 만들기", hint: "60초 숏폼 풀이 대본 (컷별)" },
  { kind: "quiz", label: "퀴즈로 만들기", hint: "사고를 깊게 하는 적응형 5문제" },
];

// 초등 저학년/고학년 → elementary, 중1~3 → middle, 고1~3 → high. Check 초등 first
// so "초등 고학년" isn't mistaken for high.
function levelBand(level?: string): Band {
  if (!level) return "middle";
  if (level.includes("초등")) return "elementary";
  if (level.includes("고")) return "high";
  return "middle";
}

const BAND_LABEL: Record<Band, string> = {
  elementary: "Korean elementary-school",
  middle: "Korean middle-school",
  high: "Korean high-school",
};
const BAND_NOTE: Record<Band, string> = {
  elementary:
    "Use very simple Korean words and a playful tone; assume no formulas, only intuition and pictures.",
  middle: "Use clear Korean at a middle-school level; light formulas and variables are fine.",
  high: "Use precise Korean at a high-school level; proper terms and a bit of rigor are welcome.",
};

// Highly tailored, format-specific prompts — each leverages what its medium does
// best, scaled to the student's school band, so the AI's output is an actual
// "wow" they understand. The student's own English paragraph is the seed.
function makerPrompt(paragraph: string, kind: MakerKind, band: Band): string {
  const who = BAND_LABEL[band];
  const note = BAND_NOTE[band];
  const seed = `A student described, in their own words, how they think about a math problem:\n"${paragraph}"\n\n`;

  switch (kind) {
    case "game":
      return (
        "You are an award-winning educational game designer.\n\n" +
        seed +
        "Build a COMPLETE, self-contained single-file HTML game (inline CSS + vanilla JS, no external libraries) where the concept above IS the gameplay: the player directly manipulates the key variables and watches the outcome change live, so the idea is *felt*, not told. It must not be a quiz.\n\n" +
        `Audience: a ${who} student. ${note} All on-screen text in Korean.\n` +
        "Make the core idea click within 30 seconds of play, with a small win/feedback moment.\n" +
        "Return (1) the full HTML in one code block, then (2) two short Korean lines — how to play, and the one ‘아하’ it teaches."
      );
    case "video":
      return (
        "You are a top short-form educational creator who makes hard ideas feel obvious.\n\n" +
        seed +
        `Write a 60-second vertical video script that makes this concept click for a ${who} student. ${note}\n` +
        "Deliver it as a shot-by-shot table with columns: [time | on-screen visual / animation | narration in Korean].\n" +
        "- Open with a 3-second curiosity hook.\n" +
        `- Use exactly one everyday analogy a ${who} student gets instantly.\n` +
        "- Build to a single ‘오~’ reveal, then end on a one-line takeaway.\n" +
        "Keep the narration natural, energetic Korean at the right level."
      );
    case "quiz":
      return (
        "You are a master teacher whose questions teach, not just test.\n\n" +
        seed +
        `Create a 5-question quiz for a ${who} student that deepens understanding of this concept. ${note}\n` +
        "For each question give: the question (in Korean) → 4 choices → the correct answer → a one-line ‘왜’ that adds a fresh insight (never just ‘정답입니다’).\n" +
        "Sequence by design: Q1 easy for confidence · Q2–Q3 apply the relationship · Q4 transfer it to real life · Q5 a ‘이걸 바꾸면?’ twist that exposes the core idea.\n" +
        "Reward the reasoning the student showed above over raw calculation, and keep the wording at their level."
      );
  }
}

// The student-facing payoff: their 5-minute chat, distilled into one English
// paragraph that IS a prompt — then one tap turns it into a game / video / quiz
// in a real AI tool. The revelation: your conversation was prompt-engineering.
export function PromptStudio({
  coaching,
  evidence,
  level,
  onDetail,
}: {
  coaching: Coaching;
  evidence: EvidenceByConstruct;
  level?: string;
  onDetail?: () => void;
}) {
  const { paragraph } = buildRecap(coaching, evidence);
  const band = levelBand(level);
  const [draft, setDraft] = useState("");
  const [active, setActive] = useState<MakerKind | null>(null);
  const [copied, setCopied] = useState(false);

  const pct = traceMatchPercent(draft, paragraph);
  const prompt = active ? makerPrompt(paragraph, active, band) : "";

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

        {/* The prompt itself */}
        <div className="relative mt-3 rounded-2xl border border-ink/12 bg-paper p-4">
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
          우리의 대화로 무엇을 만들어볼까요?
        </p>
        <p className="mt-1 font-kr text-[12.5px] leading-relaxed text-ink/55">
          버튼을 누르면 당신의 AI 결과물이 만들어집니다.
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
