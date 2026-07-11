"use client";

import { AreaTrendChart } from "@/components/charts/area-trend-chart";
import type { RevenueDailyPoint } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

const CURRENCY_COLORS: Record<string, string> = {
  NGN: "#0d8fd2",
  XOF: "#95c015",
};

function compactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function VolumeTrendChart({ data }: { data: RevenueDailyPoint[] }) {
  const currencies = [...new Set(data.map((point) => point.currency))].sort();

  if (!currencies.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No volume in this period.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {currencies.map((currency) => {
        const color = CURRENCY_COLORS[currency] ?? "#5ba2ca";
        const points = data
          .filter((point) => point.currency === currency)
          .map((point) => ({ date: point.date, value: Number(point.volume) }));
        return (
          <div key={currency} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm font-semibold">{currency}</span>
            </div>
            <AreaTrendChart
              data={points}
              seriesLabel={`Volume (${currency})`}
              color={color}
              height={200}
              formatValue={(value) => formatCurrency(String(value), currency)}
              formatTick={compactNumber}
            />
          </div>
        );
      })}
    </div>
  );
}
