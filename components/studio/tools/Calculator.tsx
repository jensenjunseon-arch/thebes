"use client";

// Floating calculator — safe recursive-descent parser (no eval), keyboard-free
// tap UI, drag anywhere by the header.

import { useState } from "react";
import { useDrag } from "@/lib/studio/useDrag";
import { cn } from "@/lib/cn";

// expr := term (("+"|"-") term)* ; term := factor (("×"|"÷") factor)* ;
// factor := "-" factor | number | "(" expr ")" ; "√(" sugar → sqrt(expr)
function evaluate(src: string): number {
  let i = 0;
  const s = src.replace(/\s+/g, "");

  function expr(): number {
    let v = term();
    while (s[i] === "+" || s[i] === "-") {
      const op = s[i++];
      const r = term();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }
  function term(): number {
    let v = factor();
    while (s[i] === "×" || s[i] === "÷") {
      const op = s[i++];
      const r = factor();
      v = op === "×" ? v * r : v / r;
    }
    return v;
  }
  function factor(): number {
    if (s[i] === "-") {
      i++;
      return -factor();
    }
    if (s[i] === "√") {
      i++;
      return Math.sqrt(factor());
    }
    if (s[i] === "(") {
      i++;
      const v = expr();
      if (s[i] === ")") i++;
      return v;
    }
    const m = /^\d*\.?\d+/.exec(s.slice(i));
    if (!m) throw new Error("parse");
    i += m[0].length;
    return parseFloat(m[0]);
  }

  const v = expr();
  if (i !== s.length || !Number.isFinite(v)) throw new Error("parse");
  return v;
}

const KEYS = [
  ["C", "(", ")", "⌫"],
  ["7", "8", "9", "÷"],
  ["4", "5", "6", "×"],
  ["1", "2", "3", "-"],
  ["0", ".", "√", "+"],
] as const;

export function Calculator({ onClose }: { onClose: () => void }) {
  const { pos, z, bringToFront, dragHandlers } = useDrag({
    x: typeof window !== "undefined" ? window.innerWidth - 260 : 60,
    y: 120,
  });
  const [line, setLine] = useState("");
  const [out, setOut] = useState<string | null>(null);

  function press(k: string) {
    if (k === "C") {
      setLine("");
      setOut(null);
    } else if (k === "⌫") {
      setLine((l) => l.slice(0, -1));
      setOut(null);
    } else {
      setLine((l) => (out !== null && /[\d.]/.test(k) ? k : l + k));
      setOut(null);
    }
  }

  function equals() {
    try {
      const v = evaluate(line);
      const rounded = Math.round(v * 1e9) / 1e9;
      setOut(String(rounded));
    } catch {
      setOut("오류");
    }
  }

  return (
    <div
      className="fixed w-[224px] select-none rounded-2xl border border-ink/15 bg-paper shadow-2xl"
      style={{ left: pos.x, top: pos.y, zIndex: z }}
      onPointerDown={bringToFront}
    >
      <div
        className="flex cursor-grab touch-none items-center rounded-t-2xl bg-ink px-3 py-2 active:cursor-grabbing"
        {...dragHandlers}
      >
        <span className="font-kr text-[12px] font-semibold text-on-dark">계산기</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto grid h-5 w-5 place-items-center rounded-full text-[11px] text-on-dark/60 hover:bg-on-dark/10 hover:text-on-dark"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>
      <div className="px-3 pt-3">
        <div className="rounded-xl bg-paper-2/80 px-3 py-2 text-right">
          <div className="min-h-[18px] break-all font-mono text-[13px] text-ink/70">
            {line || "0"}
          </div>
          <div className="min-h-[22px] font-mono text-[17px] font-semibold text-accent">
            {out ?? " "}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1.5 p-3">
        {KEYS.flat().map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => press(k)}
            className={cn(
              "rounded-lg py-2 font-mono text-[14px] transition active:scale-95",
              /[÷×\-+√()]/.test(k)
                ? "bg-accent-soft/60 text-accent hover:bg-accent-soft"
                : k === "C" || k === "⌫"
                  ? "bg-ink/8 text-ink/60 hover:bg-ink/15"
                  : "bg-paper-2 text-ink hover:bg-ink/8",
            )}
          >
            {k}
          </button>
        ))}
        <button
          type="button"
          onClick={equals}
          className="col-span-4 rounded-lg bg-ink py-2 font-mono text-[15px] font-semibold text-on-dark transition hover:bg-accent active:scale-[0.98]"
        >
          =
        </button>
      </div>
    </div>
  );
}
