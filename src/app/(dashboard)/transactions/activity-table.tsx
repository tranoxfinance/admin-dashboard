"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import type { ActivityItem } from "@/lib/types";
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

const TYPE_META: Record<
  ActivityItem["type"],
  { label: string; icon: typeof ArrowLeftRight }
> = {
  transfer: { label: "Transfer", icon: ArrowLeftRight },
  topup: { label: "Deposit", icon: ArrowDownLeft },
  withdrawal: { label: "Withdrawal", icon: ArrowUpRight },
};

const columns: ColumnDef<ActivityItem>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const meta = TYPE_META[row.original.type];
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
    header: "Amount",
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
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={STATUS_VARIANT[row.original.status] ?? "outline"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "initiatedAt",
    header: "Initiated",
    cell: ({ row }) => formatDate(row.original.initiatedAt),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.type === "transfer" &&
        row.original.status === "completed" ? (
          <ReverseTransactionButton transactionId={row.original.id} />
        ) : null}
      </div>
    ),
  },
];

export function ActivityTable({ data }: { data: ActivityItem[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search by type or status…"
      emptyMessage="No activity in this period."
    />
  );
}
