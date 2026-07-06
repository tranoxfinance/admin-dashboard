"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import type { AdminUserRow } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { UserStatusToggle } from "./user-status-toggle";

const columns: ColumnDef<AdminUserRow>[] = [
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
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email ?? "—",
  },
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    accessorKey: "kycTier",
    header: "KYC Tier",
    cell: ({ row }) => `Tier ${row.original.kycTier}`,
  },
  {
    id: "status",
    header: "Status",
    accessorFn: (row) =>
      row.isLocked ? "Locked" : row.isActive ? "Active" : "Inactive",
    cell: ({ row }) => {
      const user = row.original;
      if (user.isLocked) {
        return <Badge variant="destructive">Locked</Badge>;
      }
      return user.isActive ? (
        <Badge className="bg-green text-white">Active</Badge>
      ) : (
        <Badge variant="outline">Inactive</Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <UserStatusToggle
          userId={row.original.id}
          isActive={row.original.isActive}
        />
      </div>
    ),
  },
];

export function UsersTable({ data }: { data: AdminUserRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search by name, phone, email, country…"
      emptyMessage="No users found."
    />
  );
}
