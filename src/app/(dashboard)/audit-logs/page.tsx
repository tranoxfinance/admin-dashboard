import { adminApi } from "@/lib/admin-api";
import type { AuditLog, Paginated } from "@/lib/types";
import { AuditLogsTable } from "./audit-logs-table";

export default async function AuditLogsPage() {
  const data = await adminApi<Paginated<AuditLog>>(
    "/admin/audit-logs?page=1&limit=100",
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">
          {data.total} recorded events
        </p>
      </div>
      <AuditLogsTable data={data.items} />
    </div>
  );
}
