import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { getDict } from "@/lib/i18n/server";
import type { AdminLogRow, Paginated } from "@/lib/types";
import { AdminLogsTable } from "./admin-logs-table";
import { PageHeader } from "@/components/page-header";

export default async function AdminLogsPage() {
  const session = await getSession();
  if (session?.role !== "super_admin" && session?.role !== "hr") {
    redirect("/");
  }
  const dict = await getDict();
  const data = await adminApi<Paginated<AdminLogRow>>(
    "/admin/admin-logs?page=1&limit=100",
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={dict.adminLogs.title}
        description={dict.adminLogs.subtitle(data.total.toLocaleString())}
      />

      <AdminLogsTable data={data.items} />
    </div>
  );
}
