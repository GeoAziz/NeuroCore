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
import {
  ChartTooltipContent,
  ChartTooltip,
  ChartContainer,
} from "@/components/ui/chart";

const eegSignalData = [
  { time: "0s", alpha: 40, beta: 60, gamma: 20 },
  { time: "1s", alpha: 30, beta: 50, gamma: 25 },
  { time: "2s", alpha: 50, beta: 70, gamma: 30 },
  { time: "3s", alpha: 45, beta: 65, gamma: 35 },
  { time: "4s", alpha: 60, beta: 80, gamma: 40 },
  { time: "5s", alpha: 55, beta: 75, gamma: 45 },
  { time: "6s", alpha: 70, beta: 90, gamma: 50 },
];

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
