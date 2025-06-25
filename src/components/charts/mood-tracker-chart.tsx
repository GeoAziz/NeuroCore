"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { moodTrackerData } from "@/lib/data";
import {
  ChartTooltipContent,
  ChartTooltip,
  ChartContainer,
} from "@/components/ui/chart";

export function MoodTrackerChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartContainer
        config={{
          mood: { label: "Mood", color: "hsl(var(--chart-1))" },
          stress: { label: "Stress", color: "hsl(var(--chart-2))" },
        }}
      >
        <LineChart data={moodTrackerData}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Legend />
          <Line
            dataKey="mood"
            type="monotone"
            stroke="var(--color-mood)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="stress"
            type="monotone"
            stroke="var(--color-stress)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
}
