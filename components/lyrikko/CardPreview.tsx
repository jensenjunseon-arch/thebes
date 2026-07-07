"use client";

// Preview + save overlay for one collectible word card. Mobile web has no
// reliable programmatic "save to camera roll" — long-press-to-save (iOS) and
// the download icon (Android Chrome) both work off a plain <img>/<a download>,
// so we just show the image full-size and offer an explicit download link as
// a fallback for desktop.

import { useState } from "react";
import { cardImageUrl, type CardSource } from "@/lib/lyrikko/cardUrl";

export function CardPreview({ word, onClose }: { word: CardSource; onClose: () => void }) {
  const [format, setFormat] = useState<"card" | "story">("card");
  const src = cardImageUrl(word, format);
  const filename = `lyrikko-${word.term.replace(/[^a-z0-9가-힣]+/gi, "-").toLowerCase()}-${format}.png`;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4"
      role="dialog"
      aria-modal
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-sm flex-col items-center rounded-3xl bg-paper p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between">
          <div className="inline-flex rounded-full border border-ink/10 bg-paper-2 p-1 font-kr text-xs">
            {(["card", "story"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`rounded-full px-3 py-1.5 transition ${
                  format === f ? "bg-paper text-ink shadow-sm" : "text-ink/50 hover:text-ink"
                }`}
              >
                {f === "card" ? "카드" : "스토리용"}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="font-kr text-sm text-ink/45 hover:text-ink">
            닫기
          </button>
        </div>

        <div className="mt-4 max-h-[65vh] overflow-auto rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={`${word.term} 단어 카드`}
            className="mx-auto block max-w-full rounded-2xl"
          />
        </div>

        <p className="mt-3 text-center font-kr text-xs text-ink/45">
          이미지를 길게 눌러 저장하거나, 아래 버튼으로 다운로드하세요.
        </p>
        <a
          href={src}
          download={filename}
          className="mt-3 w-full rounded-xl bg-accent py-2.5 text-center font-kr text-sm font-medium text-on-dark transition hover:bg-accent/90"
        >
          다운로드
        </a>
      </div>
    </div>
  );
}
