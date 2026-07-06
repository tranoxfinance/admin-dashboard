"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ActivityDailyPoint } from "@/lib/types";
import { CATEGORICAL_DARK, CATEGORICAL_LIGHT, CHART_CHROME } from "@/lib/chart-colors";

function formatAxisDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey: string; name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
      <p className="mb-1.5 font-medium text-foreground">
        {label ? formatAxisDate(label) : ""}
      </p>
      <div className="flex flex-col gap-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <span
              className="h-0.5 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="flex-1 text-muted-foreground">{entry.name}</span>
            <span className="font-medium tabular-nums text-foreground">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityLineChart({ data }: { data: ActivityDailyPoint[] }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const colors = isDark ? CATEGORICAL_DARK : CATEGORICAL_LIGHT;
  const chrome = isDark ? CHART_CHROME.dark : CHART_CHROME.light;

  const hasData = data.some(
    (point) => point.transfers || point.topups || point.withdrawals,
  );

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No activity in this period.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={chrome.gridline} />
        <XAxis
          dataKey="date"
          tickFormatter={formatAxisDate}
          tick={{ fill: chrome.mutedInk, fontSize: 12 }}
          axisLine={{ stroke: chrome.baseline }}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: chrome.mutedInk, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: chrome.baseline }} />
        <Legend
          iconType="plainline"
          wrapperStyle={{ fontSize: 12, color: chrome.mutedInk }}
        />
        <Line
          type="monotone"
          dataKey="transfers"
          name="Transfers"
          stroke={colors[0]}
          strokeWidth={2}
          dot={{ r: 3, strokeWidth: 0, fill: colors[0] }}
          activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-card)" }}
        />
        <Line
          type="monotone"
          dataKey="topups"
          name="Deposits"
          stroke={colors[1]}
          strokeWidth={2}
          dot={{ r: 3, strokeWidth: 0, fill: colors[1] }}
          activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-card)" }}
        />
        <Line
          type="monotone"
          dataKey="withdrawals"
          name="Withdrawals"
          stroke={colors[2]}
          strokeWidth={2}
          dot={{ r: 3, strokeWidth: 0, fill: colors[2] }}
          activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-card)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
