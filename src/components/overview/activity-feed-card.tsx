import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import type { ActivityItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_META: Record<
  ActivityItem["type"],
  {
    label: string;
    icon: typeof ArrowLeftRight;
    iconClass: string;
    amountClass: string;
    sign: string;
  }
> = {
  topup: {
    label: "Deposit",
    icon: ArrowDownLeft,
    iconClass: "bg-[#0ca30c]/10 text-[#0ca30c]",
    amountClass: "text-[#0ca30c]",
    sign: "+",
  },
  withdrawal: {
    label: "Withdrawal",
    icon: ArrowUpRight,
    iconClass: "bg-[#d03b3b]/10 text-[#d03b3b]",
    amountClass: "text-[#d03b3b]",
    sign: "-",
  },
  transfer: {
    label: "Transfer",
    icon: ArrowLeftRight,
    iconClass: "bg-primary/10 text-primary",
    amountClass: "text-foreground",
    sign: "",
  },
};

export function ActivityFeedCard({ data }: { data: ActivityItem[] }) {
  if (!data.length) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        No activity in this period.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {data.map((item) => {
        const meta = TYPE_META[item.type];
        return (
          <div
            key={item.id}
            className="flex items-center gap-3 border-b py-2.5 last:border-0"
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full",
                meta.iconClass,
              )}
            >
              <meta.icon className="size-4" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-medium">{meta.label}</span>
              <span className="text-xs text-muted-foreground">
                {formatDate(item.initiatedAt)}
              </span>
            </div>
            <span
              className={cn(
                "shrink-0 text-sm font-medium tabular-nums",
                meta.amountClass,
              )}
            >
              {meta.sign}
              {formatCurrency(item.amount, item.currency)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
