"use client";

import { useState } from "react";
import { buildRecap, traceMatchPercent } from "@/lib/recap";
import type { Coaching } from "@/lib/problems";
import type { EvidenceByConstruct } from "@/components/session/DiagnosticResult";
import { cn } from "@/lib/cn";

type MakerKind = "game" | "video" | "quiz";
type Band = "elementary" | "middle" | "high";

const MAKERS: { kind: MakerKind; label: string; hint: string }[] = [
  { kind: "game", label: "게임으로 만들기", hint: "방금 그 문제가 최종 레벨이 되는 아케이드 게임" },
  { kind: "video", label: "영상 풀이로 만들기", hint: "내 생각이 대본이 되는 60초 숏폼 스크립트" },
  { kind: "quiz", label: "퀴즈 앱으로 만들기", hint: "오답이 '왜 틀렸는지' 짚어주는 인터랙티브 퀴즈" },
];

// Follow-up commands we teach the student to send AFTER the AI delivers —
// turning a so-so first result into agency ("I can direct this thing").
const ITERATE_CHIPS = ["더 화려하게 만들어줘", "한 단계 더 어렵게", "효과음도 넣어줘"];

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

export interface ProblemSeed {
  statement?: string;
  korean?: string;
  topic?: string;
}

// Up to 3 of the student's strongest verbatim lines from the conversation.
function studentQuotes(evidence: EvidenceByConstruct): string[] {
  const order = ["redefine", "decompose", "relate", "relevance", "transfer", "english"];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const k of order) {
    const q = evidence[k]?.quote?.trim();
    if (!q || seen.has(q)) continue;
    seen.add(q);
    out.push(q.length > 160 ? q.slice(0, 157) + "…" : q);
    if (out.length === 3) break;
  }
  return out;
}

// The shared seed — the student's exact problem, their reasoning, and their own
// words. Personalization is the wow: the output must feel like "MY problem,
// MY thinking, made real", never a generic textbook artifact.
function seedBlock(
  paragraph: string,
  band: Band,
  problem?: ProblemSeed,
  quotes: string[] = [],
): string {
  const who = BAND_LABEL[band];

  const problemPart = problem?.statement
    ? `— THE EXACT PROBLEM they reasoned about (use ITS objects and numbers everywhere; never swap in a generic substitute):
"${problem.statement}"${problem.korean ? `\n(Korean version: "${problem.korean}")` : ""}${problem.topic ? `\n(Topic: ${problem.topic})` : ""}`
    : `— The exact problem text isn't available; reconstruct the situation faithfully from the reasoning below and stay 100% consistent with its objects and numbers.`;

  const quotesPart = quotes.length
    ? `\n— THE STUDENT'S OWN LINES from the conversation (verbatim; quote at least one back where it lands hardest):
${quotes.map((q) => `· "${q}"`).join("\n")}`
    : "";

  return `=== THE STUDENT & THE SEED ===
A ${who} student just spent 5 minutes reasoning about one math problem — in English, in their own words. What you build must grow from THEIR thinking, not from a textbook.

${problemPart}

— THEIR REASONING, distilled (this is the DNA of everything you make):
"${paragraph}"${quotesPart}

THE GOLDEN RULE: within the first 10 seconds of seeing your output, the student must feel "this was built from MY problem and MY thinking." Use the problem's exact objects and numbers. Echo the student's own words at the emotional peak. Reward the reasoning they already showed — never lecture past it.`;
}

