"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { MessageSquareText } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { RestrictionAppealRow } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { AppealReviewActions } from "./appeal-review-actions";

const STATUS_VARIANT: Record<
  RestrictionAppealRow["status"],
  "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  approved: "outline",
  rejected: "destructive",
};

const columns: ColumnDef<RestrictionAppealRow>[] = [
  {
    id: "reference",
    header: "Restriction",
    accessorFn: (row) => row.restriction?.reference ?? "",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.restriction?.reference ?? "—"}
      </span>
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
    accessorKey: "statement",
    header: "Statement",
    cell: ({ row }) => (
      <span className="block max-w-md truncate" title={row.original.statement}>
        {row.original.statement}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={STATUS_VARIANT[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Submitted",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2">
        {row.original.conversationId ? (
          <Button
            size="sm"
            variant="ghost"
            nativeButton={false}
            render={<Link href={`/support/${row.original.conversationId}`} />}
          >
            <MessageSquareText className="size-3.5" />
            Open thread
          </Button>
        ) : null}
        {row.original.status === "pending" ? (
          <AppealReviewActions appealId={row.original.id} />
        ) : null}
      </div>
    ),
  },
];

export function AppealsTable({ data }: { data: RestrictionAppealRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search by reference, user, status…"
      emptyMessage="No appeals found."
    />
  );
}
