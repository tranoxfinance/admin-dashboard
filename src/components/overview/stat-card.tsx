import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MiniSparkline } from "./mini-sparkline";

export function StatCard({
  icon: Icon,
  label,
  value,
  secondary,
  delta,
  sparkline,
  color = "#2a78d6",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  secondary?: string;
  delta?: number | null;
  sparkline?: { data: Record<string, number | string>[]; dataKey: string; variant?: "line" | "bar" };
  color?: string;
}) {
  const hasDelta = delta !== undefined && delta !== null && Number.isFinite(delta);
  const isPositive = hasDelta && (delta as number) >= 0;

  return (
    <Card className="h-full rounded-2xl border-0 shadow-sm ring-0 transition-shadow hover:shadow-md">
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-center gap-2">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${color}1a`, color }}
          >
            <Icon className="size-4" />
          </span>
          <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-end gap-2">
          <div className="flex items-end justify-between gap-3">
            <span
              className="font-heading text-xl font-bold leading-none tracking-tight sm:text-2xl"
              title={value}
            >
              {value}
            </span>
            {sparkline ? (
              <div className="h-9 w-16 shrink-0">
                <MiniSparkline
                  data={sparkline.data}
                  dataKey={sparkline.dataKey}
                  color={color}
                  variant={sparkline.variant}
                />
              </div>
            ) : null}
          </div>
          {secondary ? (
            <span className="truncate text-xs font-medium text-muted-foreground">
              {secondary}
            </span>
          ) : null}
        </div>
        {hasDelta ? (
          <div className="flex items-center gap-1 border-t pt-2.5 text-xs">
            <span
              className={cn(
                "flex items-center gap-0.5 font-semibold",
                isPositive ? "text-[#0ca30c]" : "text-[#d03b3b]",
              )}
            >
              {isPositive ? (
                <ArrowUp className="size-3" />
              ) : (
                <ArrowDown className="size-3" />
              )}
              {Math.abs(delta as number).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">in last period</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
