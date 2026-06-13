"use client";

// The scroll system behind the Apple-style landing: elements fade+rise as they
// enter the viewport, giant headlines rise line by line, stats count up.
//
// Deliberately NOT IntersectionObserver-based: background/headless tabs can
// throttle IO callbacks indefinitely, leaving content permanently invisible.
// A passive scroll listener + rAF visibility check works everywhere, costs
// almost nothing at this element count, and respects prefers-reduced-motion.

import {
  createElement,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

// Fires `true` once the element's top clears the bottom ~8% of the viewport
// (or any part of it is on screen). Detaches after the first reveal.
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }

    let done = false;

    // Called directly from the (passive, browser-coalesced) scroll handler —
    // deliberately NOT rAF-deferred: throttled tabs freeze rAF, and a frozen
    // reveal means invisible content. A rect read per tick is cheap.
    function check() {
      if (done || !el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.top < vh * 0.92 && r.bottom > 0) {
        done = true;
        setInView(true);
        window.removeEventListener("scroll", check);
        window.removeEventListener("resize", check);
      }
    }

    check(); // above-the-fold content reveals on load
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  return { ref, inView };
}

// Fade + rise on enter. `delay` staggers siblings (ms).
export function Reveal({
  children,
  delay = 0,
  as = "div",
  className,
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
}) {
  const { ref, inView } = useReveal<HTMLElement>();
  return createElement(
    as,
    {
      ref,
      className: `lp-reveal${inView ? " is-in" : ""}${className ? ` ${className}` : ""}`,
      style: { transitionDelay: `${delay}ms` },
    },
    children,
  );
}

// Giant headline that rises line by line. Renders as nested <span>s so it can
// live inside an <h1>/<h2> without invalid nesting.
export function LineRise({
  lines,
  className,
}: {
  lines: ReactNode[];
  className?: string;
}) {
  const { ref, inView } = useReveal<HTMLSpanElement>();
  return (
    <span ref={ref} className={className} style={{ display: "block" }}>
      {lines.map((line, i) => (
        <span key={i} className="lp-line-mask">
          <span
            className={`lp-line${inView ? " is-in" : ""}`}
            style={{ transitionDelay: `${i * 110}ms` }}
          >
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}

// Number that counts up when it enters view (for the big colored stats).
export function StatCount({
  end,
  prefix = "",
  suffix = "",
  duration = 1600,
  className,
}: {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const { ref, inView } = useReveal<HTMLSpanElement>();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setV(Math.round(end * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // rAF can be frozen in throttled tabs — guarantee the final value lands.
    const settle = setTimeout(() => setV(end), duration + 80);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [inView, end, duration]);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {v.toLocaleString()}
      {suffix}
    </span>
  );
}
