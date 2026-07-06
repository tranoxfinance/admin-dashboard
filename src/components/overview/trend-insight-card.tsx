"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { CATEGORICAL_DARK, CATEGORICAL_LIGHT } from "@/lib/chart-colors";
import type { UserGrowthPoint } from "@/lib/types";

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
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium text-foreground">
        {label ? formatAxisDate(label) : ""}
      </p>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">Activity</span>
        <span className="font-medium tabular-nums text-foreground">
          {payload[0].value}
        </span>
      </div>
    </div>
  );
}

export interface TrendBreakdownItem {
  label: string;
  percent: number;
  color: string;
}

export function TrendInsightCard({
  data,
  total,
  breakdown,
}: {
  data: UserGrowthPoint[];
  total: number;
  breakdown: TrendBreakdownItem[];
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";
  const color = isDark ? CATEGORICAL_DARK[0] : CATEGORICAL_LIGHT[0];

  const hasData = data.some((point) => point.count > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="font-heading text-2xl font-semibold">
            {total.toLocaleString()}
          </span>
          <span className="ml-1.5 text-sm text-muted-foreground">
            total activity
          </span>
        </div>
      </div>
      {hasData ? (
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="trendInsightFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke={color}
                strokeWidth={2}
                fill="url(#trendInsightFill)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          No activity in this period.
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-3">
        {breakdown.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5 text-sm">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium">{item.percent}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}
