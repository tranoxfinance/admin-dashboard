import { ArrowLeftRight, Banknote, PiggyBank } from "lucide-react";
import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { formatVolumeSummary } from "@/lib/format";
import { resolveDateRange } from "@/lib/date-range";
import { getDict } from "@/lib/i18n/server";
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

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const dict = await getDict();
  const session = await getSession();
  if (session?.role === "support" || session?.role === "hr" || session?.role === "social_media") {
    redirect("/");
  }
  const canManage = session?.role !== "viewer";
  const statusGroups = [
    {
      key: "completed",
      label: dict.transactions.statusCompleted,
      statuses: ["completed"],
    },
    {
      key: "inProgress",
      label: dict.transactions.statusInProgress,
      statuses: ["pending", "processing"],
    },
    {
      key: "failed",
      label: dict.transactions.statusFailed,
      statuses: ["failed"],
    },
    {
      key: "reversed",
      label: dict.transactions.statusReversed,
      statuses: ["reversed"],
    },
  ];
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

  const statusSegments = statusGroups.map((group) => ({
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
      statusSegments.find(
        (s) => s.label === dict.transactions.statusCompleted,
      )?.value ?? 0;
    return total ? Math.round((completed / total) * 100) : 0;
  })();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          {dict.transactions.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {dict.transactions.subtitle(
            activity.total.toLocaleString(),
            activity.total === 1,
            completedShare,
          )}
        </p>
      </div>

      <PeriodFilters period={period} />

      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="analytics">{dict.common.analytics}</TabsTrigger>
          <TabsTrigger value="transactions">
            {dict.transactions.tabTransactions}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={ArrowLeftRight}
              label={dict.common.transfers}
              value={transferCount.toLocaleString()}
              secondary={formatVolumeSummary(stats.totals.transfers, dict.common.noVolumeShort)}
              color="#0d8fd2"
            />
            <StatCard
              icon={PiggyBank}
              label={dict.common.deposits}
              value={topupCount.toLocaleString()}
              secondary={formatVolumeSummary(stats.totals.topups, dict.common.noVolumeShort)}
              color="#95c015"
            />
            <StatCard
              icon={Banknote}
              label={dict.common.withdrawals}
              value={withdrawalCount.toLocaleString()}
              secondary={formatVolumeSummary(stats.totals.withdrawals, dict.common.noVolumeShort)}
              color="#e9a028"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <InsightCard
              title={dict.transactions.activityOverTime}
              subtitle={dict.transactions.activityOverTimeSubtitle}
              className="lg:col-span-2"
            >
              <ActivityLineChart data={stats.daily} />
            </InsightCard>
            <InsightCard
              title={dict.transactions.outcomeShare}
              subtitle={dict.transactions.outcomeShareSubtitle}
            >
              <DonutStatCard
                segments={statusSegments}
                centerLabel={dict.transactions.totalActivity}
              />
            </InsightCard>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <InsightCard
              title={dict.transactions.volumeByCurrency}
              subtitle={dict.transactions.volumeByCurrencySubtitle}
              className="lg:col-span-2"
            >
              <VolumeTrendChart data={overview.volumeDaily} />
            </InsightCard>
            <InsightCard
              title={dict.transactions.statusBreakdown}
              subtitle={dict.transactions.statusBreakdownSubtitle}
            >
              <ActivityStatusChart byType={stats.byType} />
            </InsightCard>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <ActivityTable data={activity.items} canManage={canManage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
