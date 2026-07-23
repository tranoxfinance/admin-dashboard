"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/components/theme-provider";
import { useDict } from "@/components/i18n-provider";
import { CHART_CHROME } from "@/lib/chart-colors";
import { useMounted } from "@/lib/use-mounted";

export interface TrendPoint {
  date: string;
  value: number;
}

function formatAxisDate(value: string, locale: string) {
  return new Date(value).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
  });
}

function ChartTooltip({
  active,
  payload,
  label,
  seriesLabel,
  color,
  formatValue,
  dateLocale,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  seriesLabel: string;
  color: string;
  formatValue: (value: number) => string;
  dateLocale: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium text-foreground">
        {label ? formatAxisDate(label, dateLocale) : ""}
      </p>
      <div className="flex items-center gap-2">
        <span
          className="h-0.5 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-muted-foreground">{seriesLabel}</span>
        <span className="font-medium tabular-nums text-foreground">
          {formatValue(payload[0].value)}
        </span>
      </div>
    </div>
  );
}

export function AreaTrendChart({
  data,
  seriesLabel,
  color,
  height = 240,
  formatValue = (value) => value.toLocaleString(),
  formatTick,
}: {
  data: TrendPoint[];
  seriesLabel: string;
  color: string;
  height?: number;
  formatValue?: (value: number) => string;
  formatTick?: (value: number) => string;
}) {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const dict = useDict();
  const chrome =
    mounted && resolvedTheme === "dark" ? CHART_CHROME.dark : CHART_CHROME.light;

  const hasData = data.some((point) => point.value > 0);
  if (!hasData) {
    return (
      <div
        className="flex items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        {dict.common.noData}
      </div>
    );
  }

  const gradientId = `trend-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={chrome.gridline} />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) =>
            formatAxisDate(value, dict.common.dateLocale)
          }
          tick={{ fill: chrome.mutedInk, fontSize: 12 }}
          axisLine={{ stroke: chrome.baseline }}
          tickLine={false}
          minTickGap={28}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: chrome.mutedInk, fontSize: 12 }}
          tickFormatter={formatTick}
          axisLine={false}
          tickLine={false}
          width={formatTick ? 46 : 32}
        />
        <Tooltip
          content={
            <ChartTooltip
              seriesLabel={seriesLabel}
              color={color}
              formatValue={formatValue}
              dateLocale={dict.common.dateLocale}
            />
          }
          cursor={{ stroke: chrome.baseline }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-card)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
