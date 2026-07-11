"use client";

import {
  AreaTrendChart,
  type TrendPoint,
} from "@/components/charts/area-trend-chart";
import { useTheme } from "@/components/theme-provider";
import { formatCurrency } from "@/lib/format";
import { useMounted } from "@/lib/use-mounted";

const COMPACT = new Intl.NumberFormat("en", { notation: "compact" });

export function RevenueTrendChart({
  data,
  currency,
}: {
  data: TrendPoint[];
  currency: string;
}) {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && resolvedTheme === "dark";
  const color = isDark ? "#3987e5" : "#00407a";

  return (
    <AreaTrendChart
      data={data}
      seriesLabel={`Revenue (${currency})`}
      color={color}
      height={280}
      formatValue={(value) => formatCurrency(String(value), currency)}
      formatTick={(value) => COMPACT.format(value)}
    />
  );
}
