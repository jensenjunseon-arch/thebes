"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CONSTRUCTS } from "@/lib/constructs";
import type { ConstructId } from "@/lib/constructs";
import type { WeekBucket } from "@/lib/supabase/queries";

interface Props {
  weeks: WeekBucket[];
}

// Shows the aggregate score across all 6 constructs per week.
// Each bar represents total points earned that week.
export function WeeklyBarChart({ weeks }: Props) {
  const data = weeks.map((w) => ({
    name: w.weekLabel,
    total: Object.values(w.scores).reduce((a, b) => a + b, 0),
  }));

  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke="#14110C12" />
          <XAxis
            dataKey="name"
            tick={{
              fontSize: 10,
              fill: "#14110C66",
              fontFamily: "Geist Mono, ui-monospace, monospace",
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: "#14110C08" }}
            contentStyle={{
              background: "#F6F2E8",
              border: "1px solid #14110C20",
              borderRadius: "12px",
              fontSize: "11px",
              fontFamily: "Geist, sans-serif",
            }}
            formatter={(value) => [`${value ?? 0}pt`, "합산 점수"]}
          />
          <Bar dataKey="total" radius={[6, 6, 0, 0]}>
            {data.map((entry, idx) => (
              <Cell
                key={idx}
                fill={
                  entry.total === maxTotal
                    ? "#B5411B"
                    : idx === data.length - 1
                      ? "#B5411B"
                      : "#ECCEB6"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Per-construct breakdown for a single week — horizontal bar list.
interface BreakdownProps {
  scores: Record<ConstructId, number>;
  ceiling?: number;
}

export function ConstructBreakdown({ scores, ceiling = 30 }: BreakdownProps) {
  return (
    <div className="space-y-2">
      {CONSTRUCTS.map((c) => {
        const val = scores[c.id] ?? 0;
        const pct = Math.max(0, Math.min(100, (val / ceiling) * 100));
        return (
          <div key={c.id}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="font-kr text-xs font-medium">{c.koreanName}</span>
              <span className="font-mono text-[11px] text-ink/50">{val}pt</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
              <div
                className="h-full bg-accent transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
