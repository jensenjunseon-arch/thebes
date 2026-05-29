import { CONSTRUCTS } from "@/lib/constructs";
import type { EvidenceRow } from "@/lib/supabase/queries";

interface Props {
  items: EvidenceRow[];
}

export function EvidenceSection({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      {items.map((item, idx) => {
        const construct = CONSTRUCTS.find((c) => c.id === item.construct);
        return (
          <article
            key={idx}
            className="rounded-2xl border border-ink/10 bg-paper p-4"
          >
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-tighter2 text-accent">
                {construct?.koreanName ?? item.construct}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-tighter2 text-ink/35">
                {new Date(item.createdAt).toLocaleDateString("ko-KR", {
                  month: "numeric",
                  day: "numeric",
                })}
              </span>
            </div>
            <blockquote className="mt-2 border-l-2 border-accent pl-3 font-serif italic leading-relaxed text-ink/85">
              "{item.quote}"
            </blockquote>
            <p className="mt-2 text-xs text-ink/55">{item.rationale}</p>
          </article>
        );
      })}
    </div>
  );
}
