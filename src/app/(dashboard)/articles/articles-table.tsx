"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Dict } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import type { ArticleRow, ArticleStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";

export function ArticleStatusBadge({
  status,
  dict,
}: {
  status: ArticleStatus;
  dict: Dict;
}) {
  const label = dict.articles.statuses[status];
  if (status === "published") {
    return <Badge className="bg-green text-white">{label}</Badge>;
  }
  if (status === "draft") {
    return <Badge variant="secondary">{label}</Badge>;
  }
  return <Badge variant="outline">{label}</Badge>;
}

function buildColumns(dict: Dict): ColumnDef<ArticleRow>[] {
  return [
    {
      accessorKey: "title",
      header: dict.articles.colTitle,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.title}</span>
          <span className="text-xs text-muted-foreground">
            /{row.original.slug}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: dict.articles.colCategory,
      cell: ({ row }) => dict.articles.categories[row.original.category],
    },
    {
      accessorKey: "status",
      header: dict.common.status,
      cell: ({ row }) => (
        <ArticleStatusBadge status={row.original.status} dict={dict} />
      ),
    },
    {
      accessorKey: "publishedAt",
      header: dict.articles.colPublished,
      cell: ({ row }) =>
        row.original.publishedAt
          ? formatDate(row.original.publishedAt, dict.common.dateLocale)
          : "—",
    },
    {
      accessorKey: "updatedAt",
      header: dict.articles.colUpdated,
      cell: ({ row }) =>
        formatDate(row.original.updatedAt, dict.common.dateLocale),
    },
    {
      id: "actions",
      header: () => <div className="text-right">{dict.common.actions}</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="icon-sm"
            nativeButton={false}
            aria-label={dict.articles.openArticle}
            render={<Link href={`/articles/${row.original.id}`} />}
          >
            <ArrowUpRight className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}

export function ArticlesTable({ data }: { data: ArticleRow[] }) {
  const dict = useDict();
  const columns = useMemo(() => buildColumns(dict), [dict]);
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder={dict.articles.search}
      emptyMessage={dict.articles.empty}
    />
  );
}
