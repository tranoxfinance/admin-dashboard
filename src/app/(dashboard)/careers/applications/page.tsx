import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { getDict } from "@/lib/i18n/server";
import type { JobApplicationRow, JobOpeningRow } from "@/lib/types";
import { ApplicationsTable } from "./applications-table";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string; status?: string }>;
}) {
  const session = await getSession();
  const role = session?.role;
  if (!role || !["super_admin", "admin", "viewer", "hr"].includes(role)) {
    redirect("/");
  }
  const canManage = role === "super_admin" || role === "hr";
  const params = await searchParams;
  const dict = await getDict();
  const query = new URLSearchParams();
  if (params.jobId) query.set("jobId", params.jobId);
  if (params.status) query.set("status", params.status);
  const queryString = query.toString();

  const [applications, jobs] = await Promise.all([
    adminApi<JobApplicationRow[]>(
      `/admin/careers/applications${queryString ? `?${queryString}` : ""}`,
    ),
    adminApi<JobOpeningRow[]>("/admin/careers/jobs"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          {dict.careers.applicationsTitle}
        </h1>
        <p className="text-sm text-muted-foreground">
          {dict.careers.applicationsSubtitle(applications.length)}
        </p>
      </div>

      <ApplicationsTable
        data={applications}
        jobs={jobs.map((job) => ({ id: job.id, title: job.title }))}
        activeJobId={params.jobId}
        activeStatus={params.status}
        canManage={canManage}
      />
    </div>
  );
}
