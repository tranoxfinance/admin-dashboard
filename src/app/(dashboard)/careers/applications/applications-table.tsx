"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Dict } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import type { ApplicationStatus, JobApplicationRow } from "@/lib/types";
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
import { ApplicationDetailDialog } from "./application-detail-dialog";

const STATUS_FILTERS: (ApplicationStatus | "all")[] = [
  "all",
  "submitted",
  "interview",
  "rejected",
  "hired",
];

export function ApplicationStatusBadge({
  status,
  dict,
}: {
  status: ApplicationStatus;
  dict: Dict;
}) {
  const label = dict.careers.applicationStatuses[status];
  if (status === "submitted") {
    return <Badge variant="secondary">{label}</Badge>;
  }
  if (status === "interview") {
    return <Badge className="bg-primary text-primary-foreground">{label}</Badge>;
  }
  if (status === "hired") {
    return <Badge className="bg-green text-white">{label}</Badge>;
  }
  return <Badge variant="destructive">{label}</Badge>;
}

function buildColumns(
  dict: Dict,
  onView: (application: JobApplicationRow) => void,
): ColumnDef<JobApplicationRow>[] {
  return [
    {
      accessorKey: "reference",
      header: dict.careers.colReference,
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.reference}</span>
      ),
    },
    {
      accessorKey: "fullName",
      header: dict.careers.colCandidate,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.fullName}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.email}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "jobTitle",
      header: dict.careers.colRole,
    },
    {
      accessorKey: "status",
      header: dict.common.status,
      cell: ({ row }) => (
        <ApplicationStatusBadge status={row.original.status} dict={dict} />
      ),
    },
    {
      accessorKey: "createdAt",
      header: dict.careers.colApplied,
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
            aria-label={dict.careers.viewApplication}
            onClick={() => onView(row.original)}
          >
            <Eye className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}

export function ApplicationsTable({
  data,
  jobs,
  activeJobId,
  activeStatus,
  canManage,
}: {
  data: JobApplicationRow[];
  jobs: { id: string; title: string }[];
  activeJobId?: string;
  activeStatus?: string;
  canManage: boolean;
}) {
  const dict = useDict();
  const router = useRouter();
  const [selected, setSelected] = useState<JobApplicationRow | null>(null);

  function applyFilter(jobId: string, status: string) {
    const query = new URLSearchParams();
    if (jobId !== "all") query.set("jobId", jobId);
    if (status !== "all") query.set("status", status);
    const queryString = query.toString();
    router.push(`/careers/applications${queryString ? `?${queryString}` : ""}`);
  }

  const columns = useMemo(
    () => buildColumns(dict, (application) => setSelected(application)),
    [dict],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={activeJobId ?? "all"}
          onValueChange={(value) => {
            if (value) applyFilter(value, activeStatus ?? "all");
          }}
        >
          <SelectTrigger className="h-8 w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{dict.careers.filterAllRoles}</SelectItem>
            {jobs.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={activeStatus ?? "all"}
          onValueChange={(value) => {
            if (value) applyFilter(activeJobId ?? "all", value);
          }}
        >
          <SelectTrigger className="h-8 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((status) => (
              <SelectItem key={status} value={status}>
                {status === "all"
                  ? dict.careers.filterAllStatuses
                  : dict.careers.applicationStatuses[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder={dict.careers.searchApplications}
        emptyMessage={dict.careers.emptyApplications}
      />

      {selected ? (
        <ApplicationDetailDialog
          application={selected}
          canManage={canManage}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}
