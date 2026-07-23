"use client";

import { useMemo, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { updateJobAction } from "@/actions/admin";
import { formatDate } from "@/lib/format";
import { describeApiError } from "@/lib/i18n";
import type { Dict } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import type { JobOpeningRow, JobStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobDialog } from "./job-dialog";

const JOB_STATUSES: JobStatus[] = ["draft", "open", "closed"];

function StatusBadge({ status, dict }: { status: JobStatus; dict: Dict }) {
  if (status === "open") {
    return <Badge className="bg-green text-white">{dict.careers.statuses.open}</Badge>;
  }
  if (status === "draft") {
    return <Badge variant="secondary">{dict.careers.statuses.draft}</Badge>;
  }
  return <Badge variant="outline">{dict.careers.statuses.closed}</Badge>;
}

function JobRowActions({ job }: { job: JobOpeningRow }) {
  const [isPending, startTransition] = useTransition();
  const dict = useDict();

  function setStatus(status: JobStatus) {
    startTransition(async () => {
      const result = await updateJobAction(job.id, { status });
      if (result.ok) {
        toast.success(dict.careers.jobUpdatedToast);
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Select
        value={job.status}
        onValueChange={(value) => {
          if (value && value !== job.status) {
            setStatus(value as JobStatus);
          }
        }}
      >
        <SelectTrigger className="h-8 w-28" disabled={isPending}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {JOB_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {dict.careers.statuses[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <JobDialog job={job} />
    </div>
  );
}

function buildColumns(dict: Dict, canManage: boolean): ColumnDef<JobOpeningRow>[] {
  const columns: ColumnDef<JobOpeningRow>[] = [
    {
      accessorKey: "title",
      header: dict.careers.colRole,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.title}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.department} · {row.original.location}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "employmentType",
      header: dict.careers.colType,
      cell: ({ row }) => dict.careers.employmentTypes[row.original.employmentType],
    },
    {
      accessorKey: "status",
      header: dict.common.status,
      cell: ({ row }) => <StatusBadge status={row.original.status} dict={dict} />,
    },
    {
      accessorKey: "applicationCount",
      header: dict.careers.colApplications,
      cell: ({ row }) => row.original.applicationCount.toLocaleString(),
    },
    {
      accessorKey: "publishedAt",
      header: dict.careers.colPublished,
      cell: ({ row }) =>
        row.original.publishedAt
          ? formatDate(row.original.publishedAt, dict.common.dateLocale)
          : "—",
    },
  ];
  if (canManage) {
    columns.push({
      id: "actions",
      header: () => <div className="text-right">{dict.common.actions}</div>,
      cell: ({ row }) => <JobRowActions job={row.original} />,
    });
  }
  return columns;
}

export function JobsTable({
  data,
  canManage,
}: {
  data: JobOpeningRow[];
  canManage: boolean;
}) {
  const dict = useDict();
  const columns = useMemo(() => buildColumns(dict, canManage), [dict, canManage]);
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder={dict.careers.searchJobs}
      emptyMessage={dict.careers.emptyJobs}
    />
  );
}
