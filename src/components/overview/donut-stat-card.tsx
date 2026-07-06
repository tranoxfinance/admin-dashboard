"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: DonutSegment }[];
}) {
  if (!active || !payload?.length) {
    return null;
  }
  const segment = payload[0].payload;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
      <div className="flex items-center gap-2">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: segment.color }}
        />
        <span className="text-muted-foreground">{segment.label}</span>
        <span className="font-medium tabular-nums text-foreground">
          {segment.value.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export function DonutStatCard({
  segments,
  centerLabel = "Top",
}: {
  segments: DonutSegment[];
  centerLabel?: string;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const top = [...segments].sort((a, b) => b.value - a.value)[0];

  if (!total) {
    return (
      <div className="flex h-36 items-center justify-center text-sm text-muted-foreground">
        No data yet.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative size-28 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              dataKey="value"
              nameKey="label"
              innerRadius={36}
              outerRadius={52}
              paddingAngle={segments.length > 1 ? 3 : 0}
              stroke="none"
            >
              {segments.map((segment) => (
                <Cell key={segment.label} fill={segment.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
          <span className="text-[10px] text-muted-foreground">
            {centerLabel}
          </span>
          <span className="text-xs font-semibold leading-tight">
            {top?.label}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {segments.map((segment) => {
          const percent = Math.round((segment.value / total) * 100);
          return (
            <div
              key={segment.label}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span className="flex items-center gap-2 truncate">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="truncate">{segment.label}</span>
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {segment.value.toLocaleString()} · {percent}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
