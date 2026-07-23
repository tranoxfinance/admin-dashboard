"use client";

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
import { useTheme } from "@/components/theme-provider";
import { useDict } from "@/components/i18n-provider";
import type { ActivityDailyPoint } from "@/lib/types";
import { CATEGORICAL_DARK, CATEGORICAL_LIGHT, CHART_CHROME } from "@/lib/chart-colors";
import { useMounted } from "@/lib/use-mounted";

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
  dateLocale,
}: {
  active?: boolean;
  payload?: { dataKey: string; name: string; value: number; color: string }[];
  label?: string;
  dateLocale?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
      <p className="mb-1.5 font-medium text-foreground">
        {label ? formatAxisDate(label, dateLocale ?? "en-US") : ""}
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
  const mounted = useMounted();
  const dict = useDict();

  const isDark = mounted && resolvedTheme === "dark";
  const colors = isDark ? CATEGORICAL_DARK : CATEGORICAL_LIGHT;
  const chrome = isDark ? CHART_CHROME.dark : CHART_CHROME.light;

  const hasData = data.some(
    (point) => point.transfers || point.topups || point.withdrawals,
  );

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        {dict.transactions.empty}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={chrome.gridline} />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) =>
            formatAxisDate(value, dict.common.dateLocale)
          }
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
        <Tooltip
          content={<ChartTooltip dateLocale={dict.common.dateLocale} />}
          cursor={{ stroke: chrome.baseline }}
        />
        <Legend
          iconType="plainline"
          wrapperStyle={{ fontSize: 12, color: chrome.mutedInk }}
        />
        <Line
          type="monotone"
          dataKey="transfers"
          name={dict.common.transfers}
          stroke={colors[0]}
          strokeWidth={2}
          dot={{ r: 3, strokeWidth: 0, fill: colors[0] }}
          activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-card)" }}
        />
        <Line
          type="monotone"
          dataKey="topups"
          name={dict.common.deposits}
          stroke={colors[1]}
          strokeWidth={2}
          dot={{ r: 3, strokeWidth: 0, fill: colors[1] }}
          activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-card)" }}
        />
        <Line
          type="monotone"
          dataKey="withdrawals"
          name={dict.common.withdrawals}
          stroke={colors[2]}
          strokeWidth={2}
          dot={{ r: 3, strokeWidth: 0, fill: colors[2] }}
          activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-card)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
