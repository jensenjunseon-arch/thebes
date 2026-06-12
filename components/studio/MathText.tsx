"use client";

// Renders problem text: inline $...$ math via KaTeX, and vocab terms wrapped
// as hoverable/tappable glossary chips (hover → Korean tooltip, click → star).

import { useMemo, useState } from "react";
import katex from "katex";
import { cn } from "@/lib/cn";
import type { VocabTerm } from "@/lib/studio/types";

function Math({ tex }: { tex: string }) {
  const html = useMemo(
    () =>
      katex.renderToString(tex, {
        throwOnError: false,
        output: "html",
      }),
    [tex],
  );
  return <span className="katex-host" dangerouslySetInnerHTML={{ __html: html }} />;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Term({
  en,
  ko,
  starred,
  onToggle,
}: {
  en: string;
  ko: string;
  starred: boolean;
  onToggle: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className={cn(
        "group relative cursor-pointer rounded-[4px] px-[1px] underline decoration-dotted decoration-1 underline-offset-4 transition",
        starred
          ? "bg-accent-soft/70 decoration-accent text-ink"
          : "decoration-ink/35 hover:bg-accent-soft/50 hover:decoration-accent",
      )}
      onClick={(e) => {
        e.stopPropagation();
        setOpen((v) => !v);
        onToggle();
      }}
      onMouseLeave={() => setOpen(false)}
    >
      {en}
      <span
        className={cn(
          "pointer-events-none absolute -top-9 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 font-kr text-[12px] font-medium text-on-dark opacity-0 shadow-lg transition-opacity duration-100",
          "group-hover:opacity-100",
          open && "opacity-100",
        )}
      >
        {ko}
      </span>
    </span>
  );
}

export function MathText({
  text,
  vocab = [],
  starred,
  onToggleTerm,
  className,
}: {
  text: string;
  vocab?: VocabTerm[];
  starred?: Set<string>;
  onToggleTerm?: (en: string) => void;
  className?: string;
}) {
  // Longest term first so "average speed" wins over "speed".
  const termRe = useMemo(() => {
    const terms = vocab
      .map((v) => v.en.trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);
    if (!terms.length) return null;
    return new RegExp(`(${terms.map(escapeRe).join("|")})`, "gi");
  }, [vocab]);

  const koByLower = useMemo(() => {
    const m = new Map<string, string>();
    for (const v of vocab) m.set(v.en.trim().toLowerCase(), v.ko);
    return m;
  }, [vocab]);

  function renderPlain(seg: string, keyBase: number) {
    if (!termRe) return seg;
    const parts = seg.split(termRe);
    return parts.map((part, i) => {
      const ko = koByLower.get(part.toLowerCase());
      if (ko && i % 2 === 1) {
        return (
          <Term
            key={`${keyBase}-${i}`}
            en={part}
            ko={ko}
            starred={starred?.has(part.toLowerCase()) ?? false}
            onToggle={() => onToggleTerm?.(part.toLowerCase())}
          />
        );
      }
      return <span key={`${keyBase}-${i}`}>{part}</span>;
    });
  }

  // Split on $...$ (inline math). Even indices = plain text, odd = math.
  const chunks = text.split(/\$([^$]+)\$/g);

  return (
    <span className={className}>
      {chunks.map((chunk, i) =>
        i % 2 === 1 ? <Math key={i} tex={chunk} /> : <span key={i}>{renderPlain(chunk, i)}</span>,
      )}
    </span>
  );
}
