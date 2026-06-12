"use client";

// Pointer-drag for floating tool widgets — unified mouse/touch via Pointer
// Events, with a shared z-counter so the last-touched tool floats on top.

import { useCallback, useRef, useState } from "react";

let zCounter = 60;

export function useDrag(initial: { x: number; y: number }) {
  const [pos, setPos] = useState(initial);
  const [z, setZ] = useState(() => ++zCounter);
  const start = useRef<{ px: number; py: number; x: number; y: number } | null>(null);

  const bringToFront = useCallback(() => setZ(++zCounter), []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      bringToFront();
      start.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [pos, bringToFront],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.px;
    const dy = e.clientY - start.current.py;
    setPos({
      x: Math.max(4, Math.min(window.innerWidth - 60, start.current.x + dx)),
      y: Math.max(4, Math.min(window.innerHeight - 60, start.current.y + dy)),
    });
  }, []);

  const onPointerUp = useCallback(() => {
    start.current = null;
  }, []);

  return { pos, z, bringToFront, dragHandlers: { onPointerDown, onPointerMove, onPointerUp } };
}
