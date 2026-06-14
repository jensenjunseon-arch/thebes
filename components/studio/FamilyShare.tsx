"use client";

// "부모님께 보여주기" — the family bridge. The student finished a session; here
// they pick the language spoken at home and generate a warm one-page digest for
// their parent (what I studied, how I thought, two things to talk about), with
// read-aloud in that language. One link to send home. Built especially for
// multicultural families where a language gap can keep a parent from following
// their child's school life — but offered to everyone, no labels.

import { useState } from "react";
import { cn } from "@/lib/cn";
import { HOME_LANGS, homeLang } from "@/lib/studio/homeLang";
import { buildFamilyDigestHtml, type FamilyDigest } from "@/lib/studio/familyDigest";
import type { ProblemPack } from "@/lib/studio/types";

type Phase =
  | { s: "idle" }
  | { s: "working" }
  | { s: "error" }
  | { s: "done"; slug: string };

export function FamilyShare({
  pack,
  paragraph,
  lines,
  quotes,
  playUrl,
}: {
  pack: ProblemPack;
  paragraph: string;
  lines: string[];
  quotes: string[];
  playUrl?: string;
}) {
  const [open, setOpen] = useState(false);
  const [langCode, setLangCode] = useState("vi");
  const [phase, setPhase] = useState<Phase>({ s: "idle" });
  const [copied, setCopied] = useState(false);

  const lang = homeLang(langCode);
  const url =
    phase.s === "done"
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/family/${phase.slug}`
      : "";

  async function generate() {
    setPhase({ s: "working" });
    setCopied(false);
    try {
      // 1) translate/summarize the session into the home language
      const res = await fetch("/api/studio/family-digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang: langCode,
          english: pack.english,
          korean: pack.korean,
          topic: pack.topic,
          level: pack.level,
          paragraph,
          lines,
          quotes,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const { digest } = (await res.json()) as { digest: FamilyDigest };

      // 2) assemble the self-contained page (with read-aloud) from a safe template
      const html = buildFamilyDigestHtml(digest, lang, {
        topic: pack.topic,
        level: pack.level,
        playUrl,
      });

      // 3) publish it as a shareable artifact
      const share = await fetch("/api/studio/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "family",
          content: html,
          title: digest.heading,
          topic: pack.topic,
          level: pack.level,
        }),
      });
      if (!share.ok) throw new Error(String(share.status));
      const { slug } = (await share.json()) as { slug: string };
      setPhase({ s: "done", slug });
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/family/${slug}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2600);
      } catch {
        /* link field is selectable */
      }
    } catch {
      setPhase({ s: "error" });
    }
  }

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-ink/12 bg-paper">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <span className="flex items-center gap-2.5">
          <span className="text-[17px]">🏡</span>
          <span>
            <span className="block font-kr text-[13.5px] font-semibold text-ink/85">
              부모님께 보여주기
            </span>
            <span className="mt-0.5 block font-kr text-[11.5px] leading-snug text-ink/50 break-keep">
              오늘 공부를 부모님 언어로 — 무엇을 배웠는지, 어떻게 생각했는지
            </span>
          </span>
        </span>
        <span className="font-mono text-[12px] text-ink/40">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="border-t border-ink/8 px-4 py-4">
          {phase.s !== "done" && (
            <>
              <p className="font-kr text-[12px] font-semibold text-ink/65">
                집에서 쓰는 언어를 골라요
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {HOME_LANGS.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLangCode(l.code)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[12.5px] transition",
                      langCode === l.code
                        ? "border-accent bg-accent text-on-dark"
                        : "border-ink/15 bg-paper text-ink/65 hover:border-accent/50",
                    )}
                  >
                    <span className="font-medium">{l.native}</span>
                    <span
                      className={cn(
                        "ml-1.5 font-kr text-[11px]",
                        langCode === l.code ? "text-on-dark/70" : "text-ink/40",
                      )}
                    >
                      {l.ko}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={phase.s === "working"}
                onClick={() => void generate()}
                className="mt-3.5 w-full rounded-2xl bg-ink py-3 font-kr text-[14px] font-semibold text-on-dark transition hover:bg-accent disabled:opacity-60"
              >
                {phase.s === "working"
                  ? `${lang.native} 리포트를 만드는 중…`
                  : `🏡 ${lang.ko}로 리포트 만들기`}
              </button>
              <p className="mt-2 font-kr text-[11px] leading-relaxed text-ink/45 break-keep">
                부모님이 링크를 열면 — {lang.native}로 읽고, 버튼을 누르면 소리로도 들려줘요.
                부모님과 함께 이야기할 질문 2개도 들어가요.
              </p>
              {phase.s === "error" && (
                <p className="mt-2 font-kr text-[12px] text-accent break-keep">
                  리포트를 만들지 못했어요 — 잠시 후 다시 시도해 주세요.
                </p>
              )}
            </>
          )}

          {phase.s === "done" && (
            <div>
              <p className="font-kr text-[13px] font-semibold text-ink/80 break-keep">
                {copied
                  ? "링크가 복사됐어요 — 부모님께 보내드리세요!"
                  : `${lang.native} 리포트가 준비됐어요`}
              </p>
              <div className="mt-2 flex gap-2">
                <input
                  readOnly
                  value={url}
                  onFocus={(e) => e.currentTarget.select()}
                  className="h-9 w-full flex-1 rounded-xl border border-ink/12 bg-paper px-3 font-mono text-[12px] text-ink/75 outline-none"
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(url);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2600);
                    } catch {
                      /* selectable */
                    }
                  }}
                  className="h-9 flex-none rounded-xl bg-ink px-3.5 font-kr text-[12px] font-semibold text-on-dark transition hover:bg-accent"
                >
                  복사
                </button>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-ink/15 px-3.5 py-2 font-kr text-[12.5px] font-medium text-ink/70 transition hover:border-accent/60 hover:text-accent"
                >
                  미리보기 →
                </a>
                <button
                  type="button"
                  onClick={() => setPhase({ s: "idle" })}
                  className="rounded-xl border border-ink/15 px-3.5 py-2 font-kr text-[12.5px] font-medium text-ink/70 transition hover:border-accent/60 hover:text-accent"
                >
                  다른 언어로 ↺
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
