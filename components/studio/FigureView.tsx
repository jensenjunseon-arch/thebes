"use client";

// Interactive figure: 2D shapes (polygon/circle/angle) rendered as SVG you can
// grab and ROTATE; solids (cuboid/cylinder/cone/sphere) as a tiny wireframe
// 3D you can ORBIT. No libraries — math by hand, pointer events unified.

import { useEffect, useMemo, useRef, useState } from "react";
import type { FigureSpec, PolygonFigure, SolidFigure } from "@/lib/studio/types";

// ── 2D: rotate-on-drag ────────────────────────────────────────────────────────

function centroid(points: [number, number][]): [number, number] {
  const n = points.length;
  return [
    points.reduce((s, p) => s + p[0], 0) / n,
    points.reduce((s, p) => s + p[1], 0) / n,
  ];
}

function Flat({ figure }: { figure: Exclude<FigureSpec, SolidFigure> }) {
  const [rot, setRot] = useState(0);
  const drag = useRef<{ startX: number; startRot: number } | null>(null);

  const center: [number, number] =
    figure.kind === "polygon" ? centroid(figure.points) : [50, 50];

  function down(e: React.PointerEvent<SVGSVGElement>) {
    drag.current = { startX: e.clientX, startRot: rot };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e: React.PointerEvent<SVGSVGElement>) {
    if (!drag.current) return;
    setRot(drag.current.startRot + (e.clientX - drag.current.startX) * 0.8);
  }

  return (
    <div className="relative">
      <svg
        viewBox="-10 -10 120 120"
        className="mx-auto block h-[240px] w-full max-w-[340px] cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={() => (drag.current = null)}
      >
        <g transform={`rotate(${rot} ${center[0]} ${center[1]})`}>
          {figure.kind === "polygon" && <PolygonShape f={figure} />}
          {figure.kind === "circle" && (
            <>
              <circle
                cx="50"
                cy="50"
                r={figure.r}
                fill="rgba(181,65,27,0.08)"
                stroke="var(--ink, #1c1814)"
                strokeWidth="1.4"
              />
              <line
                x1="50"
                y1="50"
                x2={50 + figure.r}
                y2="50"
                stroke="#b5411b"
                strokeWidth="1.2"
                strokeDasharray="3 2"
              />
              <circle cx="50" cy="50" r="1.6" fill="#1c1814" />
              {figure.radiusLabel && (
                <text
                  x={50 + figure.r / 2}
                  y="46"
                  fontSize="6"
                  textAnchor="middle"
                  fill="#b5411b"
                  transform={`rotate(${-rot} ${50 + figure.r / 2} 46)`}
                >
                  {figure.radiusLabel}
                </text>
              )}
            </>
          )}
          {figure.kind === "angle" && <AngleShape deg={figure.deg} labels={figure.labels} rot={rot} />}
        </g>
      </svg>
      <RotateHint onReset={() => setRot(0)} />
    </div>
  );
}

function PolygonShape({ f }: { f: PolygonFigure }) {
  const d = f.points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";
  return (
    <>
      <path d={d} fill="rgba(181,65,27,0.08)" stroke="#1c1814" strokeWidth="1.4" strokeLinejoin="round" />
      {f.points.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="1.7" fill="#b5411b" />
          {f.labels?.[i] && (
            <text x={p[0]} y={p[1] - 3.5} fontSize="6.5" textAnchor="middle" fill="#1c1814" fontWeight="600">
              {f.labels[i]}
            </text>
          )}
        </g>
      ))}
      {f.sideLabels?.map((label, i) => {
        if (!label) return null;
        const a = f.points[i];
        const b = f.points[(i + 1) % f.points.length];
        return (
          <text
            key={`s${i}`}
            x={(a[0] + b[0]) / 2}
            y={(a[1] + b[1]) / 2 - 2.5}
            fontSize="5.5"
            textAnchor="middle"
            fill="#6b5d52"
          >
            {label}
          </text>
        );
      })}
    </>
  );
}

function AngleShape({ deg, labels, rot }: { deg: number; labels?: string[]; rot: number }) {
  const r = 34;
  const rad = (deg * Math.PI) / 180;
  const x2 = 50 + r * Math.cos(-rad);
  const y2 = 50 + r * Math.sin(-rad) + 20;
  const arc = `M ${50 + 12} ${70} A 12 12 0 ${deg > 180 ? 1 : 0} 0 ${50 + 12 * Math.cos(-rad)} ${70 + 12 * Math.sin(-rad)}`;
  return (
    <>
      <line x1="50" y1="70" x2={50 + r} y2="70" stroke="#1c1814" strokeWidth="1.4" />
      <line x1="50" y1="70" x2={x2} y2={y2 - 20 + 20} stroke="#1c1814" strokeWidth="1.4" />
      <path d={arc} fill="none" stroke="#b5411b" strokeWidth="1.3" />
      <text
        x={50 + 19 * Math.cos(-rad / 2)}
        y={70 + 19 * Math.sin(-rad / 2) + 2}
        fontSize="6.5"
        textAnchor="middle"
        fill="#b5411b"
        fontWeight="600"
        transform={`rotate(${-rot} ${50 + 19 * Math.cos(-rad / 2)} ${70 + 19 * Math.sin(-rad / 2)})`}
      >
        {deg}°
      </text>
      {labels?.[0] && (
        <text x="47" y="75" fontSize="6" textAnchor="end" fill="#1c1814" fontWeight="600">
          {labels[0]}
        </text>
      )}
    </>
  );
}

// ── 3D: orbit wireframe ───────────────────────────────────────────────────────

type V3 = [number, number, number];

