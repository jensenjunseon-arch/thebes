"use client";

// Renders the video maker's markdown deliverable (title → hooks → shot table →
// timed VO → packaging) as a clean script document instead of raw markdown.
// A tiny purpose-built parser — headings, bold, tables, blockquotes, lists, hr.

import { Fragment, type ReactNode } from "react";

// Inline **bold** → <strong>; everything else passes through.
function inline(text: string, keyBase: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyBase}-${i}`} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={`${keyBase}-${i}`}>{part}</Fragment>;
  });
}

function cell(s: string): string {
  return s.trim().replace(/^\*\*|\*\*$/g, "");
}

export function VideoScript({ md }: { md: string }) {
  const lines = md.replace(/\r/g, "").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();

    // blank
    if (!t) {
      i++;
      continue;
    }

    // horizontal rule
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(t)) {
      blocks.push(<hr key={i} className="my-4 border-ink/10" />);
      i++;
      continue;
    }

    // markdown table — gather consecutive pipe rows
    if (t.startsWith("|") && t.includes("|", 1)) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = lines[i]
          .trim()
          .replace(/^\||\|$/g, "")
          .split("|")
          .map(cell);
        // skip the |---|---| separator row
        if (!cells.every((c) => /^:?-{2,}:?$/.test(c.replace(/\s/g, "")) || c === "")) {
          rows.push(cells);
        }
        i++;
      }
      if (rows.length) {
        const [head, ...body] = rows;
        blocks.push(
          <div key={`tbl-${i}`} className="my-3 overflow-x-auto">
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr>
                  {head.map((h, ci) => (
                    <th
                      key={ci}
                      className="border-b border-ink/15 px-2.5 py-2 text-left font-kr font-semibold text-ink/80"
                    >
                      {inline(h, `th-${ci}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((r, ri) => (
                  <tr key={ri} className="align-top">
                    {r.map((c, ci) => (
                      <td
                        key={ci}
                        className="border-b border-ink/8 px-2.5 py-2 font-kr leading-relaxed text-ink/75 break-keep"
                      >
                        {inline(c, `td-${ri}-${ci}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
      }
      continue;
    }

    // headings
    const h = /^(#{1,4})\s+(.*)$/.exec(t);
    if (h) {
      const level = h[1].length;
      const cls =
        level <= 1
          ? "mt-5 mb-1.5 font-kr text-[18px] font-bold text-ink"
          : level === 2
            ? "mt-4 mb-1 font-kr text-[15px] font-bold text-ink/90"
            : "mt-3 mb-1 font-kr text-[13px] font-semibold text-accent";
      blocks.push(
        <p key={i} className={cls}>
          {inline(h[2], `h-${i}`)}
        </p>,
      );
      i++;
      continue;
    }

    // blockquote
    if (t.startsWith(">")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quote.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote
          key={`bq-${i}`}
          className="my-2.5 border-l-2 border-accent/50 bg-accent-soft/25 px-3.5 py-2 font-kr text-[13px] italic leading-relaxed text-ink/80 break-keep"
        >
          {inline(quote.join(" "), `bq-${i}`)}
        </blockquote>,
      );
      continue;
    }

    // list
    if (/^[-*]\s+/.test(t) || /^\d+\.\s+/.test(t)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        items.push(lines[i].trim().replace(/^([-*]|\d+\.)\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="my-2 list-disc space-y-1 pl-5">
          {items.map((it, li) => (
            <li
              key={li}
              className="font-kr text-[13px] leading-relaxed text-ink/80 break-keep"
            >
              {inline(it, `li-${i}-${li}`)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    // paragraph
    blocks.push(
      <p key={i} className="my-1.5 font-kr text-[13px] leading-relaxed text-ink/80 break-keep">
        {inline(t, `p-${i}`)}
      </p>,
    );
    i++;
  }

  return <div className="px-5 py-4">{blocks}</div>;
}
