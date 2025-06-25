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
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/context/auth-context";
import React, { useEffect, useState } from "react";
import type { MoodTrackerDataPoint } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";

export function MoodTrackerChart() {
  const { user } = useAuth();
  const [data, setData] = useState<MoodTrackerDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);
      const q = query(collection(db, `users/${user.uid}/moodTracker`));
      const querySnapshot = await getDocs(q);
      const moodData = querySnapshot.docs.map(doc => doc.data() as MoodTrackerDataPoint);
      setData(moodData);
      setLoading(false);
    }
    fetchData();
  }, [user]);

  if (loading) {
    return <Skeleton className="w-full h-full" />;
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
