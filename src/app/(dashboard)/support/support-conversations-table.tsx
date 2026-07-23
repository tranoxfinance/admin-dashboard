"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import type {
  SupportConversationRow,
  SupportConversationStatus,
} from "@/lib/types";
import type { Dict } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";

const STATUS_VARIANT: Record<
  SupportConversationStatus,
  "secondary" | "destructive" | "outline" | "default"
> = {
  bot: "outline",
  pending_agent: "destructive",
  active: "default",
  resolved: "secondary",
  closed: "secondary",
};

function statusLabel(dict: Dict, status: SupportConversationStatus): string {
  const labels: Record<SupportConversationStatus, string> = {
    bot: dict.support.statusBot,
    pending_agent: dict.support.statusPendingAgent,
    active: dict.support.statusActive,
    resolved: dict.support.statusResolved,
    closed: dict.support.statusClosed,
  };
  return labels[status];
}

function buildColumns(dict: Dict): ColumnDef<SupportConversationRow>[] {
  return [
    {
      id: "user",
      header: dict.support.colUser,
      cell: ({ row }) => {
        const user = row.original.user;
        if (!user) {
          return (
            <span className="text-muted-foreground">
              {dict.common.unknownUser}
            </span>
          );
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
      id: "topic",
      header: dict.support.colTopic,
      cell: ({ row }) => {
        const conversation = row.original;
        if (conversation.kind !== "ticket") {
          return (
            <span className="text-muted-foreground">
              {dict.support.liveChat}
            </span>
          );
        }
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {conversation.subject ?? dict.support.untitledTicket}
            </span>
            <span className="text-xs text-muted-foreground">
              {conversation.reference}
              {conversation.category
                ? ` · ${dict.support.categories[conversation.category]}`
                : ""}
            </span>
          </div>
        );
      },
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
      accessorKey: "lastMessageAt",
      header: dict.support.colLastMessage,
      cell: ({ row }) =>
        row.original.lastMessageAt
          ? formatDate(row.original.lastMessageAt, dict.common.dateLocale)
          : formatDate(row.original.createdAt, dict.common.dateLocale),
    },
  ];
}

export function SupportConversationsTable({
  data,
}: {
  data: SupportConversationRow[];
}) {
  const router = useRouter();
  const dict = useDict();
  const columns = useMemo(() => buildColumns(dict), [dict]);
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder={dict.support.search}
      emptyMessage={dict.support.empty}
      onRowClick={(row) => router.push(`/support/${row.id}`)}
    />
  );
}
