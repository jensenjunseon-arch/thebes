"use client";

import { useEffect, useRef, useState } from "react";

// Counts up to `end` when scrolled into view. `jitter` adds a slot-machine
// digit-shake that settles into the final value; without it, a clean odometer
// roll. Respects reduced-motion.
export function CountUp({
  end,
  prefix = "",
  suffix = "",
  jitter = false,
  duration = 1500,
  className,
}: {
  end: number;
  prefix?: string;
  suffix?: string;
  jitter?: boolean;
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

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return;
        started.current = true;
        const start = performance.now();
        const shake = Math.max(8, Math.round(end * 0.08));
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3); // ease-out
          if (p < 1) {
            let v = Math.round(eased * end);
            if (jitter) {
              // shrinking random shake on the trailing digits
              v = Math.max(0, v + Math.round((Math.random() - 0.5) * 2 * (1 - p) * shake));
            }
            setN(v);
            requestAnimationFrame(step);
          } else {
            setN(end);
          }
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [end, jitter, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <span className="tabular-nums">{n.toLocaleString()}</span>
      {suffix}
    </span>
  );
}