function solidEdges(f: SolidFigure): { verts: V3[]; edges: [number, number][] } {
  const { solid, dims } = f;
  const w = dims.w ?? 2, h = dims.h ?? 2, d = dims.d ?? 2, r = dims.r ?? 1.2;

  if (solid === "cuboid") {
    const verts: V3[] = [];
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1])
      verts.push([(sx * w) / 2, (sy * h) / 2, (sz * d) / 2]);
    const edges: [number, number][] = [];
    for (let i = 0; i < 8; i++)
      for (let j = i + 1; j < 8; j++) {
        let diff = 0;
        for (let k = 0; k < 3; k++) if (verts[i][k] !== verts[j][k]) diff++;
        if (diff === 1) edges.push([i, j]);
      }
    return { verts, edges };
  }

  const SEG = 18;
  if (solid === "cylinder") {
    const verts: V3[] = [];
    for (const y of [-h / 2, h / 2])
      for (let i = 0; i < SEG; i++) {
        const a = (i / SEG) * Math.PI * 2;
        verts.push([r * Math.cos(a), y, r * Math.sin(a)]);
      }
    const edges: [number, number][] = [];
    for (let i = 0; i < SEG; i++) {
      edges.push([i, (i + 1) % SEG]);
      edges.push([SEG + i, SEG + ((i + 1) % SEG)]);
      if (i % 3 === 0) edges.push([i, SEG + i]);
    }
    return { verts, edges };
  }

  if (solid === "cone") {
    const verts: V3[] = [[0, -h / 2, 0]];
    for (let i = 0; i < SEG; i++) {
      const a = (i / SEG) * Math.PI * 2;
      verts.push([r * Math.cos(a), h / 2, r * Math.sin(a)]);
    }
    const edges: [number, number][] = [];
    for (let i = 1; i <= SEG; i++) {
      edges.push([i, (i % SEG) + 1]);
      if (i % 3 === 1) edges.push([0, i]);
    }
    return { verts, edges };
  }

  // sphere — lat rings + long ribs
  const verts: V3[] = [];
  const edges: [number, number][] = [];
  const LAT = 4, LON = 12;
  for (let la = 1; la < LAT; la++) {
    const phi = (la / LAT) * Math.PI;
    for (let lo = 0; lo < LON; lo++) {
      const th = (lo / LON) * Math.PI * 2;
      verts.push([r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th)]);
    }
  }
  for (let la = 0; la < LAT - 1; la++)
    for (let lo = 0; lo < LON; lo++) {
      const i = la * LON + lo;
      edges.push([i, la * LON + ((lo + 1) % LON)]);
      if (la < LAT - 2) edges.push([i, i + LON]);
    }
  return { verts, edges };
}

function Solid({ figure }: { figure: SolidFigure }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angles, setAngles] = useState({ yaw: 0.7, pitch: 0.45 });
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);
  const { verts, edges } = useMemo(() => solidEdges(figure), [figure]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth, H = 240;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const { yaw, pitch } = angles;
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const maxDim = Math.max(...verts.flat().map(Math.abs), 1);
    const scale = 88 / maxDim;

    const pts = verts.map(([x, y, z]) => {
      const x1 = x * cy + z * sy;
      const z1 = -x * sy + z * cy;
      const y2 = y * cp - z1 * sp;
      const z2 = y * sp + z1 * cp;
      const persp = 1 / (1 + z2 / (maxDim * 6));
      return [W / 2 + x1 * scale * persp, H / 2 + y2 * scale * persp] as [number, number];
    });

    ctx.strokeStyle = "#1c1814";
    ctx.lineWidth = 1.3;
    ctx.lineCap = "round";
    for (const [a, b] of edges) {
      ctx.beginPath();
      ctx.moveTo(pts[a][0], pts[a][1]);
      ctx.lineTo(pts[b][0], pts[b][1]);
      ctx.stroke();
    }
  }, [angles, verts, edges]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="block h-[240px] w-full cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, y: e.clientY, ...angles };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          setAngles({
            yaw: drag.current.yaw + (e.clientX - drag.current.x) * 0.01,
            pitch: Math.max(
              -1.4,
              Math.min(1.4, drag.current.pitch + (e.clientY - drag.current.y) * 0.01),
            ),
          });
        }}
        onPointerUp={() => (drag.current = null)}
      />
      {figure.dimLabels && figure.dimLabels.length > 0 && (
        <div className="mt-1 flex flex-wrap justify-center gap-1.5">
          {figure.dimLabels.map((l) => (
            <span
              key={l}
              className="rounded-full border border-ink/10 bg-paper-2/70 px-2.5 py-1 font-kr text-[11px] text-ink/60"
            >
              {l}
            </span>
          ))}
        </div>
      )}
      <RotateHint onReset={() => setAngles({ yaw: 0.7, pitch: 0.45 })} />
    </div>
  );
}

function RotateHint({ onReset }: { onReset: () => void }) {
  return (
    <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-1.5">
      <span className="rounded-full bg-ink/5 px-2.5 py-1 font-kr text-[10.5px] text-ink/45">
        드래그해서 돌려보세요
      </span>
      <button
        type="button"
        onClick={onReset}
        className="pointer-events-auto grid h-7 w-7 place-items-center rounded-full border border-ink/12 bg-paper text-[12px] text-ink/50 transition hover:border-accent/50 hover:text-accent"
        aria-label="원래대로"
      >
        ↺
      </button>
    </div>
  );
}

export function FigureView({ figure }: { figure: FigureSpec }) {
  return (
    <section className="rounded-3xl border border-ink/10 bg-paper p-4 shadow-sm">
      <p className="px-1 font-mono text-[10px] uppercase tracking-tighter2 text-ink/35">
        Figure · 도형
      </p>
      {figure.kind === "solid" ? <Solid figure={figure} /> : <Flat figure={figure} />}
    </section>
  );
}
