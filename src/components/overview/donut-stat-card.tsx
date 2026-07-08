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
  centerLabel = "Total",
}: {
  segments: DonutSegment[];
  centerLabel?: string;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  if (!total) {
    return (
      <div className="flex h-36 items-center justify-center text-sm text-muted-foreground">
        No data yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative size-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              dataKey="value"
              nameKey="label"
              startAngle={210}
              endAngle={-30}
              innerRadius={52}
              outerRadius={72}
              cornerRadius={8}
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
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-center">
          <span className="font-heading text-2xl font-bold leading-none tracking-tight">
            {total.toLocaleString()}
          </span>
          <span className="w-20 text-[10px] uppercase leading-tight tracking-wide text-muted-foreground">
            {centerLabel}
          </span>
        </div>
      </div>
      <div className="flex w-full flex-col gap-2.5">
        {segments.map((segment) => {
          const percent = Math.round((segment.value / total) * 100);
          return (
            <div key={segment.label} className="flex items-center gap-2 text-sm">
              <span className="shrink-0 truncate text-muted-foreground">
                {segment.label}
              </span>
              <span className="mx-1 h-px flex-1 border-t border-dashed border-border" />
              <span className="shrink-0 font-semibold tabular-nums">
                {segment.value.toLocaleString()}
              </span>
              <span className="w-9 shrink-0 text-right text-xs text-muted-foreground">
                {percent}%
              </span>
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
