"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import type { ActivityItem } from "@/lib/types";
import type { Dict } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
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
};

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
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANT[row.original.status] ?? "outline"}>
          {statusLabels[row.original.status] ?? row.original.status}
        </Badge>
      ),
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
}: {
  data: ActivityItem[];
  canManage: boolean;
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
      emptyMessage={dict.transactions.empty}
    />
  );
}
