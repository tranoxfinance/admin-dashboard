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
    accessorKey: "createdAt",
    header: "Flagged",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.status === "open" ? (
          <FlagReviewActions flagId={row.original.id} />
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
