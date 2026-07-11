"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import type { AccountRestrictionRow } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { RESTRICTION_REASON_LABELS } from "./restriction-labels";
import { RestrictionActions } from "./restriction-actions";

const columns: ColumnDef<AccountRestrictionRow>[] = [
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.reference}</span>
    ),
  },
  {
    id: "user",
    header: "User",
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
    header: "Level",
    cell: ({ row }) =>
      row.original.level === "suspended" ? (
        <Badge variant="destructive">Suspended</Badge>
      ) : (
        <Badge className="bg-amber-500 text-white">Restricted</Badge>
      ),
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => RESTRICTION_REASON_LABELS[row.original.reason],
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) =>
      row.original.source === "aml_auto" ? "AML auto" : "Manual",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      row.original.status === "active" ? (
        <Badge variant="destructive">Active</Badge>
      ) : (
        <Badge variant="outline">Lifted</Badge>
      ),
  },
  {
    id: "appeal",
    header: "Appeal",
    accessorFn: (row) => row.appeal?.status ?? "",
    cell: ({ row }) => {
      const appeal = row.original.appeal;
      if (!appeal) {
        return "—";
      }
      return <Badge variant="secondary">{appeal.status}</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
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
  },
];

export function RestrictionsTable({
  data,
}: {
  data: AccountRestrictionRow[];
}) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search by reference, user, level…"
      emptyMessage="No restrictions found."
    />
  );
}
