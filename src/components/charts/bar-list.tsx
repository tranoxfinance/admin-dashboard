"use client";

import { useDict } from "@/components/i18n-provider";

export interface BarListItem {
  label: string;
  value: number;
  color?: string;
}

export function BarList({
  items,
  color = "#0d8fd2",
  formatValue = (value: number) => value.toLocaleString(),
}: {
  items: BarListItem[];
  color?: string;
  formatValue?: (value: number) => string;
}) {
  const dict = useDict();
  const max = Math.max(...items.map((item) => item.value), 0);

  if (!max) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        {dict.common.noDataYet}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const barColor = item.color ?? color;
        const width = Math.max((item.value / max) * 100, item.value > 0 ? 2 : 0);
        return (
          <div key={item.label} className="flex items-center gap-3">
            <span
              className="w-28 shrink-0 truncate text-sm text-muted-foreground sm:w-36"
              title={item.label}
            >
              {item.label}
            </span>
            <div className="h-4 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{ width: `${width}%`, backgroundColor: barColor }}
              />
            </div>
            <span className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums">
              {formatValue(item.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
