"use client";

// The payoff: the student's plan lines come back as ONE clean English paragraph
// — then ONE TAP builds the artifact RIGHT HERE: the game/quiz streams in from
// the API and boots inside a sandboxed iframe; the video script renders as a
// document. Then the student DIRECTS the AI: "더 화려하게" → it rebuilds live.
// (The copy-into-ChatGPT/Claude path stays as a secondary option.)

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { traceMatchPercent } from "@/lib/recap";
import { MathText } from "@/components/studio/MathText";
import { TiltLoader } from "@/components/studio/TiltLoader";
import {
  MAKERS,
  ITERATE_CHIPS,
  levelBand,
  makerPrompt,
  type MakerKind,
} from "@/lib/makers";
import type { PlanLine, ProblemPack } from "@/lib/studio/types";

type MakeState =
  | { phase: "idle" }
  | { phase: "streaming"; chars: number }
  | { phase: "done"; artifact: string }
  | { phase: "error" };

type ShareState = null | "pending" | "error" | { slug: string };

// Best-effort display title for the share page.
function artifactTitle(kind: MakerKind, artifact: string): string | undefined {
  if (kind === "video") {
    const first = artifact
      .split("\n")
      .map((l) => l.replace(/^#+\s*/, "").trim())
      .find(Boolean);
    return first?.slice(0, 80);
  }
  const m = /<title[^>]*>([^<]+)<\/title>/i.exec(artifact);
  return m?.[1]?.trim().slice(0, 80);
}

// The model is told to return raw HTML — but if it fences anyway, unwrap.
function extractHtml(raw: string): string {
  const fence = /```(?:html)?\s*([\s\S]*?)```/.exec(raw);
  let s = fence ? fence[1] : raw;
  const doctype = s.indexOf("<!DOCTYPE");
  const start = doctype !== -1 ? doctype : s.indexOf("<html");
  if (start > 0) s = s.slice(start);
  const end = s.lastIndexOf("</html>");
  if (end !== -1) s = s.slice(0, end + "</html>".length);
  return s.trim();
}

function streamStatus(kind: MakerKind, chars: number): string {
  if (kind === "video") {
    return chars < 1200 ? "훅을 다듬는 중…" : chars < 3500 ? "장면을 짜는 중…" : "내레이션을 입히는 중…";
  }
  const what = kind === "game" ? "게임" : "퀴즈";
  if (chars < 2500) return `${what} 설계도를 그리는 중…`;
  if (chars < 9000) return kind === "game" ? "레벨을 짓는 중…" : "오답의 함정을 심는 중…";
  if (chars < 16000) return "디자인을 입히는 중…";
  return "마무리 광택을 내는 중…";
}

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
  const [showPromptPath, setShowPromptPath] = useState(false);
  const [make, setMake] = useState<Record<MakerKind, MakeState>>({
    game: { phase: "idle" },
    video: { phase: "idle" },
    quiz: { phase: "idle" },
  });
  const [reviseDraft, setReviseDraft] = useState("");
  const [shared, setShared] = useState<Record<MakerKind, ShareState>>({
    game: null,
    video: null,
    quiz: null,
  });
  const [linkCopied, setLinkCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
          body: JSON.stringify({ english: pack.english, level: pack.level, lines: realLines }),
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
      abortRef.current?.abort();
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
      ? makerPrompt(
          paragraph,
          active,
          levelBand(pack.level),
          { statement: pack.english, korean: pack.korean, topic: pack.topic },
          quotes,
        )
      : "";

  const activeState: MakeState = active ? make[active] : { phase: "idle" };

  function setKindState(kind: MakerKind, s: MakeState) {
    setMake((m) => ({ ...m, [kind]: s }));
  }

  // Build (or rebuild) the artifact in-app, streaming.
  async function build(kind: MakerKind, revise?: { artifact: string; instruction: string }) {
    if (!paragraph) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setKindState(kind, { phase: "streaming", chars: 0 });
    setReviseDraft("");

    try {
      const res = await fetch("/api/studio/make", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          kind,
          paragraph,
          level: pack.level,
          problem: { statement: pack.english, korean: pack.korean, topic: pack.topic },
          quotes,
          revise,
        }),
      });
      if (!res.ok || !res.body) throw new Error(String(res.status));

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setKindState(kind, { phase: "streaming", chars: text.length });
      }
      // All three artifacts are now self-contained HTML documents.
      const artifact = extractHtml(text);
      if (!artifact || !artifact.includes("</html>")) {
        throw new Error("incomplete");
      }
      setKindState(kind, { phase: "done", artifact });
      // A new build invalidates the previous share link for this kind.
      setShared((s) => ({ ...s, [kind]: null }));
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setKindState(kind, { phase: "idle" });
      } else {
        setKindState(kind, { phase: "error" });
      }
    }
  }

  // Give the artifact a public URL — the "내가 만든 게임 해봐" loop.
  async function shareArtifact(kind: MakerKind, artifact: string) {
    setShared((s) => ({ ...s, [kind]: "pending" }));
    setLinkCopied(false);
    try {
      const res = await fetch("/api/studio/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          content: artifact,
          title: artifactTitle(kind, artifact),
          topic: pack.topic,
          level: pack.level,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const { slug } = (await res.json()) as { slug: string };
      setShared((s) => ({ ...s, [kind]: { slug } }));
      // Auto-copy — the next move is pasting into 카톡.
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/play/${slug}`);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2600);
      } catch {
        /* the link field below is still selectable */
      }
    } catch {
      setShared((s) => ({ ...s, [kind]: "error" }));
    }
  }

  function download(kind: MakerKind, artifact: string) {
    const isVideo = kind === "video";
    const blob = new Blob([artifact], {
      type: isVideo ? "text/markdown;charset=utf-8" : "text/html;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `thebes-${kind}.${isVideo ? "md" : "html"}`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* selectable below */
    }
  }

  function openIn(tool: "chatgpt" | "claude") {
    void copyPrompt();
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
          <p className="font-sans text-[15px] leading-relaxed text-ink/85">
            <MathText text={paragraph} />
          </p>
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
          버튼 하나면 — 이 자리에서 바로, 방금 그 문제와 당신의 풀이로 만들어집니다.
        </p>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {MAKERS.map((m) => (
            <button
              key={m.kind}
              type="button"
              onClick={() => {
                setActive(m.kind);
                setCopied(false);
                setShowPromptPath(false);
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
          <div className="mt-3 space-y-3">
            {/* ── IN-APP build ── */}
            {activeState.phase === "idle" && (
              <button
                type="button"
                onClick={() => void build(active)}
                className="w-full rounded-2xl bg-ink py-3.5 font-kr text-[14.5px] font-semibold text-on-dark transition hover:bg-accent"
              >
                ✨ 이 자리에서 바로 만들기
              </button>
            )}

            {activeState.phase === "streaming" && (
              <div className="rounded-2xl border border-ink/10 bg-paper px-4 py-8">
                <TiltLoader
                  status={streamStatus(active, activeState.chars)}
                  sub={`${(activeState.chars / 1000).toFixed(1)}k자 작성됨 — 1~2분 걸려요`}
                />
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => abortRef.current?.abort()}
                    className="rounded-full border border-ink/15 px-4 py-1.5 font-kr text-[12px] text-ink/50 hover:border-accent/50 hover:text-accent"
                  >
                    중단
                  </button>
                </div>
              </div>
            )}

            {activeState.phase === "error" && (
              <div className="rounded-2xl border border-accent/40 bg-accent-soft/30 px-4 py-3.5">
                <p className="font-kr text-[13px] text-ink/70 break-keep">
                  만들다가 막혔어요. 한 번만 다시 시도해 주세요.
                </p>
                <button
                  type="button"
                  onClick={() => void build(active)}
                  className="mt-2 rounded-xl bg-ink px-4 py-2 font-kr text-[12.5px] font-semibold text-on-dark hover:bg-accent"
                >
                  다시 시도 ↺
                </button>
              </div>
            )}

            {activeState.phase === "done" && (
              <div className="overflow-hidden rounded-2xl border border-ink/12 bg-paper">
                <iframe
                  ref={iframeRef}
                  key={activeState.artifact.length}
                  srcDoc={activeState.artifact}
                  sandbox="allow-scripts"
                  title={
                    active === "game"
                      ? "내가 만든 게임"
                      : active === "quiz"
                        ? "내가 만든 퀴즈"
                        : "내가 만든 설명 영상"
                  }
                  className="h-[440px] w-full bg-white sm:h-[560px]"
                />

                <div className="flex flex-wrap items-center gap-2 border-t border-ink/8 px-4 py-3">
                  <button
                    type="button"
                    disabled={shared[active] === "pending"}
                    onClick={() => void shareArtifact(active, activeState.artifact)}
                    className="rounded-xl bg-accent px-3.5 py-2 font-kr text-[12.5px] font-semibold text-on-dark transition hover:bg-ink disabled:opacity-50"
                  >
                    {shared[active] === "pending" ? "링크 만드는 중…" : "🔗 친구에게 공유"}
                  </button>
                  <button
                    type="button"
                    onClick={() => iframeRef.current?.requestFullscreen?.()}
                    className="rounded-xl border border-ink/15 px-3.5 py-2 font-kr text-[12.5px] font-medium text-ink/70 transition hover:border-accent/60 hover:text-accent"
                  >
                    ⛶ 전체화면
                  </button>
                  <button
                    type="button"
                    onClick={() => download(active, activeState.artifact)}
                    className="rounded-xl border border-ink/15 px-3.5 py-2 font-kr text-[12.5px] font-medium text-ink/70 transition hover:border-accent/60 hover:text-accent"
                  >
                    ⬇ 저장
                  </button>
                  <button
                    type="button"
                    onClick={() => void build(active)}
                    className="rounded-xl border border-ink/15 px-3.5 py-2 font-kr text-[12.5px] font-medium text-ink/70 transition hover:border-accent/60 hover:text-accent"
                  >
                    ↺ 다시
                  </button>
                </div>

                {/* the share link, ready for 카톡 */}
                {typeof shared[active] === "object" && shared[active] !== null && (
                  <div className="border-t border-ink/8 bg-paper-2/50 px-4 py-3">
                    <p className="font-kr text-[12px] font-semibold text-ink/70">
                      {linkCopied ? "링크가 복사됐어요 — 카톡에 붙여넣기만 하면 끝!" : "공유 링크"}
                    </p>
                    <div className="mt-1.5 flex gap-2">
                      <input
                        readOnly
                        value={`${typeof window !== "undefined" ? window.location.origin : ""}/play/${(shared[active] as { slug: string }).slug}`}
                        onFocus={(e) => e.currentTarget.select()}
                        className="h-9 w-full flex-1 rounded-xl border border-ink/12 bg-paper px-3 font-mono text-[12px] text-ink/75 outline-none"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              `${window.location.origin}/play/${(shared[active] as { slug: string }).slug}`,
                            );
                            setLinkCopied(true);
                            setTimeout(() => setLinkCopied(false), 2600);
                          } catch {
                            /* field is selectable */
                          }
                        }}
                        className="h-9 flex-none rounded-xl bg-ink px-3.5 font-kr text-[12px] font-semibold text-on-dark transition hover:bg-accent"
                      >
                        복사
                      </button>
                    </div>
                    <p className="mt-1.5 font-kr text-[11.5px] leading-relaxed text-ink/45 break-keep">
                      링크를 연 친구도 바로 플레이할 수 있어요 — 그리고 자기 문제로 만들 수
                      있죠.
                    </p>
                  </div>
                )}
                {shared[active] === "error" && (
                  <div className="border-t border-ink/8 px-4 py-2.5">
                    <p className="font-kr text-[12px] text-ink/55 break-keep">
                      공유 링크를 만들지 못했어요 — 잠시 후 다시 시도해 주세요.
                    </p>
                  </div>
                )}

                {/* The real lesson: DIRECT the AI. */}
                <div className="border-t border-ink/8 bg-accent-soft/25 px-4 py-3.5">
                  <p className="font-kr text-[12.5px] font-semibold text-ink/70">
                    마음에 안 드는 곳이 있나요? AI에게 시켜보세요
                  </p>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={reviseDraft}
                      onChange={(e) => setReviseDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && reviseDraft.trim()) {
                          void build(active, {
                            artifact: activeState.artifact,
                            instruction: reviseDraft.trim(),
                          });
                        }
                      }}
                      placeholder="예: 배경을 우주로 바꿔줘"
                      className="h-10 w-full flex-1 rounded-xl border border-ink/15 bg-paper px-3.5 font-kr text-[13px] outline-none placeholder:text-ink/35 focus:border-accent"
                    />
                    <button
                      type="button"
                      disabled={!reviseDraft.trim()}
                      onClick={() =>
                        void build(active, {
                          artifact: activeState.artifact,
                          instruction: reviseDraft.trim(),
                        })
                      }
                      className="h-10 flex-none rounded-xl bg-accent px-4 font-kr text-[13px] font-semibold text-on-dark transition hover:bg-ink disabled:opacity-30"
                    >
                      시키기
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {ITERATE_CHIPS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() =>
                          void build(active, { artifact: activeState.artifact, instruction: c })
                        }
                        className="rounded-full border border-accent/30 bg-paper px-3 py-1.5 font-kr text-[11.5px] text-ink/60 transition hover:border-accent hover:text-accent"
                      >
                        &ldquo;{c}&rdquo;
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 font-kr text-[11.5px] leading-relaxed text-ink/45 break-keep">
                    AI에게 고치라고 시키는 것 — 그게 진짜 AI를 다루는 기술이에요.
                  </p>
                </div>
              </div>
            )}

            {/* ── Secondary: the prompt path (ChatGPT/Claude) ── */}
            <div>
              <button
                type="button"
                onClick={() => setShowPromptPath((v) => !v)}
                className="font-kr text-[12px] text-ink/45 underline-offset-4 hover:text-accent hover:underline"
              >
                {showPromptPath ? "프롬프트 직접 쓰기 접기 ▴" : "프롬프트를 복사해 ChatGPT·Claude에서 만들 수도 있어요 ▾"}
              </button>
              {showPromptPath && (
                <div className="mt-2 rounded-2xl border border-ink/12 bg-paper p-4">
                  <p className="font-mono text-[10px] uppercase tracking-tighter2 text-ink/40">
                    완성된 프롬프트
                  </p>
                  <textarea
                    readOnly
                    value={prompt}
                    rows={6}
                    onFocus={(e) => e.currentTarget.select()}
                    className="mt-2 w-full resize-none rounded-xl border border-ink/12 bg-paper-2 px-3 py-2.5 font-sans text-[12px] leading-relaxed text-ink/75 outline-none"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void copyPrompt()}
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
                </div>
              )}
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
