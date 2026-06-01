"use client";

import { useEffect, useRef, useState } from "react";

const ITEMS = [
  "미국 여름캠프 한 달 · 약 1,100만원",
  "유럽 어학연수 한 달 · 약 630만원",
  "4인 가족 동남아 두 달 · 약 1,000만원",
];

export function TravelAlternatives() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="examples" ref={ref}>
      {ITEMS.map((item, i) => (
        <span
          key={item}
          style={{
            opacity: shown ? 1 : 0,
            transform: shown ? "none" : "translateY(10px)",
            transition: `opacity .5s cubic-bezier(.22,1,.36,1) ${i * 140}ms, transform .5s cubic-bezier(.22,1,.36,1) ${i * 140}ms`,
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
