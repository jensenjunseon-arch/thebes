"use client";

// The Apple floating buy-pill, translated: once the visitor scrolls past the
// hero, a compact pill rides the bottom of the screen — one tap to the studio.

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function FloatingCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function onScroll() {
      const past = window.scrollY > window.innerHeight * 0.85;
      const nearEnd =
        window.scrollY + window.innerHeight > document.body.scrollHeight - 700;
      setShow(past && !nearEnd);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={cn("lp-float-cta", show && "show")} aria-hidden={!show}>
      <span className="lp-float-note">
        무료 · 로그인 없이 <b>바로</b>
      </span>
      <Link href="/studio" className="lp-float-btn" tabIndex={show ? 0 : -1}>
        문제 올리고 시작 <span style={{ fontFamily: "var(--font-mono)" }}>→</span>
      </Link>
    </div>
  );
}
