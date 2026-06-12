"use client";

// The reading-the-problem moment, made delightful: an Apple-style 3D card that
// tilts toward your cursor (or finger), with a specular glare that tracks the
// pointer and parallax glow blobs drifting the opposite way. When no pointer
// moves (phones at rest), it breathes on its own.

import { useEffect, useRef, useState } from "react";

function BrandArch() {
  return (
    <svg width="44" height="44" viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M6 28 V14 a10 10 0 0 1 20 0 V28"
        stroke="#1F1F1F"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M11 28 V18 a5 5 0 0 1 10 0 V28"
        stroke="#0B57D0"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="11" r="1.6" fill="#0B57D0" />
    </svg>
  );
}

export function TiltLoader({ status, sub }: { status: string; sub?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  // rx/ry = card rotation; gx/gy = glare position (%); idle = no recent pointer
  const [t, setT] = useState({ rx: -6, ry: 8, gx: 65, gy: 30 });
  const [idle, setIdle] = useState(true);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const host = hostRef.current;
      if (!host) return;
      const r = host.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      // Normalize against the viewport so the card answers the cursor anywhere.
      const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2)));
      const ny = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2)));
      setT({
        rx: ny * -12,
        ry: nx * 14,
        gx: 50 + nx * 38,
        gy: 50 + ny * 38,
      });
      setIdle(false);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setIdle(true), 1800);
    }
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="relative grid place-items-center"
      style={{ perspective: "1000px" }}
    >
      {/* parallax glow blobs — drift opposite the tilt */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-24 transition-transform duration-300 ease-out"
        style={{ transform: `translate(${t.ry * -2.2}px, ${t.rx * 2.2}px)` }}
      >
        <div className="absolute left-1/2 top-1/2 h-[280px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-soft/70 blur-3xl" />
        <div className="absolute left-[58%] top-[44%] h-[200px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E9DEFB]/60 blur-3xl" />
      </div>

      {/* the card */}
      <div
        className={
          "relative w-[320px] max-w-[86vw] rounded-[28px] border border-ink/8 bg-white/80 px-7 py-8 shadow-[0_30px_80px_-20px_rgba(31,35,40,0.25)] backdrop-blur-xl transition-transform duration-200 ease-out" +
          (idle ? " animate-[tiltIdle_5s_ease-in-out_infinite]" : "")
        }
        style={{
          transform: `rotateX(${t.rx}deg) rotateY(${t.ry}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* specular glare follows the cursor */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[28px] transition-[background] duration-200"
          style={{
            background: `radial-gradient(300px circle at ${t.gx}% ${t.gy}%, rgba(255,255,255,0.85), rgba(255,255,255,0) 55%)`,
          }}
        />
        {/* floating layers */}
        <div style={{ transform: "translateZ(46px)" }} className="relative">
          <BrandArch />
        </div>
        <p
          className="relative mt-5 font-kr text-[16px] font-semibold text-ink"
          style={{ transform: "translateZ(30px)" }}
        >
          {status}
        </p>
        <p
          className="relative mt-1.5 font-kr text-[12.5px] leading-relaxed text-ink/50 break-keep"
          style={{ transform: "translateZ(18px)" }}
        >
          {sub ?? "보통 10초 안에 끝나요 — 커서를 움직여 보세요"}
        </p>
        <div
          className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-paper-2"
          style={{ transform: "translateZ(12px)" }}
        >
          <div className="h-full w-1/3 animate-[loaderSlide_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-[#4285F4] via-[#9B72CB] to-[#D96570]" />
        </div>
      </div>
    </div>
  );
}
