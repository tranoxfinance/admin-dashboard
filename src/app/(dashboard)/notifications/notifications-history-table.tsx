"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import type { AdminNotificationRow } from "@/lib/types";
import type { Dict } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";

function buildColumns(dict: Dict): ColumnDef<AdminNotificationRow>[] {
  return [
    {
      accessorKey: "targetType",
      header: dict.notifications.colTarget,
      cell: ({ row }) =>
        row.original.targetType === "broadcast" ? (
          <Badge variant="secondary">{dict.notifications.targetBroadcast}</Badge>
        ) : (
          <Badge variant="outline">{dict.notifications.targetUser}</Badge>
        ),
    },
    {
      accessorKey: "title",
      header: dict.notifications.colTitle,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.title}</span>
          <span className="max-w-xs truncate text-xs text-muted-foreground">
            {row.original.body}
          </span>
        </div>
      ),
    },
    {
      id: "channels",
      header: dict.notifications.colChannels,
      accessorFn: (row) => row.channels.join(", "),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.channels.map((channel) => (
            <Badge key={channel} variant="outline">
              {channel}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "recipientCount",
      header: dict.notifications.colRecipients,
      cell: ({ row }) => row.original.recipientCount.toLocaleString(),
    },
    {
      accessorKey: "status",
      header: dict.notifications.colStatus,
      cell: ({ row }) => {
        const status = row.original.status;
        if (status === "sent") {
          return <Badge className="bg-green text-white">{dict.notifications.statusSent}</Badge>;
        }
        if (status === "failed") {
          return <Badge variant="destructive">{dict.notifications.statusFailed}</Badge>;
        }
        return <Badge variant="outline">{dict.notifications.statusQueued}</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: dict.notifications.colSent,
      cell: ({ row }) => formatDate(row.original.createdAt, dict.common.dateLocale),
    },
  ];
}

export function NotificationsHistoryTable({
  data,
}: {
  data: AdminNotificationRow[];
}) {
  const dict = useDict();
  const columns = useMemo(() => buildColumns(dict), [dict]);
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder={dict.notifications.titleLabel}
      emptyMessage={dict.notifications.empty}
    />
  );
}
