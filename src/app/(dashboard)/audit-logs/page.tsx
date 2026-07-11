import { adminApi } from "@/lib/admin-api";
import { humanizeAction } from "@/lib/activity";
import type { AuditLog, Paginated } from "@/lib/types";
import { InsightCard } from "@/components/insight-card";
import { BarList } from "@/components/charts/bar-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditLogsTable } from "./audit-logs-table";

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams({ page: "1", limit: "100" });
  if (params.userId) query.set("userId", params.userId);
  const defaultTab = params.userId ? "logs" : "analytics";

  const data = await adminApi<Paginated<AuditLog>>(
    `/admin/audit-logs?${query.toString()}`,
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
          {params.userId ? ` for user ${params.userId.slice(0, 8)}` : ""}
        </p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          {actionItems.length > 0 ? (
            <InsightCard
              title="Most frequent actions"
              subtitle={`Across the ${data.items.length} most recent events`}
            >
              <BarList items={actionItems} color="#00407a" />
            </InsightCard>
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No events recorded yet.
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs">
          <AuditLogsTable data={data.items} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
