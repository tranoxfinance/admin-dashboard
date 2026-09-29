"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Dict } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import type { EddStatus, EddSubmissionRow } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EddDetailDialog } from "./edd-detail-dialog";

const STATUS_FILTERS: (EddStatus | "all")[] = [
  "all",
  "pending",
  "approved",
  "rejected",
];

export function EddStatusBadge({
  status,
  dict,
}: {
  status: EddStatus;
  dict: Dict;
}) {
  const label = dict.edd.statuses[status];
  if (status === "pending") {
    return <Badge variant="secondary">{label}</Badge>;
  }
  if (status === "approved") {
    return <Badge className="bg-green text-white">{label}</Badge>;
  }
  return <Badge variant="destructive">{label}</Badge>;
}

export function formatVolume(amount: string, currency: string, locale: string) {
  return `${Number(amount).toLocaleString(locale)} ${currency}`;
}

function buildColumns(
  dict: Dict,
  onView: (submission: EddSubmissionRow) => void,
): ColumnDef<EddSubmissionRow>[] {
  return [
    {
      id: "user",
      accessorFn: (row) =>
        [row.userName, row.userPhone, row.occupation].filter(Boolean).join(" "),
      header: dict.edd.colUser,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.userName ?? "—"}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.userPhone} · {row.original.occupation}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "sourceOfFunds",
      header: dict.edd.colSource,
      cell: ({ row }) =>
        dict.edd.sources[row.original.sourceOfFunds] ??
        row.original.sourceOfFunds,
    },
    {
      accessorKey: "expectedMonthlyVolume",
      header: dict.edd.colVolume,
      cell: ({ row }) =>
        formatVolume(
          row.original.expectedMonthlyVolume,
          row.original.volumeCurrency,
          dict.common.dateLocale,
        ),
    },
    {
      accessorKey: "status",
      header: dict.common.status,
      cell: ({ row }) => (
        <EddStatusBadge status={row.original.status} dict={dict} />
      ),
    },
    {
      accessorKey: "createdAt",
      header: dict.edd.colSubmitted,
      cell: ({ row }) =>
        formatDate(row.original.createdAt, dict.common.dateLocale),
    },
    {
      id: "actions",
      header: () => <div className="text-right">{dict.common.actions}</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={dict.edd.view}
            onClick={() => onView(row.original)}
          >
            <Eye className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}

export function EddTable({
  data,
  activeStatus,
  canDecide,
}: {
  data: EddSubmissionRow[];
  activeStatus?: string;
  canDecide: boolean;
}) {
  const dict = useDict();
  const router = useRouter();
  const [selected, setSelected] = useState<EddSubmissionRow | null>(null);

  const columns = useMemo(
    () => buildColumns(dict, (submission) => setSelected(submission)),
    [dict],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={activeStatus ?? "all"}
          onValueChange={(value) => {
            if (value) {
              router.push(value === "all" ? "/edd" : `/edd?status=${value}`);
            }
          }}
        >
          <SelectTrigger className="h-8 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((status) => (
              <SelectItem key={status} value={status}>
                {status === "all"
                  ? dict.edd.filterAll
                  : dict.edd.statuses[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder={dict.edd.search}
        emptyMessage={dict.edd.empty}
      />

      {selected ? (
        <EddDetailDialog
          submission={selected}
          canDecide={canDecide}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}
