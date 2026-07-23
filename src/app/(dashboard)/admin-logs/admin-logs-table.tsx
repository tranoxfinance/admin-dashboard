"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import type { AdminLogRow } from "@/lib/types";
import type { Dict } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import { DataTable } from "@/components/data-table";

function buildColumns(dict: Dict): ColumnDef<AdminLogRow>[] {
  return [
    {
      accessorKey: "adminEmail",
      header: dict.adminLogs.colAdmin,
      cell: ({ row }) => (
        <span className="font-medium">{row.original.adminEmail ?? "—"}</span>
      ),
    },
    {
      accessorKey: "action",
      header: dict.adminLogs.colAction,
    },
    {
      id: "entity",
      header: dict.adminLogs.colEntity,
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
      accessorKey: "createdAt",
      header: dict.adminLogs.colWhen,
      cell: ({ row }) =>
        formatDate(row.original.createdAt, dict.common.dateLocale),
    },
  ];
}

export function AdminLogsTable({ data }: { data: AdminLogRow[] }) {
  const dict = useDict();
  const columns = useMemo(() => buildColumns(dict), [dict]);
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder={dict.adminLogs.search}
      emptyMessage={dict.adminLogs.empty}
    />
  );
}
