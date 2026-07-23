import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { getDict } from "@/lib/i18n/server";
import type { JobApplicationRow, JobOpeningRow, Paginated } from "@/lib/types";
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
  const query = new URLSearchParams({ page: "1", limit: "50" });
  if (params.jobId) query.set("jobId", params.jobId);
  if (params.status) query.set("status", params.status);

  const [applicationsPage, jobsPage] = await Promise.all([
    adminApi<Paginated<JobApplicationRow>>(
      `/admin/careers/applications?${query.toString()}`,
    ),
    adminApi<Paginated<JobOpeningRow>>("/admin/careers/jobs?page=1&limit=50"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          {dict.careers.applicationsTitle}
        </h1>
        <p className="text-sm text-muted-foreground">
          {dict.careers.applicationsSubtitle(applicationsPage.total)}
        </p>
      </div>

      <ApplicationsTable
        data={applicationsPage.items}
        jobs={jobsPage.items.map((job) => ({ id: job.id, title: job.title }))}
        activeJobId={params.jobId}
        activeStatus={params.status}
        canManage={canManage}
      />
    </div>
  );
}
