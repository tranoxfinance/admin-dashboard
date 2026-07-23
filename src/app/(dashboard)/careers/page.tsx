import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase, FileText, Inbox, Users } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { getDict } from "@/lib/i18n/server";
import type { JobApplicationRow, JobOpeningRow } from "@/lib/types";
import { StatCard } from "@/components/overview/stat-card";
import { Button } from "@/components/ui/button";
import { JobsTable } from "./jobs-table";
import { JobDialog } from "./job-dialog";

export default async function CareersPage() {
  const session = await getSession();
  const role = session?.role;
  if (!role || !["super_admin", "admin", "viewer", "hr"].includes(role)) {
    redirect("/");
  }
  const canManage = role === "super_admin" || role === "hr";
  const dict = await getDict();
  const [jobs, applications] = await Promise.all([
    adminApi<JobOpeningRow[]>("/admin/careers/jobs"),
    adminApi<JobApplicationRow[]>("/admin/careers/applications"),
  ]);

  const openJobs = jobs.filter((job) => job.status === "open").length;
  const pendingApplications = applications.filter(
    (application) => application.status === "submitted",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            {dict.careers.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {dict.careers.subtitle(openJobs, pendingApplications)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/careers/applications" />}
          >
            <Inbox className="size-3.5" />
            {dict.careers.viewApplications}
          </Button>
          {canManage ? <JobDialog /> : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Briefcase}
          label={dict.careers.statOpenRoles}
          value={openJobs.toLocaleString()}
          color="#0d8fd2"
        />
        <StatCard
          icon={Users}
          label={dict.careers.statApplications}
          value={applications.length.toLocaleString()}
          color="#00407a"
        />
        <StatCard
          icon={FileText}
          label={dict.careers.statPendingReview}
          value={pendingApplications.toLocaleString()}
          color="#e9a028"
        />
      </div>

      <JobsTable data={jobs} canManage={canManage} />
    </div>
  );
}
