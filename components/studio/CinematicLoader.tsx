"use client";

// The reading-the-problem moment, Apple product-film style: a full-bleed stage
// where huge gradient blobs drift and morph (the liquid chapter-break feel),
// the status crossfades as GIANT typography, and the glassy 3D tilt card rides
// in the center following the cursor. Pure CSS keyframes + the TiltLoader.

import { useEffect, useState } from "react";
import { TiltLoader } from "@/components/studio/TiltLoader";

export function CinematicLoader({
  lines,
  sub,
}: {
  lines: string[]; // staged status lines, crossfaded as giant type
  sub?: string;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
    const t = setInterval(
      () => setIdx((i) => Math.min(i + 1, lines.length - 1)),
      2800,
    );
    return () => clearInterval(t);
  }, [lines]);

  return (
    <div className="cine">
      {/* drifting liquid blobs — full-bleed, slow, alive */}
      <div aria-hidden className="cine-blob b1" />
      <div aria-hidden className="cine-blob b2" />
      <div aria-hidden className="cine-blob b3" />
      <div aria-hidden className="cine-grain" />

      {/* giant crossfading status type */}
      <div className="cine-type" aria-live="polite">
        {lines.map((l, i) => (
          <p key={l} className={`cine-line${i === idx ? " on" : ""}`}>
            {l}
          </p>
        ))}
      </div>

      {/* the glassy tilt card rides below the type — brand + progress only */}
      <div className="cine-card">
        <TiltLoader
          status="Thebes Studio"
          sub={sub ?? "보통 10초 안에 끝나요"}
        />
      </div>
    </div>
  );
}
