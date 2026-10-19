"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import type { EmailCampaignRow } from "@/lib/types";
import type { Dict } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";

function buildColumns(dict: Dict): ColumnDef<EmailCampaignRow>[] {
  const t = dict.emailCampaigns;
  return [
    {
      accessorKey: "subject",
      header: t.colSubject,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.subject}</span>
          <span className="max-w-xs truncate text-xs text-muted-foreground">
            {(row.original.versions.en ?? row.original.versions.fr)?.content
              .headline ?? ""}
          </span>
        </div>
      ),
    },
    {
      id: "audience",
      header: t.colAudience,
      accessorFn: (row) =>
        `${row.locales.join(" ")} ${row.audienceCountry ?? ""}`,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.locales.map((locale) => (
            <Badge key={locale} variant="outline">
              {locale === "fr" ? t.languageFr : t.languageEn}
            </Badge>
          ))}
          <Badge variant="outline">
            {row.original.audienceCountry === "NG"
              ? t.countryNg
              : row.original.audienceCountry === "CI"
                ? t.countryCi
                : t.countryAll}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "recipientCount",
      header: t.colRecipients,
      cell: ({ row }) => row.original.recipientCount.toLocaleString(),
    },
    {
      accessorKey: "sentCount",
      header: t.colDelivered,
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.original.sentCount.toLocaleString()}
          {row.original.failedCount ? (
            <span className="text-destructive">
              {" "}
              / {row.original.failedCount.toLocaleString()}
            </span>
          ) : null}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: t.colStatus,
      cell: ({ row }) => {
        const status = row.original.status;
        if (status === "sent") {
          return <Badge variant="success">{t.statusSent}</Badge>;
        }
        if (status === "failed") {
          return <Badge variant="destructive">{t.statusFailed}</Badge>;
        }
        if (status === "sending") {
          return <Badge variant="info">{t.statusSending}</Badge>;
        }
        return <Badge variant="outline">{t.statusQueued}</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: t.colCreated,
      cell: ({ row }) =>
        formatDate(row.original.createdAt, dict.common.dateLocale),
    },
  ];
}

export function CampaignsHistoryTable({ data }: { data: EmailCampaignRow[] }) {
  const dict = useDict();
  const columns = useMemo(() => buildColumns(dict), [dict]);
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder={dict.emailCampaigns.colSubject}
      emptyMessage={dict.emailCampaigns.empty}
    />
  );
}
