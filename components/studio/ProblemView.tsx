"use client";

// The English problem, made explorable:
// - hover/tap a sentence → its Korean appears in the strip below (+ accent wash)
// - key terms are dotted-underlined → hover for the gloss, click to star into 내 단어장
// - 🔊 reads the sentence aloud (SpeechSynthesis), 원문 toggle shows the Korean
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { MathText } from "@/components/studio/MathText";
import type { ProblemPack } from "@/lib/studio/types";

function speak(text: string) {
  try {
    const clean = text.replace(/\$[^$]*\$/g, " ");
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "en-US";
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  } catch {
    /* unsupported — button is harmless */
  }
}

export function ProblemView({ pack }: { pack: ProblemPack }) {
  const [activeSent, setActiveSent] = useState<number | null>(null);
  const [showKorean, setShowKorean] = useState(false);
  const [starred, setStarred] = useState<Set<string>>(new Set());

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const starredTerms = useMemo(
    () => pack.vocab.filter((v) => starred.has(v.en.trim().toLowerCase())),
    [pack.vocab, starred],
  );

  function toggleTerm(enLower: string) {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(enLower)) next.delete(enLower);
      else next.add(enLower);
      return next;
    });
  }

  return (
    <section className="rounded-3xl border border-ink/10 bg-paper p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-accent-soft/70 px-2.5 py-1 font-kr text-[11px] font-semibold text-accent">
          {pack.topic}
        </span>
        <span className="rounded-full border border-ink/12 px-2.5 py-1 font-kr text-[11px] text-ink/55">
          {pack.level}
        </span>
        <button
          type="button"
          onClick={() => speak(pack.english)}
          className="ml-auto rounded-full border border-ink/12 px-2.5 py-1 font-kr text-[11px] text-ink/55 transition hover:border-accent/50 hover:text-accent"
          aria-label="전체 듣기"
        >
          🔊 전체 듣기
        </button>
        <button
          type="button"
          onClick={() => setShowKorean((v) => !v)}
          className={cn(
            "rounded-full border px-2.5 py-1 font-kr text-[11px] transition",
            showKorean
              ? "border-accent bg-accent-soft/60 text-accent"
              : "border-ink/12 text-ink/55 hover:border-accent/50",
          )}
        >
          원문 보기
        </button>
      </div>

      {/* English, sentence by sentence */}
      <p className="mt-4 font-sans text-[17px] leading-[1.85] text-ink">
        {pack.sentences.map((s, i) => (
          <span key={i}>
            <span
              className={cn(
                "cursor-pointer rounded-md decoration-accent/50 underline-offset-[6px] transition",
                activeSent === i && "bg-accent-soft/50 underline",
              )}
              onMouseEnter={() => setActiveSent(i)}
              onClick={() => setActiveSent(activeSent === i ? null : i)}
            >
              <MathText
                text={s.en}
                vocab={pack.vocab}
                starred={starred}
                onToggleTerm={toggleTerm}
              />
            </span>{" "}
          </span>
        ))}
      </p>

      {/* Translation strip */}
      <div
        className={cn(
          "mt-4 rounded-2xl border px-4 py-3 transition-colors",
          activeSent !== null
            ? "border-accent/30 bg-accent-soft/30"
            : "border-ink/8 bg-paper-2/60",
        )}
      >
        {activeSent !== null ? (
          <div className="flex items-start gap-2">
            <p className="flex-1 font-kr text-[13.5px] leading-relaxed text-ink/80 break-keep">
              {pack.sentences[activeSent]?.ko}
            </p>
            <button
              type="button"
              onClick={() => speak(pack.sentences[activeSent]?.en ?? "")}
              className="flex-none rounded-full border border-ink/12 px-2 py-0.5 text-[12px] text-ink/50 hover:border-accent/50"
              aria-label="이 문장 듣기"
            >
              🔊
            </button>
          </div>
        ) : (
          <p className="font-kr text-[12.5px] text-ink/45 break-keep">
            문장에 마우스를 올리면(또는 탭하면) 한국어 해석이 여기 나타나요. 점선 단어는 핵심
            어휘 — 클릭하면 단어장에 담겨요.
          </p>
        )}
      </div>

      {/* My vocab */}
      {starredTerms.length > 0 && (
        <div className="mt-3">
          <p className="font-kr text-[12px] font-semibold text-ink/55">내 단어장</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {starredTerms.map((v) => (
              <button
                key={v.en}
                type="button"
                onClick={() => toggleTerm(v.en.trim().toLowerCase())}
                className="group rounded-full border border-accent/40 bg-accent-soft/40 px-3 py-1.5 font-sans text-[12.5px] text-ink transition hover:border-accent"
                title="클릭해서 빼기"
              >
                {v.en} <span className="font-kr text-ink/55">· {v.ko}</span>
                <span className="ml-1 text-ink/30 group-hover:text-accent">✕</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Korean original */}
      {showKorean && (
        <div className="mt-3 rounded-2xl border border-ink/8 bg-paper-2/60 px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-tighter2 text-ink/35">
            원문 · Korean
          </p>
          <p className="mt-1 font-kr text-[14px] leading-relaxed text-ink/75 break-keep">
            {pack.korean}
          </p>
        </div>
      )}
    </section>
  );
}
