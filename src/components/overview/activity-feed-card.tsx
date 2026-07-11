"use client";

import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { useDict } from "@/components/i18n-provider";
import type { Dict } from "@/lib/i18n";
import type { ActivityItem } from "@/lib/types";

const TYPE_META: Record<
  ActivityItem["type"],
  {
    icon: typeof ArrowLeftRight;
    gradient: string;
  }
> = {
  topup: {
    icon: ArrowDownLeft,
    gradient: "linear-gradient(90deg, #0ca30c, #7bd66f)",
  },
  withdrawal: {
    icon: ArrowUpRight,
    gradient: "linear-gradient(90deg, #d03b3b, #f5975e)",
  },
  transfer: {
    icon: ArrowLeftRight,
    gradient: "linear-gradient(90deg, #00407a, #0d8fd2)",
  },
};

function typeLabel(dict: Dict, type: ActivityItem["type"]): string {
  if (type === "topup") return dict.transactions.typeDeposit;
  if (type === "withdrawal") return dict.transactions.typeWithdrawal;
  return dict.transactions.typeTransfer;
}

export function ActivityFeedCard({ data }: { data: ActivityItem[] }) {
  const dict = useDict();

  if (!data.length) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        {dict.common.noActivity}
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((item) => Number(item.amount)));

  return (
    <div className="flex flex-col gap-3">
      {data.map((item) => {
        const meta = TYPE_META[item.type];
        const fillPercent = maxAmount
          ? Math.max(28, Math.round((Number(item.amount) / maxAmount) * 100))
          : 28;
        return (
          <div key={item.id} className="flex items-center gap-3">
            <div className="h-11 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="flex h-full items-center gap-2 rounded-full px-3.5"
                style={{ width: `${fillPercent}%`, backgroundImage: meta.gradient }}
              >
                <meta.icon className="size-3.5 shrink-0 text-white" />
                <span className="truncate text-sm font-medium text-white">
                  {typeLabel(dict, item.type)}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end rounded-full bg-card px-3 py-1.5 text-right shadow-sm ring-1 ring-foreground/10">
              <span className="text-sm font-semibold tabular-nums">
                {formatCurrency(item.amount, item.currency)}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {formatDate(item.initiatedAt, dict.common.dateLocale)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
