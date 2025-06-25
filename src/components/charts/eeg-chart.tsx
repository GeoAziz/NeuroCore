"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { eegSignalData } from "@/lib/data";
import {
  ChartTooltipContent,
  ChartTooltip,
  ChartContainer,
} from "@/components/ui/chart";

export function EegChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartContainer
        config={{
          alpha: { label: "Alpha", color: "hsl(var(--chart-1))" },
          beta: { label: "Beta", color: "hsl(var(--chart-2))" },
          gamma: { label: "Gamma", color: "hsl(var(--chart-4))" },
        }}
      >
        <LineChart data={eegSignalData}>
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Legend />
          <Line
            dataKey="alpha"
            type="monotone"
            stroke="var(--color-alpha)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="beta"
            type="monotone"
            stroke="var(--color-beta)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="gamma"
            type="monotone"
            stroke="var(--color-gamma)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
}
