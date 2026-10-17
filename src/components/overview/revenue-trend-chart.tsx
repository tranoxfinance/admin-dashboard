"use client";

import {
  AreaTrendChart,
  type TrendPoint,
} from "@/components/charts/area-trend-chart";
import { useTheme } from "@/components/theme-provider";
import { formatCurrency } from "@/lib/format";
import { useMounted } from "@/lib/use-mounted";
import { CATEGORICAL_DARK, CHART_COLORS } from "@/lib/chart-colors";

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
  const color = isDark ? CATEGORICAL_DARK[0] : CHART_COLORS.navy;

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
