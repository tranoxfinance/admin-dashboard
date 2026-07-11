"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import type { AdminAccountRow } from "@/lib/types";
import type { Dict } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { AdminRowActions } from "./admin-row-actions";

function buildColumns(
  dict: Dict,
  currentAdminId: string,
): ColumnDef<AdminAccountRow>[] {
  return [
    {
      accessorKey: "email",
      header: dict.admins.colEmail,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.email}</span>
          {row.original.id === currentAdminId ? (
            <Badge variant="secondary">{dict.admins.you}</Badge>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: dict.admins.colRole,
      cell: ({ row }) =>
        row.original.role === "super_admin" ? (
          <Badge className="bg-primary text-primary-foreground">
            {dict.admins.roles[row.original.role]}
          </Badge>
        ) : (
          <Badge variant="outline">{dict.admins.roles[row.original.role]}</Badge>
        ),
    },
    {
      accessorKey: "totpEnabled",
      header: dict.admins.colTwoFactor,
      cell: ({ row }) =>
        row.original.totpEnabled ? (
          <Badge variant="secondary">{dict.admins.twoFactorEnabled}</Badge>
        ) : (
          <Badge variant="outline">{dict.admins.twoFactorPending}</Badge>
        ),
    },
    {
      accessorKey: "isActive",
      header: dict.common.status,
      cell: ({ row }) =>
        row.original.isActive ? (
          <Badge className="bg-green text-white">
            {dict.admins.statusActive}
          </Badge>
        ) : (
          <Badge variant="destructive">{dict.admins.statusDisabled}</Badge>
        ),
    },
    {
      accessorKey: "lastLoginAt",
      header: dict.admins.colLastLogin,
      cell: ({ row }) =>
        row.original.lastLoginAt
          ? formatDate(row.original.lastLoginAt, dict.common.dateLocale)
          : dict.admins.never,
    },
    {
      accessorKey: "createdAt",
      header: dict.admins.colCreated,
      cell: ({ row }) =>
        formatDate(row.original.createdAt, dict.common.dateLocale),
    },
    {
      id: "actions",
      header: () => <div className="text-right">{dict.common.actions}</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.id === currentAdminId ? null : (
            <AdminRowActions admin={row.original} />
          )}
        </div>
      ),
    },
  ];
}

export function AdminsTable({
  data,
  currentAdminId,
}: {
  data: AdminAccountRow[];
  currentAdminId: string;
}) {
  const dict = useDict();
  const columns = useMemo(
    () => buildColumns(dict, currentAdminId),
    [dict, currentAdminId],
  );
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder={dict.admins.search}
      emptyMessage={dict.admins.empty}
    />
  );
}
