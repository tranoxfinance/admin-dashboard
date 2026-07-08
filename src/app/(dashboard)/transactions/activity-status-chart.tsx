"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/components/theme-provider";
import type { ActivityStats } from "@/lib/types";
import { CHART_CHROME, STATUS_COLORS } from "@/lib/chart-colors";
import { useMounted } from "@/lib/use-mounted";

const STATUS_GROUPS = [
  { key: "completed", label: "Completed", statuses: ["completed"] },
  { key: "inProgress", label: "In progress", statuses: ["pending", "processing"] },
  { key: "failed", label: "Failed", statuses: ["failed"] },
  { key: "reversed", label: "Reversed", statuses: ["reversed"] },
];

const TYPE_LABELS: Record<string, string> = {
  transfer: "Transfers",
  topup: "Deposits",
  withdrawal: "Withdrawals",
};

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
  const visible = payload.filter((entry) => entry.value > 0);
  if (!visible.length) {
    return null;
  }
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
      <p className="mb-1.5 font-medium text-foreground">{label}</p>
      <div className="flex flex-col gap-1">
        {visible.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-sm"
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

export function ActivityStatusChart({
  byType,
}: {
  byType: ActivityStats["byType"];
}) {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const chrome =
    mounted && resolvedTheme === "dark" ? CHART_CHROME.dark : CHART_CHROME.light;

  const data = byType.map(({ type, statuses }) => {
    const row: Record<string, number | string> = { type: TYPE_LABELS[type] };
    for (const group of STATUS_GROUPS) {
      row[group.key] = statuses
        .filter((s) => group.statuses.includes(s.status))
        .reduce((sum, s) => sum + s.count, 0);
    }
    return row;
  });

  const hasData = data.some((row) =>
    STATUS_GROUPS.some((group) => Number(row[group.key]) > 0),
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
      <BarChart
        data={data}
        margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
        barCategoryGap={32}
      >
        <CartesianGrid vertical={false} stroke={chrome.gridline} />
        <XAxis
          dataKey="type"
          tick={{ fill: chrome.mutedInk, fontSize: 12 }}
          axisLine={{ stroke: chrome.baseline }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: chrome.mutedInk, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ fill: chrome.gridline, opacity: 0.5 }}
        />
        <Legend
          iconType="square"
          wrapperStyle={{ fontSize: 12, color: chrome.mutedInk }}
        />
        {STATUS_GROUPS.map((group) => (
          <Bar
            key={group.key}
            dataKey={group.key}
            name={group.label}
            stackId="status"
            fill={STATUS_COLORS[group.key]}
            stroke="var(--color-card)"
            strokeWidth={2}
            maxBarSize={64}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
