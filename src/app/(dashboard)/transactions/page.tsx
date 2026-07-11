import { ArrowLeftRight, Banknote, PiggyBank } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { formatVolumeSummary } from "@/lib/format";
import { resolveDateRange } from "@/lib/date-range";
import type {
  ActivityItem,
  ActivityStats,
  OverviewStats,
  Paginated,
} from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InsightCard } from "@/components/insight-card";
import { PeriodFilters } from "@/components/period-filters";
import { StatCard } from "@/components/overview/stat-card";
import { DonutStatCard } from "@/components/overview/donut-stat-card";
import { STATUS_COLORS } from "@/lib/chart-colors";
import { ActivityLineChart } from "./activity-line-chart";
import { ActivityStatusChart } from "./activity-status-chart";
import { ActivityTable } from "./activity-table";
import { VolumeTrendChart } from "./volume-trend-chart";

const STATUS_GROUPS = [
  { key: "completed", label: "Completed", statuses: ["completed"] },
  { key: "inProgress", label: "In progress", statuses: ["pending", "processing"] },
  { key: "failed", label: "Failed", statuses: ["failed"] },
  { key: "reversed", label: "Reversed", statuses: ["reversed"] },
];

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

  const [activity, stats, overview] = await Promise.all([
    adminApi<Paginated<ActivityItem>>(
      `/admin/transactions?${activityQuery.toString()}`,
    ),
    adminApi<ActivityStats>(`/admin/transactions/stats?${statsQuery.toString()}`),
    adminApi<OverviewStats>(`/admin/overview/stats?${statsQuery.toString()}`),
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

  const statusSegments = STATUS_GROUPS.map((group) => ({
    label: group.label,
    value: stats.byType.reduce(
      (sum, entry) =>
        sum +
        entry.statuses
          .filter((row) => group.statuses.includes(row.status))
          .reduce((inner, row) => inner + row.count, 0),
      0,
    ),
    color: STATUS_COLORS[group.key],
  })).filter((segment) => segment.value > 0);

  const completedShare = (() => {
    const total = statusSegments.reduce((sum, s) => sum + s.value, 0);
    const completed =
      statusSegments.find((s) => s.label === "Completed")?.value ?? 0;
    return total ? Math.round((completed / total) * 100) : 0;
  })();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Transactions</h1>
        <p className="text-sm text-muted-foreground">
          {activity.total.toLocaleString()} activity record
          {activity.total === 1 ? "" : "s"} · {completedShare}% completed in
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
            <StatCard
              icon={ArrowLeftRight}
              label="Transfers"
              value={transferCount.toLocaleString()}
              secondary={formatVolumeSummary(stats.totals.transfers)}
              color="#0d8fd2"
            />
            <StatCard
              icon={PiggyBank}
              label="Deposits"
              value={topupCount.toLocaleString()}
              secondary={formatVolumeSummary(stats.totals.topups)}
              color="#95c015"
            />
            <StatCard
              icon={Banknote}
              label="Withdrawals"
              value={withdrawalCount.toLocaleString()}
              secondary={formatVolumeSummary(stats.totals.withdrawals)}
              color="#e9a028"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <InsightCard
              title="Activity over time"
              subtitle="Daily count of transfers, deposits, and withdrawals"
              className="lg:col-span-2"
            >
              <ActivityLineChart data={stats.daily} />
            </InsightCard>
            <InsightCard
              title="Outcome share"
              subtitle="All activity by final status"
            >
              <DonutStatCard
                segments={statusSegments}
                centerLabel="Total activity"
              />
            </InsightCard>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <InsightCard
              title="Volume by currency"
              subtitle="Daily processed volume per corridor currency"
              className="lg:col-span-2"
            >
              <VolumeTrendChart data={overview.volumeDaily} />
            </InsightCard>
            <InsightCard
              title="Status breakdown"
              subtitle="How each activity type is resolving"
            >
              <ActivityStatusChart byType={stats.byType} />
            </InsightCard>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <ActivityTable data={activity.items} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
