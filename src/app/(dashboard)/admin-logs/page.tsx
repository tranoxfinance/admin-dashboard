import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { getDict } from "@/lib/i18n/server";
import type { AdminLogRow, Paginated } from "@/lib/types";
import { AdminLogsTable } from "./admin-logs-table";

export default async function AdminLogsPage() {
  const session = await getSession();
  if (session?.role !== "super_admin") {
    redirect("/");
  }
  const dict = await getDict();
  const data = await adminApi<Paginated<AdminLogRow>>(
    "/admin/admin-logs?page=1&limit=100",
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          {dict.adminLogs.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {dict.adminLogs.subtitle(data.total.toLocaleString())}
        </p>
      </div>

      <AdminLogsTable data={data.items} />
    </div>
  );
}
