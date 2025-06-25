
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
import {
  ChartTooltipContent,
  ChartTooltip,
  ChartContainer,
} from "@/components/ui/chart";
import React from "react";
import type { MoodTrackerDataPoint } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";

interface MoodTrackerChartProps {
  data: MoodTrackerDataPoint[];
  loading?: boolean;
}

export function MoodTrackerChart({ data, loading }: MoodTrackerChartProps) {
  if (loading) {
    return <Skeleton className="w-full h-full" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No mood data available.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartContainer
        config={{
          mood: { label: "Mood", color: "hsl(var(--chart-1))" },
          stress: { label: "Stress", color: "hsl(var(--chart-2))" },
        }}
      >
        <LineChart data={data}>
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
