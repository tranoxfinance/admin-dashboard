"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { MessageSquareText } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { RestrictionAppealRow } from "@/lib/types";
import type { Dict } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
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

function buildColumns(
  dict: Dict,
  canManage: boolean,
): ColumnDef<RestrictionAppealRow>[] {
  return [
    {
      id: "reference",
      header: dict.restrictions.colRestriction,
      accessorFn: (row) => row.restriction?.reference ?? "",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.restriction?.reference ?? "—"}
        </span>
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
      accessorKey: "statement",
      header: dict.restrictions.colStatement,
      cell: ({ row }) => (
        <span
          className="block max-w-md truncate"
          title={row.original.statement}
        >
          {row.original.statement}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: dict.common.status,
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANT[row.original.status]}>
          {dict.restrictions.appealStatus[row.original.status] ??
            row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: dict.restrictions.colSubmitted,
      cell: ({ row }) => formatDate(row.original.createdAt, dict.common.dateLocale),
    },
    {
      id: "actions",
      header: () => <div className="text-right">{dict.common.actions}</div>,
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
              {dict.restrictions.openThread}
            </Button>
          ) : null}
          {canManage && row.original.status === "pending" ? (
            <AppealReviewActions appealId={row.original.id} />
          ) : null}
        </div>
      ),
    },
  ];
}

export function AppealsTable({
  data,
  canManage,
}: {
  data: RestrictionAppealRow[];
  canManage: boolean;
}) {
  const dict = useDict();
  const columns = useMemo(() => buildColumns(dict, canManage), [dict, canManage]);
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder={dict.restrictions.searchAppeals}
      emptyMessage={dict.restrictions.emptyAppeals}
    />
  );
}
