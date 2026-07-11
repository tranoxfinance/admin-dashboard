"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import type { AuditLog } from "@/lib/types";
import type { Dict } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import { DataTable } from "@/components/data-table";

function buildColumns(dict: Dict): ColumnDef<AuditLog>[] {
  return [
    {
      accessorKey: "action",
      header: dict.auditLogs.colAction,
      cell: ({ row }) => (
        <span className="font-medium">{row.original.action}</span>
      ),
    },
    {
      id: "entity",
      header: dict.auditLogs.colEntity,
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
      header: dict.auditLogs.colIp,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.ipAddress ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: dict.auditLogs.colWhen,
      cell: ({ row }) => formatDate(row.original.createdAt, dict.common.dateLocale),
    },
  ];
}

export function AuditLogsTable({ data }: { data: AuditLog[] }) {
  const dict = useDict();
  const columns = useMemo(() => buildColumns(dict), [dict]);
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder={dict.auditLogs.search}
      emptyMessage={dict.auditLogs.empty}
    />
  );
}
