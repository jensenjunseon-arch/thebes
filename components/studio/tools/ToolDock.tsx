"use client";

// The tool dock — three round buttons pinned bottom-right; each summons a
// floating, draggable instrument over the workspace.

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Calculator } from "@/components/studio/tools/Calculator";
import { Ruler } from "@/components/studio/tools/Ruler";
import { Protractor } from "@/components/studio/tools/Protractor";

const TOOLS = [
  { id: "calc", icon: "🧮", label: "계산기" },
  { id: "ruler", icon: "📏", label: "자" },
  { id: "protractor", icon: "📐", label: "각도기" },
] as const;

type ToolId = (typeof TOOLS)[number]["id"];

export function ToolDock() {
  const [open, setOpen] = useState<Record<ToolId, boolean>>({
    calc: false,
    ruler: false,
    protractor: false,
  });

  function toggle(id: ToolId) {
    setOpen((o) => ({ ...o, [id]: !o[id] }));
  }

  return (
    <>
      <div className="fixed bottom-5 right-4 z-50 flex flex-col gap-2">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => toggle(t.id)}
            className={cn(
              "group relative grid h-12 w-12 place-items-center rounded-full border text-[20px] shadow-lg transition active:scale-95",
              open[t.id]
                ? "border-accent bg-accent text-on-dark"
                : "border-ink/12 bg-paper hover:border-accent/60",
            )}
            aria-label={t.label}
          >
            {t.icon}
            <span className="pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 font-kr text-[11.5px] text-on-dark opacity-0 shadow transition-opacity group-hover:opacity-100">
              {t.label}
            </span>
          </button>
        ))}
      </div>

      {open.calc && <Calculator onClose={() => toggle("calc")} />}
      {open.ruler && <Ruler onClose={() => toggle("ruler")} />}
      {open.protractor && <Protractor onClose={() => toggle("protractor")} />}
    </>
  );
}
