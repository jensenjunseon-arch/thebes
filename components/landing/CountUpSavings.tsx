"use client";

import { useEffect, useRef, useState } from "react";

// Slot-machine count-up for the headline savings number. Runs once when it
// scrolls into view; respects reduced-motion.
export function CountUpSavings({
  target = 1701,
  className,
}: {
  target?: number;
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
      setN(target);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return;
        started.current = true;
        const duration = 1500;
        const start = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3); // ease-out
          setN(Math.round(eased * target));
          if (p < 1) requestAnimationFrame(step);
          else setN(target);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  return (
    <span ref={ref} className={className}>
      연간 <span className="tabular-nums">{n.toLocaleString()}</span>만원 절약
    </span>
  );
}
