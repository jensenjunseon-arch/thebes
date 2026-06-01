"use client";

import { useEffect, useRef, useState } from "react";

// Easing functions.
// expo-out: starts fast, decelerates exponentially — the most refined feel for
// a number "landing". Identical to CSS ease (but controllable in rAF).
function easeOutExpo(p: number): number {
  return p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
}
// Smooth cubic ease-out for the odometer roll (smaller numbers).
function easeOutCubic(p: number): number {
  return 1 - Math.pow(1 - p, 3);
}

export function CountUp({
  end,
  prefix = "",
  suffix = "",
  // "expo"  — fast then graceful deceleration (savings headline)
  // "cubic" — smooth roll (small numbers like +17pt)
  easing = "expo",
  duration = 1800,
  className,
}: {
  end: number;
  prefix?: string;
  suffix?: string;
  easing?: "expo" | "cubic";
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setN(end);
      return;
    }

    const ease = easing === "expo" ? easeOutExpo : easeOutCubic;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return;
        started.current = true;
        const start = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          if (p < 1) {
            setN(Math.round(ease(p) * end));
            requestAnimationFrame(step);
          } else {
            setN(end);
          }
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [end, easing, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <span className="tabular-nums">{n.toLocaleString()}</span>
      {suffix}
    </span>
  );
}