// Production-grade, format-specific briefs. Each one is written like a creative
// director's brief to a world-class builder: role, seed, spec, juice checklist,
// anti-slop guards, a self-review pass, and an exact output contract — so the
// AI's first reply is a finished, personal, genuinely impressive artifact.
function makerPrompt(
  paragraph: string,
  kind: MakerKind,
  band: Band,
  problem?: ProblemSeed,
  quotes: string[] = [],
): string {
  const who = BAND_LABEL[band];
  const note = BAND_NOTE[band];
  const seed = seedBlock(paragraph, band, problem, quotes);

  switch (kind) {
    case "game":
      return `You are a world-class educational game designer AND a senior front-end engineer. Your games have won awards because players learn by DOING — and because they feel like real arcade games, not worksheets. Treat this as a portfolio piece: your absolute best work.

${seed}

=== YOUR MISSION ===
Build a complete, polished, single-file browser game where this concept IS the core mechanic. The player manipulates the key quantities directly and SEES the consequence instantly — the relationship becomes something you can feel in your hands. Not a quiz. Not a slideshow. A game someone would play twice.

=== STRUCTURE (exactly this arc) ===
- TITLE SCREEN: game name (Korean, punchy), one-line "how to play", a START button — and this tagline, small but visible: "${quotes[0] ? `이 게임은 너의 이 생각에서 시작됐어 — "${quotes[0]}"` : "네 생각으로 설계된 게임"}".
- LEVEL 1 (warm-up): the same relationship with smaller/simpler numbers — one clear interaction, first "아하" within 20 seconds.
- LEVEL 2 (twist): same mechanic, one new nuance (a constraint, a second variable, a surprise case).
- FINAL LEVEL (the payoff): THE STUDENT'S EXACT PROBLEM${problem?.statement ? " — the very numbers and objects from the problem above" : ""}. Beating it = literally mastering the problem they just reasoned about.
- WIN SCREEN: celebrate, show the score, and quote the student's own line back as proof: "네가 말한 대로였어." Then a "다시 도전" button with a small twist on replay.

=== GAME FEEL (the juice checklist — do ALL of these) ===
- Every action gives instant visual feedback; dependent values ANIMATE (tween ~200–400ms), never jump.
- A satisfying success burst: particles or a scale-pop + a score count-up. A subtle shake on failure (≤150ms).
- Hover/press states on everything clickable; large touch targets (≥48px); the whole game one-thumb playable on a phone.
- Tiny WebAudio "blip" sounds for actions and a short win jingle (synthesized in code, NO audio files) with a visible 🔇/🔊 mute toggle. If audio would compromise reliability, ship without it rather than ship broken.
- Smooth 60fps: use requestAnimationFrame for motion, CSS transitions for UI.

=== ART DIRECTION (pick ONE and commit) ===
Either (a) dark arcade: deep navy/black, ONE neon accent, glowing numbers — or (b) warm paper: cream background, ONE bold accent, chunky rounded cards. Big readable numbers, generous spacing, custom-styled buttons (nothing browser-default), consistent border-radius. It must look designed, not generated.

=== AUDIENCE & LANGUAGE ===
- Player: a ${who} student. ${note}
- ALL on-screen text in natural Korean at that level — title, instructions, feedback, buttons. One short line per instruction.

=== TECHNICAL CONTRACT ===
- ONE self-contained .html file: inline <style> + <script>, vanilla JS only. ZERO external libraries, CDNs, fonts, or images — draw everything with HTML/CSS/Canvas.
- Must run by double-clicking the file (file:// safe: no modules, no fetch). Works with BOTH touch and mouse. No console errors.
- Clean, commented code; readable variable names.

=== ANTI-SLOP (instant disqualifiers) ===
- No walls of explanatory text — teach through the interaction.
- No multiple-choice anything. No alert()/prompt(). No English UI text. No placeholder art "TODO". No truncated code.
- Do NOT write a generic game about the topic — it must be THIS problem's objects and numbers.

=== BEFORE YOU CODE (think, then build) ===
In 2–3 Korean lines: name the ONE mechanic that makes this relationship *felt* (e.g., for "3× heavier", a seesaw you load until it balances — the player feels multiplication as leverage). Why will the player smile? Then build the complete game.

=== SELF-REVIEW (do this silently before answering) ===
Re-read your finished code top to bottom and fix: Does the final level use the EXACT problem numbers? Does the student's quoted line appear? Any overlapping text on a 375px-wide screen? Any console errors? Only then output.

=== OUTPUT (follow exactly) ===
1) 3 Korean lines: 게임 이름 · 이 게임이 가르치는 한 가지 · 조작법 한 줄.
2) The COMPLETE html in one fenced code block — nothing omitted.
3) 2 Korean lines: the exact "아하" moment, and the win-screen line that quotes the student.
4) "이렇게 시켜보세요" — 3 short Korean follow-up commands the student could send you next to make the game even better (e.g. "콤보 점수를 넣어줘", "보스 레벨 추가해줘", "내 이름을 게임에 넣어줘").

Take your time. Completeness over brevity — and make it genuinely FUN.`;

    case "video":
      return `You are a top-tier educational content director. Your 60-second explainers go viral because they make one hard idea feel obvious — and a little emotional. You write scripts so concrete that a student can film them TODAY with a phone, paper, and a marker. Treat this as a portfolio piece.

${seed}

=== YOUR MISSION ===
Write a complete, production-ready 60-second vertical (9:16) short-form script where THE STUDENT'S OWN REASONING is the storyline. The viewer should end thinking "어? 나도 이렇게 생각할 수 있는데?" — and the student who made it should feel like the author, because they are.

=== THE NARRATIVE SPINE (use these exact beats) ===
- 0:00–0:03 HOOK — open on THE problem itself${problem?.statement ? " (its real objects and numbers)" : ""} with a surprising question or bold claim. No greetings, no "오늘은 ~에 대해".
- 0:03–0:12 SETUP — make the situation concrete with ONE everyday analogy a ${who} student already knows. State what we're trying to figure out.
- 0:12–0:40 BUILD — walk the reasoning in the SAME order the student discovered it (their paragraph above is your outline). Show the relationship visibly changing. Raise one "그런데 만약…?" tension.
- 0:40–0:52 REVEAL — the "오~!" moment. Here, quote the student's own line ON SCREEN as a caption${quotes[0] ? ` — use this exact line: "${quotes[0]}"` : ""} and let the narration land it: "이건 한 학생이 실제로 한 생각이에요."
- 0:52–1:00 PAYOFF — one-line takeaway + a warm nudge: "너라면 어떻게 생각했을 것 같아?"

=== DELIVERABLE 1 — SHOT TABLE ===
| 시간 | 화면 (비주얼·모션·자막) | 내레이션 (한국어) | — 8–12 rows.
Every visual must be makeable two ways: (a) phone + paper + marker, or (b) simple motion graphics (bold numbers, arrows, shapes, captions). Note the on-screen CAPTION text exactly where it appears. One visible change every 3–5 seconds.

=== DELIVERABLE 2 — READ-ALOUD VO SCRIPT ===
After the table, write the full narration as ONE continuous block with [0:00]-style time markers — exactly what the student reads into the mic, timed to ~60 seconds at a natural pace (≈140–160 words). Warm, energetic, short sentences. Explain any term the instant it appears.

=== DELIVERABLE 3 — PACKAGING ===
- 3 title options (Korean, ≤30 chars, curiosity-first).
- 1 thumbnail concept: the text on it (≤8 chars) + the single image.
- The first comment the creator should pin (one line that invites replies).

=== QUALITY BAR ===
- Write TWO candidate hooks first, pick the stronger, say why in one line.
- The analogy must come from a ${who} student's daily life. ${note}
- The viewer must be able to re-explain the idea in one sentence afterward — write that sentence as the final takeaway.

=== ANTI-SLOP ===
- No lecture-style opening; the first 3 seconds decide everything.
- No jargon without an instant concrete anchor. No visuals a ${who} student couldn't sketch. No fake statistics.

=== OUTPUT (follow exactly) ===
1) The two hooks + your pick (one-line reason).
2) The shot table.
3) The timed read-aloud VO block.
4) Packaging (titles · thumbnail · pinned comment).
5) "이렇게 시켜보세요" — 3 short Korean follow-up commands the student could send you next (e.g. "더 웃기게 바꿔줘", "30초 버전으로 줄여줘", "인트로를 더 세게").

Care and completeness over brevity — make it genuinely film-able today.`;

    case "quiz":
      return `You are a master assessment designer AND a senior front-end engineer. Your quizzes are famous for two things: wrong answers that pinpoint EXACTLY where thinking slipped, and an interface so clean it feels like a premium app. Treat this as a portfolio piece.

${seed}

=== YOUR MISSION ===
Build a complete, single-file interactive QUIZ APP (not a text quiz!) that takes a ${who} student from "이거 대충 알아" to "이제 완전히 알겠어" — built entirely around THEIR concept and THEIR problem.

=== THE 5-QUESTION LADDER (exactly this design) ===
- Q1 WARM-UP: recognize the relationship in its simplest form — confidence builder.
- Q2 APPLY: same relationship, fresh but similar numbers.
- Q3 THE TRAP: the single most common misconception for THIS concept appears as the most tempting choice. (Decide that misconception FIRST; design the item around it.)
- Q4 TRANSFER: the relationship hiding in a real situation a ${who} student actually cares about.
- Q5 THE TWIST: take THE STUDENT'S EXACT PROBLEM${problem?.statement ? " (the very numbers above)" : ""} and change ONE thing — "만약 ~라면?" — forcing them to reason about the relationship itself, not recall the answer.

=== ITEM RULES ===
- Every question tests REASONING — answerable in ≤60s with thinking, not computation.
- 4 choices each. EVERY wrong choice encodes a SPECIFIC, nameable misunderstanding — never a random number.
- Scenarios feel like real life, not "철수가 사과 3개" filler. ${note}

=== APP EXPERIENCE (this is where the wow lives) ===
- START SCREEN: quiz title (Korean), "5문제 · 정답보다 '왜'가 중요한 퀴즈", a START button — and small: "${quotes[0] ? `한 학생의 생각에서 출발한 퀴즈 — "${quotes[0]}"` : "네 생각에서 출발한 퀴즈"}".
- ONE question at a time, progress dots (●●○○○), no timer (thinking is the point).
- Tap a choice → INSTANT feedback: the choice flips green/red with a soft animation, and a 1–2 line Korean explanation appears — for wrong answers it NAMES the misconception ("아, 이건 '평균은 항상 한가운데'라는 함정이에요"), for right answers it adds one NEW insight, never just "정답!".
- "다음" button appears after feedback. Smooth slide transition between questions.
- RESULT SCREEN: score with a count-up, then — the signature — a "사고 지도": for each missed question, one line saying where the thinking slipped and one line on how to see it correctly. If all correct: "이 개념, 이제 네 거야." End by quoting the student's own reasoning line back${quotes[0] ? `: "${quotes[0]}"` : ""} with "이 생각, 계속 키워가."
- "다시 풀기" reshuffles choice order.

=== DESIGN ===
Premium-clean: calm background, ONE accent color, big readable type, generous spacing, rounded cards, custom buttons (no browser defaults), subtle transitions everywhere. Mobile-first (375px), large touch targets, works desktop too.

=== TECHNICAL CONTRACT ===
- ONE self-contained .html file: inline <style> + <script>, vanilla JS only. ZERO external anything. Runs by double-click (file:// safe). No console errors. Clean, commented code.

=== ANTI-SLOP ===
- No random-number distractors. No "다음 중 옳은 것은?" without a scenario. No English UI. No alert(). No truncated code. The quiz must be about THIS problem's world — not the topic in general.

=== SELF-REVIEW (silently, before answering) ===
Check: Does Q5 use the exact problem with one changed condition? Does every wrong choice map to a named misconception in its feedback? Does the result screen's 사고 지도 actually reference the player's specific wrong answers? Fix, then output.

=== OUTPUT (follow exactly) ===
1) 2 Korean lines: 퀴즈 제목 · Q3이 노리는 핵심 오개념 한 줄.
2) The COMPLETE html in one fenced code block — nothing omitted.
3) "이렇게 시켜보세요" — 3 short Korean follow-up commands (e.g. "문제를 7개로 늘려줘", "틀린 문제만 다시 나오게 해줘", "친구랑 대결 모드 만들어줘").

Rigorous, kind, and genuinely illuminating — and it must FEEL like an app, not a worksheet.`;
  }
}

// The student-facing payoff: their 5-minute chat, distilled into one English
// paragraph that IS a prompt — then one tap turns it into a game / video / quiz
// in a real AI tool. The revelation: your conversation was prompt-engineering.
export function PromptStudio({
  coaching,
  evidence,
  level,
  problem,
  onDetail,
}: {
  coaching: Coaching;
  evidence: EvidenceByConstruct;
  level?: string;
  problem?: ProblemSeed;
  onDetail?: () => void;
}) {
  const { paragraph } = buildRecap(coaching, evidence);
  const band = levelBand(level);
  const quotes = studentQuotes(evidence);
  const [draft, setDraft] = useState("");
  const [active, setActive] = useState<MakerKind | null>(null);
  const [copied, setCopied] = useState(false);

  const pct = traceMatchPercent(draft, paragraph);
  const prompt = active ? makerPrompt(paragraph, active, band, problem, quotes) : "";

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
        <p className="mt-1 font-kr text-[12.5px] leading-relaxed text-ink/55 break-keep">
          버튼 하나면, 방금 그 문제와 당신의 생각이 그대로 들어간 진짜 AI 결과물이 나옵니다.
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
                onClick={copy}
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
