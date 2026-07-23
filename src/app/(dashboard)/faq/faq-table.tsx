"use client";

import { useMemo, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteFaqAction } from "@/actions/admin";
import { formatDate } from "@/lib/format";
import { describeApiError } from "@/lib/i18n";
import type { Dict } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import type { FaqRow } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { FaqDialog } from "./faq-dialog";

function PublishedBadge({ faq, dict }: { faq: FaqRow; dict: Dict }) {
  if (faq.isPublished) {
    return (
      <Badge className="bg-green text-white">{dict.faq.publishedBadge}</Badge>
    );
  }
  return <Badge variant="secondary">{dict.faq.hiddenBadge}</Badge>;
}

function FaqRowActions({ faq }: { faq: FaqRow }) {
  const [isPending, startTransition] = useTransition();
  const dict = useDict();

  function handleDelete() {
    if (!window.confirm(dict.faq.deleteConfirm)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteFaqAction(faq.id);
      if (result.ok) {
        toast.success(dict.faq.deletedToast);
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <FaqDialog faq={faq} />
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={dict.faq.delete}
        disabled={isPending}
        onClick={handleDelete}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}

function buildColumns(dict: Dict, canManage: boolean): ColumnDef<FaqRow>[] {
  const columns: ColumnDef<FaqRow>[] = [
    {
      accessorKey: "question",
      header: dict.faq.colQuestion,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.question}</span>
          <span className="line-clamp-1 text-xs text-muted-foreground">
            {row.original.answer}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "sortOrder",
      header: dict.faq.colOrder,
      cell: ({ row }) => row.original.sortOrder,
    },
    {
      accessorKey: "isPublished",
      header: dict.common.status,
      cell: ({ row }) => <PublishedBadge faq={row.original} dict={dict} />,
    },
    {
      accessorKey: "updatedAt",
      header: dict.faq.colUpdated,
      cell: ({ row }) =>
        formatDate(row.original.updatedAt, dict.common.dateLocale),
    },
  ];
  if (canManage) {
    columns.push({
      id: "actions",
      header: () => <div className="text-right">{dict.common.actions}</div>,
      cell: ({ row }) => <FaqRowActions faq={row.original} />,
    });
  }
  return columns;
}

export function FaqsTable({
  data,
  canManage,
}: {
  data: FaqRow[];
  canManage: boolean;
}) {
  const dict = useDict();
  const columns = useMemo(() => buildColumns(dict, canManage), [dict, canManage]);
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder={dict.faq.search}
      emptyMessage={dict.faq.empty}
    />
  );
}
