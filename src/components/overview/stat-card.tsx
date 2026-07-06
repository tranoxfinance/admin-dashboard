import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MiniSparkline } from "./mini-sparkline";

export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  sparkline,
  color = "#2a78d6",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: number | null;
  sparkline?: { data: Record<string, number | string>[]; dataKey: string; variant?: "line" | "bar" };
  color?: string;
}) {
  const hasDelta = delta !== undefined && delta !== null && Number.isFinite(delta);
  const isPositive = hasDelta && (delta as number) >= 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col gap-1">
            <span className="font-heading text-2xl font-semibold">{value}</span>
            {hasDelta ? (
              <span
                className={cn(
                  "flex items-center gap-0.5 text-xs font-medium",
                  isPositive ? "text-[#0ca30c]" : "text-[#d03b3b]",
                )}
              >
                {isPositive ? (
                  <ArrowUp className="size-3" />
                ) : (
                  <ArrowDown className="size-3" />
                )}
                {Math.abs(delta as number).toFixed(0)}%
                <span className="ml-0.5 font-normal text-muted-foreground">
                  vs last period
                </span>
              </span>
            ) : null}
          </div>
          {sparkline ? (
            <div className="w-20 shrink-0">
              <MiniSparkline
                data={sparkline.data}
                dataKey={sparkline.dataKey}
                color={color}
                variant={sparkline.variant}
              />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
