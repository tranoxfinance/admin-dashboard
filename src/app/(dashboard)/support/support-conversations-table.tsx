"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import type { SupportConversationRow, SupportConversationStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";

const STATUS_VARIANT: Record<
  SupportConversationStatus,
  "secondary" | "destructive" | "outline" | "default"
> = {
  bot: "outline",
  pending_agent: "destructive",
  active: "default",
  closed: "secondary",
};

const STATUS_LABEL: Record<SupportConversationStatus, string> = {
  bot: "Bot handling",
  pending_agent: "Needs agent",
  active: "Active",
  closed: "Closed",
};

const columns: ColumnDef<SupportConversationRow>[] = [
  {
    id: "user",
    header: "User",
    cell: ({ row }) => {
      const user = row.original.user;
      if (!user) {
        return <span className="text-muted-foreground">Unknown user</span>;
      }
      const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
      return (
        <div className="flex flex-col">
          <span className="font-medium">{name || user.phone}</span>
          <span className="text-xs text-muted-foreground">{user.phone}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={STATUS_VARIANT[row.original.status]}>
        {STATUS_LABEL[row.original.status]}
      </Badge>
    ),
  },
  {
    accessorKey: "lastMessageAt",
    header: "Last message",
    cell: ({ row }) =>
      row.original.lastMessageAt
        ? formatDate(row.original.lastMessageAt)
        : formatDate(row.original.createdAt),
  },
];

export function SupportConversationsTable({
  data,
}: {
  data: SupportConversationRow[];
}) {
  const router = useRouter();
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search by name or phone…"
      emptyMessage="No conversations found."
      onRowClick={(row) => router.push(`/support/${row.id}`)}
    />
  );
}
