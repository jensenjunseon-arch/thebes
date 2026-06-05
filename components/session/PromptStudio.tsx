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

// Production-grade, format-specific prompts. Each is a long, fully-specified brief
// — role, the student's thinking as the seed, a structured spec, a quality bar,
// and an exact output format — scaled to the student's school band, so the AI's
// output is genuinely excellent. The student's own English paragraph is the seed.
function makerPrompt(paragraph: string, kind: MakerKind, band: Band): string {
  const who = BAND_LABEL[band];
  const note = BAND_NOTE[band];
  const seed = `=== THE STUDENT'S THINKING (the seed — the heart of everything below) ===
A ${who} student described, in their own words, how they understand a math problem:
"${paragraph}"
Everything you make must deliver THIS exact insight. Reward the reasoning the student already showed; never replace it with a generic textbook explanation.`;

  switch (kind) {
    case "game":
      return `You are a world-class educational game designer AND a senior front-end engineer who has shipped award-winning learning games. Your gift is turning one abstract idea into a tiny, addictive, *playable* experience where the player learns by DOING — never by reading a wall of text.

${seed}

=== YOUR MISSION ===
Design and build a complete, polished, single-file browser game where the concept above IS the gameplay. The player should manipulate the key variables directly and instantly see the consequence, so the relationship becomes obvious through play. It must NOT be a quiz or a slideshow.

=== GAME DESIGN SPEC ===
1. CORE MECHANIC: choose ONE clear interaction (e.g. drag/sliders/clicks that change the variables) with a live visual that responds in real time. The player should hit a first "아하" within ~20 seconds.
2. GOAL & FEEDBACK: a concrete goal each round (balance / match / reach a target). Give immediate visual feedback for every action and a satisfying, animated win state with a short congratulating line.
3. PROGRESSION: exactly 3 short levels that get harder and each reveal a NEW nuance of the concept. Show score or stars and a simple level indicator.
4. JUICE: smooth CSS transitions, clear hover/press states, a small celebratory animation on success. It must feel alive, not like a worksheet.
5. REPLAY: a "다시 도전" button and a small twist so round 2 isn't identical.

=== AUDIENCE & LANGUAGE ===
- Player: a ${who} student. ${note}
- ALL on-screen text (title, instructions, buttons, feedback) in natural Korean at that level. Keep each instruction to one short line.

=== TECHNICAL & QUALITY BAR ===
- ONE self-contained .html file: inline <style> and <script>, VANILLA JS only. ZERO external libraries/CDNs/fonts/images — draw everything with HTML/CSS/Canvas.
- Runs by double-click; works on BOTH touch (mobile) and mouse (desktop); responsive; large tap targets; no console errors.
- Clean, commented, semantic code with a tasteful, modern color palette.

=== VISUAL & UX ===
- Calm background, ONE accent color, big readable numbers, generous spacing, zero clutter.
- When a variable changes, ANIMATE the dependent visual — never let it jump.
- One-thumb friendly on mobile; nothing tiny; obvious affordances.

=== A CONCRETE EXAMPLE OF THE RIGHT KIND OF MECHANIC (adapt — do NOT copy) ===
If the concept were "average speed on a round trip," the player might drag two speed sliders and watch a car cross a track while a live "평균 속력" needle moves — discovering that the average is NOT the midpoint of the two speeds. Find the equivalent *felt* mechanic for THIS student's concept.

=== ANTI-PATTERNS (do NOT do any of these) ===
- No walls of explanatory text; teach through the interaction, not paragraphs.
- No multiple-choice questions — this is a game, not a quiz.
- No external assets/libraries/CDNs, no "// TODO", no truncated or partial code.

=== BEFORE YOU CODE ===
First, in 2–3 Korean lines, decide the single best mechanic for THIS concept and why it makes the idea *felt*. Then build the complete game.

=== OUTPUT FORMAT (follow exactly) ===
1) First, 3 Korean lines: the game's name · the one concept it teaches · how to play (one line).
2) Then the COMPLETE, working HTML in a single fenced html code block — copy-paste-and-run, with NOTHING omitted, no "TODO", no placeholders.
3) Finally, 2 Korean lines: the precise "아하" moment the player should feel, and one idea to make it even better.

Take your time. Make it genuinely fun AND genuinely educational. Quality and completeness over brevity.`;

    case "video":
      return `You are a top-tier educational content director who writes viral 60-second explainer scripts (the best of YouTube Shorts / 숏폼) that make a hard idea feel obvious and even a little emotional. Your scripts are precise, visual, and impossible to scroll past.

${seed}

=== YOUR MISSION ===
Write a complete, production-ready 60-second vertical (9:16) short-form video script that makes a ${who} student truly *get* this concept — and want to send it to a friend.

=== BEAT MAP (use these exact timings) ===
- 0:00–0:03 HOOK — a surprising question or bold claim that opens a curiosity loop and stops the scroll.
- 0:03–0:12 SETUP — frame the everyday situation; introduce ONE concrete, relatable analogy a ${who} student already knows.
- 0:12–0:40 BUILD — walk the idea step by step through the analogy; show the relationship visibly changing; raise a small tension ("그런데 만약…?").
- 0:40–0:52 REVEAL — the single "오~!" moment where it all clicks; tie it back explicitly to the student's own words above.
- 0:52–1:00 PAYOFF — a one-line takeaway + a warm nudge to try it themselves.

=== DELIVER AS A SHOT-BY-SHOT TABLE ===
Columns: | 시간 | 화면 (비주얼·모션·자막) | 내레이션 (한국어) |
- 8–12 rows.
- Each row: precise on-screen visuals (shapes, numbers, arrows, captions — emoji-free) that are makeable with simple motion graphics (no expensive footage), plus tight narration.

=== AUDIENCE & VOICE ===
- Viewer: a ${who} student. ${note}
- Narration in warm, energetic, natural Korean at that level. Short sentences; explain any term the instant you use it.

=== QUALITY BAR ===
- Write TWO alternative hooks, pick the stronger, and add one line on why.
- The analogy must be something a ${who} student uses in daily life.
- End so the viewer could re-explain the whole idea in a single sentence.

=== VISUAL STYLE & PACING ===
- Bright, high-contrast motion graphics: bold numbers, arrows, simple shapes, big captions, ONE accent color.
- Fast cuts — a visible change every 3–5 seconds; momentum must never drop.
- Sync each key word of narration to an on-screen change so the eye and ear move together.

=== ANTI-PATTERNS (do NOT do any of these) ===
- No slow, lecture-style opening — the first 3 seconds decide everything.
- No jargon dropped without an instant, concrete explanation.
- No abstract visuals a ${who} student couldn't picture in their head.

=== THINK FIRST ===
Before writing the table, jot (in Korean) the ONE everyday analogy you'll build the whole video on, and the single "오~" reveal. Then write the script.

=== OUTPUT FORMAT (follow exactly) ===
1) Title + the one-sentence promise of the video (Korean).
2) The two candidate hooks + your pick (one-line reason).
3) The full shot-by-shot table.
4) A closing line: "왜 이 영상이 통하는가" (1 sentence) + one thumbnail text idea (Korean).

Make it genuinely gripping AND genuinely clear. Care and completeness over brevity.`;

    case "quiz":
      return `You are a master assessment designer and beloved teacher who writes questions that TEACH while they test — each item leaves the student understanding MORE than before. You are famous for distractors (wrong choices) that pinpoint exactly where a student's thinking breaks.

${seed}

=== YOUR MISSION ===
Create a complete, polished 5-question quiz for a ${who} student that moves them from "이거 대충 알아" to "이제 완전히 알겠어" — built around the exact concept above.

=== DESIGN PRINCIPLES ===
- Use this EXACT difficulty ladder:
  · Q1 — warm-up for confidence (recognize the idea).
  · Q2 — apply the relationship in a fresh but similar case.
  · Q3 — a misconception trap (the common wrong intuition appears as a tempting choice).
  · Q4 — transfer to a real-life situation a ${who} student actually cares about.
  · Q5 — a "이걸 바꾸면 어떻게 될까?" twist that forces reasoning about the relationship itself.
- EVERY question tests REASONING, not raw calculation or memorized formulas.
- DISTRACTORS: each wrong choice must encode a SPECIFIC misunderstanding, never a random number.

=== FOR EACH QUESTION, OUTPUT ===
1. 문항 — one clear, real-feeling scenario (Korean).
2. 선택지 — exactly 4 choices labeled ①②③④, all plausibly tempting (Korean).
3. 정답 — the correct choice, then for EACH wrong choice, one line naming the exact misconception it reveals.
4. 해설 — 1–2 lines that add a NEW insight (never just "정답입니다").
5. 한 줄 코칭 — what thinking skill this question is really training.

=== AUDIENCE & LANGUAGE ===
- Student: a ${who} student. ${note}
- All Korean at that level; scenarios should feel real and age-appropriate.

=== WRITING RULES ===
- Every scenario should feel like real life, not "철수가 사과 3개를 샀다" filler.
- Each item must be answerable by REASONING within a minute — no heavy computation.
- The Q3 trap must use the single most common wrong intuition for THIS concept.

=== A MINI-EXAMPLE OF A GOOD ITEM (adapt — do NOT copy) ===
문항: "더 빠른 길과 더 느린 길을 같은 거리만큼 갔어요. 전체 평균 속력은 두 속력의 한가운데일까요?" → ① 그렇다 ② 느린 쪽에 더 가깝다 ③ 빠른 쪽에 더 가깝다 ④ 알 수 없다. 정답 ②. ①은 '평균 = 중간값'이라는 가장 흔한 오해를 드러냅니다. 이렇게 오답이 *생각이 어디서 어긋났는지*를 진단하게 만드세요.

=== ANTI-PATTERNS (do NOT do any of these) ===
- No pure-calculation items; no "다음 중 옳은 것은?" without a real scenario.
- No random-number distractors — every wrong choice must encode a real misconception.

=== THINK FIRST ===
Before writing, note (in Korean) the single most common misconception for this concept — Q3 will target it.

=== OUTPUT FORMAT (follow exactly) ===
- A short intro line: what this quiz will sharpen.
- The 5 questions, each in the full structure above, clearly separated.
- A closing 2 lines: the single biggest idea the quiz reinforces, and a concrete next step for the student.

Make it rigorous, kind, and genuinely illuminating. Depth and completeness over brevity.`;
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
    // The prompt is long and detailed, so we copy it (no URL-length limit) and
    // open the tool's new chat — the student just pastes.
    copy();
    const url = tool === "chatgpt" ? "https://chatgpt.com/" : "https://claude.ai/new";
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-accent/30 bg-accent-soft/25">
      <div className="p-5 sm:p-6">
        <p className="font-kr text-[14px] font-semibold leading-relaxed text-ink/80 break-keep">
          방금 나눈 대화를, 한 편의 영어 글로 정리했어요.
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
              rows={8}
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
