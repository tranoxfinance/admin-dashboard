"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import type { ActivityItem, RiskLevel } from "@/lib/types";
import type { Dict } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { HoldReviewActions } from "./hold-review-actions";
import { ReverseTransactionButton } from "./reverse-transaction-button";

const STATUS_VARIANT: Record<
  string,
  "secondary" | "destructive" | "outline"
> = {
  completed: "secondary",
  failed: "destructive",
  reversed: "destructive",
  pending: "outline",
  processing: "outline",
  on_hold: "outline",
};

const RISK_VARIANT: Record<RiskLevel, "secondary" | "destructive" | "outline"> = {
  low: "secondary",
  medium: "outline",
  high: "destructive",
};

function riskLabel(dict: Dict, level: RiskLevel): string {
  if (level === "high") return dict.transactions.riskHigh;
  if (level === "medium") return dict.transactions.riskMedium;
  return dict.transactions.riskLow;
}

function buildColumns(
  dict: Dict,
  canManage: boolean,
): ColumnDef<ActivityItem>[] {
  const typeMeta: Record<
    ActivityItem["type"],
    { label: string; icon: typeof ArrowLeftRight }
  > = {
    transfer: { label: dict.transactions.typeTransfer, icon: ArrowLeftRight },
    topup: { label: dict.transactions.typeDeposit, icon: ArrowDownLeft },
    withdrawal: {
      label: dict.transactions.typeWithdrawal,
      icon: ArrowUpRight,
    },
  };
  const statusLabels: Record<string, string> = {
    completed: dict.transactions.statusCompleted,
    failed: dict.transactions.statusFailed,
    reversed: dict.transactions.statusReversed,
    pending: dict.transactions.statusPending,
    processing: dict.transactions.statusProcessing,
    on_hold: dict.transactions.statusOnHold,
  };
  const columns: ColumnDef<ActivityItem>[] = [
    {
      accessorKey: "type",
      header: dict.transactions.colType,
      cell: ({ row }) => {
        const meta = typeMeta[row.original.type];
        return (
          <span className="flex items-center gap-1.5">
            <meta.icon className="size-3.5 text-muted-foreground" />
            {meta.label}
          </span>
        );
      },
    },
    {
      accessorKey: "amount",
      header: dict.transactions.colAmount,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <span className="font-medium">
            {formatCurrency(item.amount, item.currency)}
            {item.secondaryAmount && item.secondaryCurrency ? (
              <span className="ml-1 font-normal text-muted-foreground">
                → {formatCurrency(item.secondaryAmount, item.secondaryCurrency)}
              </span>
            ) : null}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: dict.common.status,
      cell: ({ row }) =>
        row.original.status === "on_hold" ? (
          <div className="flex flex-col gap-1">
            <Badge className="w-fit bg-amber-500 text-white">
              {dict.transactions.statusOnHold}
            </Badge>
            {row.original.heldReason ? (
              <span className="max-w-xs text-wrap text-xs text-muted-foreground">
                {row.original.heldReason}
              </span>
            ) : null}
          </div>
        ) : (
          <Badge variant={STATUS_VARIANT[row.original.status] ?? "outline"}>
            {statusLabels[row.original.status] ?? row.original.status}
          </Badge>
        ),
    },
    {
      id: "risk",
      header: dict.transactions.colRisk,
      accessorFn: (row) => row.riskLevel ?? "",
      cell: ({ row }) => {
        const level = row.original.riskLevel;
        if (!level) {
          return "—";
        }
        return (
          <Badge variant={RISK_VARIANT[level]}>{riskLabel(dict, level)}</Badge>
        );
      },
    },
    {
      accessorKey: "initiatedAt",
      header: dict.transactions.colInitiated,
      cell: ({ row }) =>
        formatDate(row.original.initiatedAt, dict.common.dateLocale),
    },
  ];
  if (canManage) {
    columns.push({
      id: "actions",
      header: () => <div className="text-right">{dict.common.actions}</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.type === "transfer" &&
          row.original.status === "on_hold" ? (
            <HoldReviewActions transactionId={row.original.id} />
          ) : row.original.type === "transfer" &&
            row.original.status === "completed" ? (
            <ReverseTransactionButton transactionId={row.original.id} />
          ) : null}
        </div>
      ),
    });
  }
  return columns;
}

export function ActivityTable({
  data,
  canManage,
  emptyMessage,
}: {
  data: ActivityItem[];
  canManage: boolean;
  emptyMessage?: string;
}) {
  const dict = useDict();
  const columns = useMemo(
    () => buildColumns(dict, canManage),
    [dict, canManage],
  );
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder={dict.transactions.search}
      emptyMessage={emptyMessage ?? dict.transactions.empty}
    />
  );
}
