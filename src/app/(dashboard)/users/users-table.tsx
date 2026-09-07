"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import type { AdminUserRow } from "@/lib/types";
import type { Dict } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { UserNotifyDialog } from "./user-notify-dialog";
import { UserRestrictDialog } from "./user-restrict-dialog";
import { UserStatusToggle } from "./user-status-toggle";

function buildColumns(
  dict: Dict,
  canManage: boolean,
): ColumnDef<AdminUserRow>[] {
  const columns: ColumnDef<AdminUserRow>[] = [
    {
      id: "name",
      header: dict.users.colName,
      accessorFn: (row) =>
        [row.firstName, row.lastName].filter(Boolean).join(" "),
      cell: ({ row }) => {
        const name = [row.original.firstName, row.original.lastName]
          .filter(Boolean)
          .join(" ");
        return (
          <Link
            href={`/users/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            {name || row.original.phone}
          </Link>
        );
      },
    },
    {
      accessorKey: "phone",
      header: dict.users.colPhone,
      cell: ({ row }) => (
        <span className="font-medium">{row.original.phone}</span>
      ),
    },
    {
      accessorKey: "email",
      header: dict.users.colEmail,
      cell: ({ row }) => row.original.email ?? "—",
    },
    {
      accessorKey: "country",
      header: dict.users.colCountry,
    },
    {
      accessorKey: "kycTier",
      header: dict.users.colKycTier,
      cell: ({ row }) => dict.users.tier(row.original.kycTier),
    },
    {
      id: "status",
      header: dict.common.status,
      accessorFn: (row) =>
        row.restrictionLevel === "suspended"
          ? dict.users.statusSuspended
          : row.restrictionLevel === "restricted"
            ? dict.users.statusRestricted
            : row.isLocked
              ? dict.users.statusLocked
              : row.isActive
                ? dict.users.statusActive
                : row.closedAt
                  ? dict.users.statusClosed
                  : dict.users.statusInactive,
      cell: ({ row }) => {
        const user = row.original;
        if (user.restrictionLevel === "suspended") {
          return (
            <Badge variant="destructive">{dict.users.statusSuspended}</Badge>
          );
        }
        if (user.restrictionLevel === "restricted") {
          return (
            <Badge className="bg-amber-500 text-white">
              {dict.users.statusRestricted}
            </Badge>
          );
        }
        if (user.isLocked) {
          return <Badge variant="destructive">{dict.users.statusLocked}</Badge>;
        }
        if (user.isActive) {
          return (
            <Badge className="bg-green text-white">
              {dict.users.statusActive}
            </Badge>
          );
        }
        if (user.closedAt) {
          return (
            <div className="flex flex-col gap-0.5">
              <Badge variant="outline">{dict.users.statusClosed}</Badge>
              {user.retentionPurgeAt ? (
                <span className="text-xs text-muted-foreground">
                  {dict.users.retainedUntil(
                    formatDate(user.retentionPurgeAt, dict.common.dateLocale),
                  )}
                </span>
              ) : null}
            </div>
          );
        }
        return <Badge variant="outline">{dict.users.statusInactive}</Badge>;
      },
    },
    {
      accessorKey: "gender",
      header: dict.users.colGender,
      cell: ({ row }) => {
        const gender = row.original.gender;
        if (gender === "male") return dict.users.genderMale;
        if (gender === "female") return dict.users.genderFemale;
        return "—";
      },
    },
    {
      accessorKey: "dateOfBirth",
      header: dict.users.colDob,
      cell: ({ row }) =>
        row.original.dateOfBirth
          ? formatDate(row.original.dateOfBirth, dict.common.dateLocale)
          : "—",
    },
    {
      accessorKey: "createdAt",
      header: dict.users.colJoined,
      cell: ({ row }) => formatDate(row.original.createdAt, dict.common.dateLocale),
    },
  ];
  if (canManage) {
    columns.push({
      id: "actions",
      header: () => <div className="text-right">{dict.common.actions}</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <UserNotifyDialog userId={row.original.id} />
          {row.original.restrictionLevel === null ? (
            <UserRestrictDialog userId={row.original.id} />
          ) : null}
          <UserStatusToggle
            userId={row.original.id}
            isActive={row.original.isActive}
          />
        </div>
      ),
    });
  }
  return columns;
}

export function UsersTable({
  data,
  canManage,
}: {
  data: AdminUserRow[];
  canManage: boolean;
}) {
  const dict = useDict();
  const columns = useMemo(() => buildColumns(dict, canManage), [dict, canManage]);
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder={dict.users.search}
      emptyMessage={dict.users.empty}
    />
  );
}
