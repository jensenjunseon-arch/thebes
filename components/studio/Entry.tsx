"use client";

// The Gemini-style entry: one centered greeting, one bar. Drop/paste/browse a
// photo of a Korean math problem, paste its text, or generate a fresh one.

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const LEVELS = ["초등 저학년", "초등 고학년", "중1", "중2", "중3", "고1", "고2", "고3"];
const TOPICS = ["랜덤", "속력", "비율", "확률", "방정식", "함수", "도형·넓이", "입체도형", "각도"];

export interface EntrySubmit {
  image?: string; // dataUrl (already downscaled)
  text?: string;
  generate?: { level: string; topic: string };
}

// Downscale to ≤1568px long edge, JPEG — keeps vision quality, shrinks upload.
async function downscale(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const MAX = 1568;
    const scale = Math.min(1, MAX / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "늦은 밤에도 멋진데요";
  if (h < 12) return "좋은 아침이에요";
  if (h < 18) return "오늘의 문제,";
  return "오늘 마지막 문제,";
}

export function Entry({
  onSubmit,
  busy,
}: {
  onSubmit: (s: EntrySubmit) => void;
  busy: boolean;
}) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [level, setLevel] = useState("중2");
  const [topic, setTopic] = useState("랜덤");
  const fileRef = useRef<HTMLInputElement>(null);

  const takeFile = useCallback(async (f: File | undefined | null) => {
    if (!f || !f.type.startsWith("image/")) return;
    setImage(await downscale(f));
    setGenOpen(false);
  }, []);

  function submit() {
    if (busy) return;
    if (image) onSubmit({ image });
    else if (text.trim().length >= 8) onSubmit({ text: text.trim() });
  }

  const canGo = !busy && (image !== null || text.trim().length >= 8);

  return (
    <div
      className="relative mx-auto flex min-h-[calc(100dvh-64px)] w-full max-w-3xl flex-col items-center justify-center px-5 pb-24"
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        void takeFile(e.dataTransfer.files?.[0]);
      }}
      onPaste={(e) => {
        const item = Array.from(e.clipboardData.items).find((i) =>
          i.type.startsWith("image/"),
        );
        if (item) void takeFile(item.getAsFile());
      }}
    >
      {/* soft radial glow, Gemini-ish but in brand */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[420px] w-[680px] max-w-[92vw] rounded-full bg-accent-soft/45 blur-3xl" />
      </div>

      <h1 className="relative z-10 text-center font-kr text-[clamp(26px,5vw,40px)] font-bold leading-tight tracking-tighter2 text-ink break-keep">
        {greeting()} <span className="text-accent">영어로</span> 풀어볼까요?
      </h1>
      <p className="relative z-10 mt-3 text-center font-kr text-[14.5px] leading-relaxed text-ink/55 break-keep">
        수학 문제 사진을 올리면 — 읽고, 영어로 바꾸고, 한 줄씩 풀이까지 함께해요.
      </p>

      {/* The bar */}
      <div
        className={cn(
          "relative z-10 mt-8 w-full rounded-[28px] border bg-paper shadow-[0_8px_40px_rgba(28,24,20,0.08)] transition",
          dragOver ? "border-accent ring-4 ring-accent-soft" : "border-ink/12",
        )}
      >
        {image && (
          <div className="flex items-center gap-3 px-5 pt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt="업로드한 문제"
              className="h-14 w-14 rounded-xl border border-ink/10 object-cover"
            />
            <span className="font-kr text-[12.5px] text-ink/60">문제 사진 준비 완료</span>
            <button
              type="button"
              onClick={() => setImage(null)}
              className="ml-auto rounded-full border border-ink/15 px-2.5 py-1 font-kr text-[11px] text-ink/50 hover:border-accent/50 hover:text-ink"
            >
              ✕ 지우기
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 p-3 pl-4">
          <button
            type="button"
            aria-label="문제 사진 올리기"
            onClick={() => fileRef.current?.click()}
            className="grid h-11 w-11 flex-none place-items-center rounded-full border border-ink/15 text-[20px] text-ink/60 transition hover:border-accent/60 hover:text-accent"
          >
            +
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => void takeFile(e.target.files?.[0])}
          />

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={image ? "사진만으로 충분해요 — 바로 시작!" : "또는 문제를 그대로 붙여넣기…"}
            rows={1}
            className="max-h-32 min-h-[44px] w-full flex-1 resize-none self-center bg-transparent py-2.5 font-kr text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink/35"
          />

          <button
            type="button"
            onClick={() => setGenOpen((v) => !v)}
            className={cn(
              "h-11 flex-none rounded-full border px-3.5 font-kr text-[13px] font-medium transition",
              genOpen
                ? "border-accent bg-accent-soft/60 text-accent"
                : "border-ink/15 text-ink/60 hover:border-accent/60 hover:text-accent",
            )}
          >
            ✨ 문제 만들기
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={!canGo}
            aria-label="시작"
            className={cn(
              "grid h-11 w-11 flex-none place-items-center rounded-full text-[18px] transition",
              canGo
                ? "bg-ink text-on-dark hover:bg-accent"
                : "bg-ink/8 text-ink/25",
            )}
          >
            →
          </button>
        </div>

        {/* Generator panel */}
        {genOpen && (
          <div className="border-t border-ink/8 px-5 py-4">
            <p className="font-kr text-[12px] font-semibold text-ink/55">학년</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 font-kr text-[12.5px] transition",
                    level === l
                      ? "border-accent bg-accent text-on-dark"
                      : "border-ink/15 text-ink/60 hover:border-accent/50",
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
            <p className="mt-3 font-kr text-[12px] font-semibold text-ink/55">주제</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopic(t)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 font-kr text-[12.5px] transition",
                    topic === t
                      ? "border-accent bg-accent text-on-dark"
                      : "border-ink/15 text-ink/60 hover:border-accent/50",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => onSubmit({ generate: { level, topic } })}
              className="mt-4 w-full rounded-2xl bg-ink py-3 font-kr text-[14px] font-semibold text-on-dark transition hover:bg-accent disabled:opacity-40"
            >
              {level} · {topic} 문제 만들기 ✨
            </button>
          </div>
        )}
      </div>

      <p className="relative z-10 mt-4 font-kr text-[12px] text-ink/40 break-keep">
        드래그해서 놓기 · 붙여넣기(⌘V) · 카메라 촬영 모두 돼요
      </p>
    </div>
  );
}
