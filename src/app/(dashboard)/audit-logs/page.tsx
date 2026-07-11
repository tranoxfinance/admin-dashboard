import { adminApi } from "@/lib/admin-api";
import type { AuditLog, Paginated } from "@/lib/types";
import { InsightCard } from "@/components/insight-card";
import { BarList } from "@/components/charts/bar-list";
import { AuditLogsTable } from "./audit-logs-table";

function humanizeAction(action: string): string {
  return action.replaceAll("_", " ").replace(/^./, (c) => c.toUpperCase());
}

export default async function AuditLogsPage() {
  const data = await adminApi<Paginated<AuditLog>>(
    "/admin/audit-logs?page=1&limit=100",
  );

  const actionCounts = new Map<string, number>();
  for (const log of data.items) {
    actionCounts.set(log.action, (actionCounts.get(log.action) ?? 0) + 1);
  }
  const actionItems = [...actionCounts.entries()]
    .map(([action, value]) => ({ label: humanizeAction(action), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">
          {data.total.toLocaleString()} recorded events
        </p>
      </div>

      {actionItems.length > 0 ? (
        <InsightCard
          title="Most frequent actions"
          subtitle={`Across the ${data.items.length} most recent events`}
        >
          <BarList items={actionItems} color="#00407a" />
        </InsightCard>
      ) : null}

      <AuditLogsTable data={data.items} />
    </div>
  );
}
