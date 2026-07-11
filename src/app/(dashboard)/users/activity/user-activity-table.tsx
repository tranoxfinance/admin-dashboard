"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { humanizeAction } from "@/lib/activity";
import { formatDate } from "@/lib/format";
import type { UserActivityRow } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";

const columns: ColumnDef<UserActivityRow>[] = [
  {
    id: "name",
    header: "Name",
    accessorFn: (row) =>
      [row.firstName, row.lastName].filter(Boolean).join(" "),
    cell: ({ row }) => {
      const name = [row.original.firstName, row.original.lastName]
        .filter(Boolean)
        .join(" ");
      return name || "—";
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.phone}</span>
    ),
  },
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    accessorKey: "eventCount",
    header: "Events",
    cell: ({ row }) => (
      <span className="font-semibold tabular-nums">
        {row.original.eventCount.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "topAction",
    header: "Most Frequent",
    cell: ({ row }) =>
      row.original.topAction ? humanizeAction(row.original.topAction) : "—",
  },
  {
    accessorKey: "lastAction",
    header: "Last Action",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.lastAction ? humanizeAction(row.original.lastAction) : "—"}
      </span>
    ),
  },
  {
    accessorKey: "lastActiveAt",
    header: "Last Active",
    cell: ({ row }) => formatDate(row.original.lastActiveAt),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Details</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href={`/audit-logs?userId=${row.original.userId}`} />}
        >
          View events
        </Button>
      </div>
    ),
  },
];

export function UserActivityTable({ data }: { data: UserActivityRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search by name, phone, country…"
      emptyMessage="No user activity in this period."
    />
  );
}
