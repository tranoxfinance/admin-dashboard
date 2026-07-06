import { adminApi } from "@/lib/admin-api";
import { formatVolumeSummary } from "@/lib/format";
import { resolveDateRange } from "@/lib/date-range";
import type { ActivityItem, ActivityStats, Paginated } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PeriodFilters } from "@/components/period-filters";
import { ActivityLineChart } from "./activity-line-chart";
import { ActivityStatusChart } from "./activity-status-chart";
import { ActivityTable } from "./activity-table";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const { period, dateFrom, dateTo } = resolveDateRange(params);

  const activityQuery = new URLSearchParams({ page: "1", limit: "50" });
  if (dateFrom) activityQuery.set("dateFrom", dateFrom);
  if (dateTo) activityQuery.set("dateTo", dateTo);

  const statsQuery = new URLSearchParams();
  if (dateFrom) statsQuery.set("dateFrom", dateFrom);
  if (dateTo) statsQuery.set("dateTo", dateTo);

  const [activity, stats] = await Promise.all([
    adminApi<Paginated<ActivityItem>>(
      `/admin/transactions?${activityQuery.toString()}`,
    ),
    adminApi<ActivityStats>(`/admin/transactions/stats?${statsQuery.toString()}`),
  ]);

  const transferCount = stats.totals.transfers.reduce(
    (sum, entry) => sum + entry.count,
    0,
  );
  const topupCount = stats.totals.topups.reduce(
    (sum, entry) => sum + entry.count,
    0,
  );
  const withdrawalCount = stats.totals.withdrawals.reduce(
    (sum, entry) => sum + entry.count,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Transactions</h1>
        <p className="text-sm text-muted-foreground">
          {activity.total} activity record{activity.total === 1 ? "" : "s"} in
          this period
        </p>
      </div>

      <PeriodFilters period={period} />

      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <span className="text-sm text-muted-foreground">
                  Transfers
                </span>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-2xl font-semibold">
                  {transferCount.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatVolumeSummary(stats.totals.transfers)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <span className="text-sm text-muted-foreground">
                  Deposits
                </span>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-2xl font-semibold">
                  {topupCount.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatVolumeSummary(stats.totals.topups)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <span className="text-sm text-muted-foreground">
                  Withdrawals
                </span>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-2xl font-semibold">
                  {withdrawalCount.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatVolumeSummary(stats.totals.withdrawals)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <h2 className="font-heading text-sm font-semibold">
                  Activity over time
                </h2>
                <p className="text-xs text-muted-foreground">
                  Daily count of transfers, deposits, and withdrawals
                </p>
              </CardHeader>
              <CardContent>
                <ActivityLineChart data={stats.daily} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h2 className="font-heading text-sm font-semibold">
                  Status breakdown
                </h2>
                <p className="text-xs text-muted-foreground">
                  How each activity type is resolving
                </p>
              </CardHeader>
              <CardContent>
                <ActivityStatusChart byType={stats.byType} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <ActivityTable data={activity.items} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
