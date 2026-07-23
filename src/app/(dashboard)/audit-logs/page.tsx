import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { humanizeAction } from "@/lib/activity";
import { getSession } from "@/lib/admin-session";
import { getDict } from "@/lib/i18n/server";
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
  const session = await getSession();
  if (session?.role === "support" || session?.role === "hr") {
    redirect("/");
  }
  const dict = await getDict();
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
        <h1 className="font-heading text-2xl font-semibold">
          {dict.auditLogs.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {params.userId
            ? dict.auditLogs.subtitleForUser(
                data.total.toLocaleString(),
                params.userId.slice(0, 8),
              )
            : dict.auditLogs.subtitle(data.total.toLocaleString())}
        </p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="analytics">{dict.common.analytics}</TabsTrigger>
          <TabsTrigger value="logs">{dict.auditLogs.tabLogs}</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          {actionItems.length > 0 ? (
            <InsightCard
              title={dict.auditLogs.mostFrequent}
              subtitle={dict.auditLogs.mostFrequentSubtitle(data.items.length)}
            >
              <BarList items={actionItems} color="#00407a" />
            </InsightCard>
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              {dict.auditLogs.noEvents}
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
