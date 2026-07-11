"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import type { AmlFlag } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { FlagReviewActions } from "./flag-review-actions";

const STATUS_VARIANT: Record<
  AmlFlag["status"],
  "secondary" | "destructive" | "outline"
> = {
  open: "destructive",
  reviewed: "secondary",
  dismissed: "outline",
};

const columns: ColumnDef<AmlFlag>[] = [
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <span className="block max-w-md text-wrap">{row.original.reason}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={STATUS_VARIANT[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "restriction",
    header: "Restriction",
    accessorFn: (row) => row.restriction?.reference ?? "",
    cell: ({ row }) => {
      const restriction = row.original.restriction;
      if (!restriction) {
        return "—";
      }
      return (
        <div className="flex items-center gap-2">
          {restriction.level === "suspended" ? (
            <Badge variant="destructive">Suspended</Badge>
          ) : (
            <Badge className="bg-amber-500 text-white">Restricted</Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {restriction.reference}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Flagged",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.status === "open" || row.original.restriction ? (
          <FlagReviewActions
            flagId={row.original.id}
            status={row.original.status}
            restriction={row.original.restriction}
          />
        ) : null}
      </div>
    ),
  },
];

export function AmlFlagsTable({ data }: { data: AmlFlag[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search by reason or status…"
      emptyMessage="No flags found."
    />
  );
}
