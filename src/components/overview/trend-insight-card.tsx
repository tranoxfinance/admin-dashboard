"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/components/theme-provider";
import { CATEGORICAL_DARK, CATEGORICAL_LIGHT } from "@/lib/chart-colors";
import type { UserGrowthPoint } from "@/lib/types";
import { useMounted } from "@/lib/use-mounted";

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
  const mounted = useMounted();
  const isDark = mounted && resolvedTheme === "dark";
  const color = isDark ? CATEGORICAL_DARK[0] : CATEGORICAL_LIGHT[0];
  const tickColor = isDark ? "#7e91a8" : "#6b7d92";

  const hasData = data.some((point) => point.count > 0);
  const tickInterval = Math.max(0, Math.ceil(data.length / 7) - 1);

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
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <Tooltip cursor={{ fill: `${color}0f` }} content={<ChartTooltip />} />
              <XAxis
                dataKey="date"
                tickFormatter={formatAxisDate}
                axisLine={false}
                tickLine={false}
                interval={tickInterval}
                tick={{ fontSize: 11, fill: tickColor }}
                dy={8}
              />
              <YAxis
                orientation="right"
                axisLine={false}
                tickLine={false}
                width={36}
                tickCount={3}
                tick={{ fontSize: 11, fill: tickColor }}
              />
              <Bar
                dataKey="count"
                fill={color}
                radius={[4, 4, 0, 0]}
                maxBarSize={22}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          No activity in this period.
        </div>
      )}
      <div className="flex flex-col gap-3 border-t pt-3">
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
          {breakdown.map((item) => (
            <span
              key={item.label}
              style={{ width: `${item.percent}%`, backgroundColor: item.color }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {breakdown.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5 text-sm">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-semibold">{item.percent}%</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
