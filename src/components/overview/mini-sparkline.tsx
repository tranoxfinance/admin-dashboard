"use client";

import { Bar, BarChart, Line, LineChart, ResponsiveContainer } from "recharts";

export function MiniSparkline({
  data,
  dataKey,
  color,
  variant = "line",
}: {
  data: Record<string, number | string>[];
  dataKey: string;
  color: string;
  variant?: "line" | "bar";
}) {
  if (data.length < 2) {
    return <div className="h-9" />;
  }

  if (variant === "bar") {
    return (
      <div className="h-9 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <Bar dataKey={dataKey} fill={color} radius={[2, 2, 0, 0]} maxBarSize={6} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-9 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
