"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import type { AccountRestrictionRow } from "@/lib/types";
import type { Dict } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { RestrictionActions } from "./restriction-actions";

function buildColumns(
  dict: Dict,
  canManage: boolean,
): ColumnDef<AccountRestrictionRow>[] {
  const columns: ColumnDef<AccountRestrictionRow>[] = [
    {
      accessorKey: "reference",
      header: dict.restrictions.colReference,
      cell: ({ row }) => (
        <span className="font-medium">{row.original.reference}</span>
      ),
    },
    {
      id: "user",
      header: dict.restrictions.colUser,
      accessorFn: (row) =>
        [row.user?.firstName, row.user?.lastName, row.user?.phone]
          .filter(Boolean)
          .join(" "),
      cell: ({ row }) => {
        const user = row.original.user;
        if (!user) {
          return "—";
        }
        const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
        return (
          <div className="flex flex-col">
            <span>{name || "—"}</span>
            <span className="text-xs text-muted-foreground">{user.phone}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "level",
      header: dict.restrictions.colLevel,
      cell: ({ row }) =>
        row.original.level === "suspended" ? (
          <Badge variant="destructive">
            {dict.restrictions.levelSuspended}
          </Badge>
        ) : (
          <Badge className="bg-amber-500 text-white">
            {dict.restrictions.levelRestricted}
          </Badge>
        ),
    },
    {
      accessorKey: "reason",
      header: dict.restrictions.colReason,
      cell: ({ row }) =>
        dict.restrictions.reasons[row.original.reason] ?? row.original.reason,
    },
    {
      accessorKey: "source",
      header: dict.restrictions.colSource,
      cell: ({ row }) =>
        row.original.source === "aml_auto"
          ? dict.restrictions.sourceAuto
          : dict.restrictions.sourceManual,
    },
    {
      accessorKey: "status",
      header: dict.common.status,
      cell: ({ row }) =>
        row.original.status === "active" ? (
          <Badge variant="destructive">{dict.restrictions.statusActive}</Badge>
        ) : (
          <Badge variant="outline">{dict.restrictions.statusLifted}</Badge>
        ),
    },
    {
      id: "appeal",
      header: dict.restrictions.colAppeal,
      accessorFn: (row) => row.appeal?.status ?? "",
      cell: ({ row }) => {
        const appeal = row.original.appeal;
        if (!appeal) {
          return "—";
        }
        return (
          <Badge variant="secondary">
            {dict.restrictions.appealStatus[appeal.status] ?? appeal.status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: dict.restrictions.colCreated,
      cell: ({ row }) => formatDate(row.original.createdAt, dict.common.dateLocale),
    },
  ];
  if (canManage) {
    columns.push({
      id: "actions",
      header: () => <div className="text-right">{dict.common.actions}</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.status === "active" ? (
            <RestrictionActions
              restrictionId={row.original.id}
              level={row.original.level}
            />
          ) : null}
        </div>
      ),
    });
  }
  return columns;
}

export function RestrictionsTable({
  data,
  canManage,
}: {
  data: AccountRestrictionRow[];
  canManage: boolean;
}) {
  const dict = useDict();
  const columns = useMemo(() => buildColumns(dict, canManage), [dict, canManage]);
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder={dict.restrictions.searchRestrictions}
      emptyMessage={dict.restrictions.emptyRestrictions}
    />
  );
}
