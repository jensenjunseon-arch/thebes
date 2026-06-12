// The AI-maker prompt engine — shared by the diagnostic result (PromptStudio)
// and the Studio payoff. Given the student's English paragraph, their exact
// problem, and their own verbatim lines, it produces production-grade briefs
// that turn a real AI tool (Claude/ChatGPT) into a personal artifact factory:
// a playable game, a filmable 60s script, or an interactive quiz app.
//
// The wow contract: within 10 seconds of seeing the output, the student must
// feel "this was built from MY problem and MY thinking."

export type MakerKind = "game" | "video" | "quiz";
export type Band = "elementary" | "middle" | "high";

export const MAKERS: { kind: MakerKind; label: string; hint: string }[] = [
  { kind: "game", label: "게임으로 만들기", hint: "방금 그 문제가 최종 레벨이 되는 아케이드 게임" },
  { kind: "video", label: "영상 풀이로 만들기", hint: "내 생각이 대본이 되는 60초 숏폼 스크립트" },
  { kind: "quiz", label: "퀴즈 앱으로 만들기", hint: "오답이 '왜 틀렸는지' 짚어주는 인터랙티브 퀴즈" },
];

// Follow-up commands we teach the student to send AFTER the AI delivers —
// turning a so-so first result into agency ("I can direct this thing").
export const ITERATE_CHIPS = ["더 화려하게 만들어줘", "한 단계 더 어렵게", "효과음도 넣어줘"];

// 초등 저학년/고학년 → elementary, 중1~3 → middle, 고1~3 → high. Check 초등 first
// so "초등 고학년" isn't mistaken for high.
export function levelBand(level?: string): Band {
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
//
// output: "chat" = pasted into ChatGPT/Claude (pitch lines + fenced code +
// follow-up commands). "app" = consumed by our /api/studio/make pipe — the
// reply IS the artifact (raw HTML / clean markdown), nothing else.
export function makerPrompt(
  paragraph: string,
  kind: MakerKind,
  band: Band,
  problem?: ProblemSeed,
  quotes: string[] = [],
  output: "chat" | "app" = "chat",
): string {
  const who = BAND_LABEL[band];
  const note = BAND_NOTE[band];
  const seed = seedBlock(paragraph, band, problem, quotes);

  const HTML_APP_OUTPUT = `=== OUTPUT (follow exactly) ===
Your ENTIRE reply must be the complete HTML document itself — starting with <!DOCTYPE html> and ending with </html>. NO markdown fences, NO commentary, NO pitch lines before or after. The host app renders your reply directly inside a sandboxed iframe, so anything that isn't HTML breaks the experience.

Take your time. Completeness over brevity.`;

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

${
  output === "app"
    ? HTML_APP_OUTPUT
    : `=== OUTPUT (follow exactly) ===
1) 3 Korean lines: 게임 이름 · 이 게임이 가르치는 한 가지 · 조작법 한 줄.
2) The COMPLETE html in one fenced code block — nothing omitted.
3) 2 Korean lines: the exact "아하" moment, and the win-screen line that quotes the student.
4) "이렇게 시켜보세요" — 3 short Korean follow-up commands the student could send you next to make the game even better (e.g. "콤보 점수를 넣어줘", "보스 레벨 추가해줘", "내 이름을 게임에 넣어줘").

Take your time. Completeness over brevity — and make it genuinely FUN.`
}`;

    case "video":
      return `You are a top-tier educational content director. Your 60-second explainers go viral because they make one hard idea feel obvious — and a little emotional. You write scripts so concrete that a student can film them TODAY with a phone, paper, and a marker. Treat this as a portfolio piece.

${seed}

=== YOUR MISSION ===
Write a complete, production-ready 60-second vertical (9:16) short-form script where THE STUDENT'S OWN REASONING is the storyline. The viewer should end thinking "어? 나도 이렇게 생각할 수 있는데?" — and the student who made it should feel like the author, because they are.

=== THE NARRATIVE SPINE (use these exact beats) ===
- 0:00–0:03 HOOK — open on THE problem itself${"" /* keep generic when statement missing */} with a surprising question or bold claim. No greetings, no "오늘은 ~에 대해".
- 0:03–0:12 SETUP — make the situation concrete with ONE everyday analogy a ${who} student already knows. State what we're trying to figure out.
- 0:12–0:40 BUILD — walk the reasoning in the SAME order the student discovered it (their paragraph above is your outline). Show the relationship visibly changing. Raise one "그런데 만약…?" tension.
- 0:40–0:52 REVEAL — the "오~!" moment. Here, quote the student's own line ON SCREEN as a caption${"" /* quote injected below when available */} and let the narration land it: "이건 한 학생이 실제로 한 생각이에요."
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
${quotes[0] ? `- The REVEAL caption must be this exact line: "${quotes[0]}"` : ""}

=== ANTI-SLOP ===
- No lecture-style opening; the first 3 seconds decide everything.
- No jargon without an instant concrete anchor. No visuals a ${who} student couldn't sketch. No fake statistics.

${
  output === "app"
    ? `=== OUTPUT (follow exactly) ===
Reply with the deliverables as clean, well-structured markdown — start DIRECTLY with the title (no preamble, no "Here is…"), in this order: 제목 → 두 후보 훅과 선택 이유 → 샷 테이블 → 타임코드 내레이션 블록 → 패키징(제목 3안 · 썸네일 · 고정 댓글). Korean throughout (English only where the script itself needs it).

Care and completeness over brevity — make it genuinely film-able today.`
    : `=== OUTPUT (follow exactly) ===
1) The two hooks + your pick (one-line reason).
2) The shot table.
3) The timed read-aloud VO block.
4) Packaging (titles · thumbnail · pinned comment).
5) "이렇게 시켜보세요" — 3 short Korean follow-up commands the student could send you next (e.g. "더 웃기게 바꿔줘", "30초 버전으로 줄여줘", "인트로를 더 세게").

Care and completeness over brevity — make it genuinely film-able today.`
}`;

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

${
  output === "app"
    ? HTML_APP_OUTPUT
    : `=== OUTPUT (follow exactly) ===
1) 2 Korean lines: 퀴즈 제목 · Q3이 노리는 핵심 오개념 한 줄.
2) The COMPLETE html in one fenced code block — nothing omitted.
3) "이렇게 시켜보세요" — 3 short Korean follow-up commands (e.g. "문제를 7개로 늘려줘", "틀린 문제만 다시 나오게 해줘", "친구랑 대결 모드 만들어줘").

Rigorous, kind, and genuinely illuminating — and it must FEEL like an app, not a worksheet.`
}`;
  }
}
