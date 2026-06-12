"use client";

// Floating protractor — a semicircle with 10° ticks and ONE draggable arm.
// The readout shows the arm's angle; drag the body anywhere over the figure.

import { useRef, useState } from "react";
import { useDrag } from "@/lib/studio/useDrag";

const R = 110;

export function Protractor({ onClose }: { onClose: () => void }) {
  const { pos, z, bringToFront, dragHandlers } = useDrag({
    x: typeof window !== "undefined" ? window.innerWidth / 2 - R : 120,
    y: typeof window !== "undefined" ? window.innerHeight - 320 : 240,
  });
  const [arm, setArm] = useState(50);
  const hostRef = useRef<HTMLDivElement>(null);
  const turning = useRef(false);

  function armMove(e: React.PointerEvent) {
    if (!turning.current || !hostRef.current) return;
    const r = hostRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height - 14;
    let a = (Math.atan2(cy - e.clientY, e.clientX - cx) * 180) / Math.PI;
    a = Math.max(0, Math.min(180, a));
    setArm(a);
  }

  const rad = (arm * Math.PI) / 180;
  const ax = R + (R - 26) * Math.cos(rad);
  const ay = R + 14 - (R - 26) * Math.sin(rad);

  return (
    <div
      ref={hostRef}
      className="fixed select-none"
      style={{ left: pos.x, top: pos.y, zIndex: z }}
      onPointerDown={bringToFront}
    >
      <div
        className="relative cursor-grab touch-none active:cursor-grabbing"
        style={{ width: R * 2, height: R + 28 }}
        {...dragHandlers}
      >
        <svg width={R * 2} height={R + 28} className="drop-shadow-xl">
          {/* body */}
          <path
            d={`M 10 ${R + 14} A ${R - 10} ${R - 10} 0 0 1 ${R * 2 - 10} ${R + 14} Z`}
            fill="rgba(240,244,249,0.94)"
            stroke="#1F1F1F"
            strokeWidth="1.5"
          />
          {/* ticks every 10° + labels every 30° */}
          {Array.from({ length: 19 }).map((_, i) => {
            const a = (i * 10 * Math.PI) / 180;
            const x1 = R + (R - 12) * Math.cos(a);
            const y1 = R + 14 - (R - 12) * Math.sin(a);
            const x2 = R + (R - (i % 3 === 0 ? 28 : 20)) * Math.cos(a);
            const y2 = R + 14 - (R - (i % 3 === 0 ? 28 : 20)) * Math.sin(a);
            const lx = R + (R - 40) * Math.cos(a);
            const ly = R + 14 - (R - 40) * Math.sin(a);
            return (
              <g key={i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1F1F1F" strokeWidth={i % 3 === 0 ? 1.4 : 0.8} />
                {i % 3 === 0 && (
                  <text x={lx} y={ly + 3} fontSize="10" textAnchor="middle" fill="#474B4F" fontFamily="monospace">
                    {i * 10}
                  </text>
                )}
              </g>
            );
          })}
          {/* baseline + center */}
          <line x1={14} y1={R + 14} x2={R * 2 - 14} y2={R + 14} stroke="#1F1F1F" strokeWidth="1.2" />
          <circle cx={R} cy={R + 14} r="3" fill="#0B57D0" />
          {/* arm */}
          <line x1={R} y1={R + 14} x2={ax} y2={ay} stroke="#0B57D0" strokeWidth="2.2" strokeLinecap="round" />
          {/* readout */}
          <text x={R} y={R - 18} fontSize="20" fontWeight="700" textAnchor="middle" fill="#0B57D0" fontFamily="monospace">
            {Math.round(arm)}°
          </text>
        </svg>

        {/* arm handle */}
        <button
          type="button"
          aria-label="각도 조절"
          className="absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-alias touch-none rounded-full border-2 border-accent bg-paper shadow"
          style={{ left: ax, top: ay }}
          onPointerDown={(e) => {
            e.stopPropagation();
            turning.current = true;
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={armMove}
          onPointerUp={() => (turning.current = false)}
        />
        {/* close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] text-on-dark shadow hover:bg-accent"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
