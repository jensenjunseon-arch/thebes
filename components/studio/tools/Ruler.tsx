"use client";

// Floating ruler — drag the body to move, drag the ● handle to rotate.
// A manipulative for lining up against the figure; ticks every "cm".

import { useRef, useState } from "react";
import { useDrag } from "@/lib/studio/useDrag";

const LEN = 300; // px ≙ 15 "cm"
const CM = LEN / 15;

export function Ruler({ onClose }: { onClose: () => void }) {
  const { pos, z, bringToFront, dragHandlers } = useDrag({
    x: 40,
    y: typeof window !== "undefined" ? window.innerHeight - 220 : 300,
  });
  const [angle, setAngle] = useState(0);
  const rotating = useRef<{ cx: number; cy: number } | null>(null);

  function rotStart(e: React.PointerEvent) {
    e.stopPropagation();
    const host = (e.currentTarget as HTMLElement).closest("[data-ruler]") as HTMLElement;
    const r = host.getBoundingClientRect();
    rotating.current = { cx: r.left + 14, cy: r.top + r.height / 2 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function rotMove(e: React.PointerEvent) {
    if (!rotating.current) return;
    const { cx, cy } = rotating.current;
    setAngle((Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI);
  }

  return (
    <div
      data-ruler
      className="fixed select-none"
      style={{
        left: pos.x,
        top: pos.y,
        zIndex: z,
        transform: `rotate(${angle}deg)`,
        transformOrigin: "14px 50%",
      }}
      onPointerDown={bringToFront}
    >
      <div
        className="relative h-[58px] cursor-grab touch-none rounded-lg border border-ink/25 bg-[#f7edc9]/95 shadow-xl backdrop-blur active:cursor-grabbing"
        style={{ width: LEN + 28 }}
        {...dragHandlers}
      >
        {/* ticks */}
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i}>
            <div
              className="absolute top-0 w-px bg-ink/70"
              style={{ left: 14 + i * CM, height: i % 5 === 0 ? 16 : 10 }}
            />
            {i % 1 === 0 && (
              <span
                className="absolute top-[18px] -translate-x-1/2 font-mono text-[9px] text-ink/60"
                style={{ left: 14 + i * CM }}
              >
                {i}
              </span>
            )}
          </div>
        ))}
        {/* half ticks */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`h${i}`}
            className="absolute top-0 h-[6px] w-px bg-ink/40"
            style={{ left: 14 + i * CM + CM / 2 }}
          />
        ))}
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 font-kr text-[9.5px] tracking-widest text-ink/45">
          THEBES · cm
        </span>
        <span className="absolute bottom-1 right-9 font-mono text-[9px] tabular-nums text-ink/50">
          {Math.round(((angle % 360) + 360) % 360)}°
        </span>

        {/* rotate handle */}
        <button
          type="button"
          aria-label="회전"
          className="absolute -right-2.5 top-1/2 h-6 w-6 -translate-y-1/2 cursor-alias touch-none rounded-full border-2 border-accent bg-paper shadow"
          onPointerDown={rotStart}
          onPointerMove={rotMove}
          onPointerUp={() => (rotating.current = null)}
        />
        {/* close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute -left-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] text-on-dark shadow hover:bg-accent"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
