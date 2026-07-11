"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { humanizeAction } from "@/lib/activity";
import { formatDate } from "@/lib/format";
import type { UserActivityRow } from "@/lib/types";
import type { Dict } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";

function buildColumns(dict: Dict): ColumnDef<UserActivityRow>[] {
  return [
    {
      id: "name",
      header: dict.userActivity.colName,
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
      header: dict.userActivity.colPhone,
      cell: ({ row }) => (
        <span className="font-medium">{row.original.phone}</span>
      ),
    },
    {
      accessorKey: "country",
      header: dict.userActivity.colCountry,
    },
    {
      accessorKey: "eventCount",
      header: dict.userActivity.colEvents,
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums">
          {row.original.eventCount.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "topAction",
      header: dict.userActivity.colMostFrequent,
      cell: ({ row }) =>
        row.original.topAction ? humanizeAction(row.original.topAction) : "—",
    },
    {
      accessorKey: "lastAction",
      header: dict.userActivity.colLastAction,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.lastAction
            ? humanizeAction(row.original.lastAction)
            : "—"}
        </span>
      ),
    },
    {
      accessorKey: "lastActiveAt",
      header: dict.userActivity.colLastActive,
      cell: ({ row }) =>
        formatDate(row.original.lastActiveAt, dict.common.dateLocale),
    },
    {
      id: "actions",
      header: () => (
        <div className="text-right">{dict.userActivity.colDetails}</div>
      ),
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href={`/audit-logs?userId=${row.original.userId}`} />}
          >
            {dict.userActivity.viewEvents}
          </Button>
        </div>
      ),
    },
  ];
}

export function UserActivityTable({ data }: { data: UserActivityRow[] }) {
  const dict = useDict();
  const columns = useMemo(() => buildColumns(dict), [dict]);
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder={dict.userActivity.search}
      emptyMessage={dict.userActivity.empty}
    />
  );
}
