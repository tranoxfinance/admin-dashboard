"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import type { AmlFlag } from "@/lib/types";
import type { Dict } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
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

function statusLabel(dict: Dict, status: AmlFlag["status"]): string {
  if (status === "open") return dict.amlFlags.statusOpen;
  if (status === "reviewed") return dict.amlFlags.statusReviewed;
  return dict.amlFlags.statusDismissed;
}

function buildColumns(dict: Dict, canManage: boolean): ColumnDef<AmlFlag>[] {
  const columns: ColumnDef<AmlFlag>[] = [
    {
      accessorKey: "reason",
      header: dict.amlFlags.colReason,
      cell: ({ row }) => (
        <span className="block max-w-md text-wrap">{row.original.reason}</span>
      ),
    },
    {
      accessorKey: "status",
      header: dict.common.status,
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANT[row.original.status]}>
          {statusLabel(dict, row.original.status)}
        </Badge>
      ),
    },
    {
      id: "restriction",
      header: dict.amlFlags.colRestriction,
      accessorFn: (row) => row.restriction?.reference ?? "",
      cell: ({ row }) => {
        const restriction = row.original.restriction;
        if (!restriction) {
          return "—";
        }
        return (
          <div className="flex items-center gap-2">
            {restriction.level === "suspended" ? (
              <Badge variant="destructive">
                {dict.restrictions.levelSuspended}
              </Badge>
            ) : (
              <Badge className="bg-amber-500 text-white">
                {dict.restrictions.levelRestricted}
              </Badge>
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
      header: dict.amlFlags.colFlagged,
      cell: ({ row }) => formatDate(row.original.createdAt, dict.common.dateLocale),
    },
  ];
  if (canManage) {
    columns.push({
      id: "actions",
      header: () => <div className="text-right">{dict.common.actions}</div>,
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
    });
  }
  return columns;
}

export function AmlFlagsTable({
  data,
  canManage,
}: {
  data: AmlFlag[];
  canManage: boolean;
}) {
  const dict = useDict();
  const columns = useMemo(() => buildColumns(dict, canManage), [dict, canManage]);
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder={dict.amlFlags.search}
      emptyMessage={dict.amlFlags.empty}
    />
  );
}
