"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CONSTRUCTS } from "@/lib/constructs";
import type { ConstructId } from "@/lib/constructs";

interface Props {
  current: Record<ConstructId, number>;
  previous: Record<ConstructId, number>;
  // Ceiling for normalization. Default matches ScorePanel's SESSION_MAX.
  ceiling?: number;
}

export function ConstructRadar({ current, previous, ceiling = 30 }: Props) {
  const data = CONSTRUCTS.map((c) => ({
    subject: c.koreanName,
    이번주: Math.round(Math.min(ceiling, current[c.id] ?? 0)),
    지난주: Math.round(Math.min(ceiling, previous[c.id] ?? 0)),
    fullMark: ceiling,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#14110C20" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 11, fill: "#14110C99", fontFamily: "Pretendard Variable, Pretendard, sans-serif" }}
          />
          <Radar
            name="지난주"
            dataKey="지난주"
            stroke="#ECCEB6"
            fill="#ECCEB6"
            fillOpacity={0.4}
          />
          <Radar
            name="이번주"
            dataKey="이번주"
            stroke="#B5411B"
            fill="#B5411B"
            fillOpacity={0.25}
          />
          <Legend
            wrapperStyle={{
              fontSize: "11px",
              fontFamily: "Geist, ui-sans-serif, sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
