"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import type { AuditLog } from "@/lib/types";
import { DataTable } from "@/components/data-table";

const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.action}</span>
    ),
  },
  {
    id: "entity",
    header: "Entity",
    accessorFn: (row) =>
      `${row.entityType ?? ""} ${row.entityId ?? ""}`.trim(),
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.entityType ?? "—"}
        {row.original.entityId ? ` · ${row.original.entityId.slice(0, 8)}` : ""}
      </span>
    ),
  },
  {
    accessorKey: "ipAddress",
    header: "IP Address",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.ipAddress ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "When",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
];

export function AuditLogsTable({ data }: { data: AuditLog[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search by action, entity, IP…"
      emptyMessage="No events found."
    />
  );
}
