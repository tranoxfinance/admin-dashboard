import Link from "next/link";
import {
  Users,
  Activity,
  ArrowLeftRight,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { resolveDateRange } from "@/lib/date-range";
import { formatCurrency } from "@/lib/format";
import type {
  ActivityCurrencyTotal,
  ActivityItem,
  OverviewStats,
} from "@/lib/types";
import { InsightCard } from "@/components/insight-card";
import { PeriodSelect } from "@/components/period-select";
import { StatCard } from "@/components/overview/stat-card";
import { DonutStatCard } from "@/components/overview/donut-stat-card";
import { TrendInsightCard } from "@/components/overview/trend-insight-card";
import { RevenueTrendChart } from "@/components/overview/revenue-trend-chart";
import { ActivityFeedCard } from "@/components/overview/activity-feed-card";
import { CATEGORICAL_LIGHT, WARM_CATEGORICAL, WARM_RAMP } from "@/lib/chart-colors";

function deltaPercent(current: number, previous: number): number | null {
  if (previous === 0) {
    return null;
  }
  return Math.round(((current - previous) / previous) * 100);
}

function pickPrimary(
  totals: ActivityCurrencyTotal[],
): [ActivityCurrencyTotal | undefined, ActivityCurrencyTotal | undefined] {
  const sorted = [...totals].sort((a, b) => Number(b.volume) - Number(a.volume));
  return [sorted[0], sorted[1]];
}

const KYC_LABELS: Record<number, string> = {
  0: "Tier 0",
  1: "Tier 1",
  2: "Tier 2",
};

const COUNTRY_LABELS: Record<string, string> = {
  NG: "Nigeria",
  CI: "Ivory Coast",
};

const STAT_COLORS = {
  users: "#0d8fd2",
  activeUsers: "#1baf7a",
  newUsers: "#95c015",
  volume: "#e9a028",
  revenue: "#00407a",
};

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; topPeriod?: string }>;
}) {
  const params = await searchParams;
  const period = params.period ?? "30d";
  const topPeriod = params.topPeriod ?? "7d";

  const { dateFrom, dateTo } = resolveDateRange({ period });
  const { dateFrom: topDateFrom, dateTo: topDateTo } = resolveDateRange({
    period: topPeriod,
  });

  const statsQuery = new URLSearchParams();
  if (dateFrom) statsQuery.set("dateFrom", dateFrom);
  if (dateTo) statsQuery.set("dateTo", dateTo);

  const topQuery = new URLSearchParams({ limit: "5" });
  if (topDateFrom) topQuery.set("dateFrom", topDateFrom);
  if (topDateTo) topQuery.set("dateTo", topDateTo);

  const [stats, snapshot, topTransactions] = await Promise.all([
    adminApi<OverviewStats>(`/admin/overview/stats?${statsQuery.toString()}`),
    adminApi<OverviewStats>("/admin/overview/stats"),
    adminApi<ActivityItem[]>(
      `/admin/overview/top-transactions?${topQuery.toString()}`,
    ),
  ]);

  const newUsersDelta = stats.previousPeriod
    ? deltaPercent(stats.newUsers, stats.previousPeriod.newUsers)
    : null;
  const activeUsersDelta = stats.previousPeriod
    ? deltaPercent(stats.activeUsers, stats.previousPeriod.activeUsers)
    : null;
  const transactionDelta = stats.previousPeriod
    ? deltaPercent(stats.transactionCount, stats.previousPeriod.transactionCount)
    : null;

  const [primaryVolume, secondaryVolume] = pickPrimary(
    stats.volumeTotals.combined,
  );
  const [primaryRevenue, secondaryRevenue] = pickPrimary(stats.revenue.totals);

  const volumeSparkline = primaryVolume
    ? stats.volumeDaily
        .filter((point) => point.currency === primaryVolume.currency)
        .map((point) => ({ date: point.date, volume: Number(point.volume) }))
    : [];

  const revenueTrendData = primaryRevenue
    ? stats.revenue.daily
        .filter((point) => point.currency === primaryRevenue.currency)
        .map((point) => ({ date: point.date, value: Number(point.volume) }))
    : [];

  const userGrowthSparkline = stats.userGrowthDaily.map((point) => ({
    date: point.date,
    count: point.count,
  }));

  const activityTotal = stats.activityDaily.reduce(
    (sum, point) => sum + point.count,
    0,
  );
  const typeBreakdown = [
    {
      label: "Transfers",
      count: stats.volumeTotals.transfers.reduce((s, r) => s + r.count, 0),
      color: CATEGORICAL_LIGHT[0],
    },
    {
      label: "Deposits",
      count: stats.volumeTotals.topups.reduce((s, r) => s + r.count, 0),
      color: CATEGORICAL_LIGHT[1],
    },
    {
      label: "Withdrawals",
      count: stats.volumeTotals.withdrawals.reduce((s, r) => s + r.count, 0),
      color: CATEGORICAL_LIGHT[2],
    },
  ].map((entry) => ({
    label: entry.label,
    color: entry.color,
    percent: activityTotal ? Math.round((entry.count / activityTotal) * 100) : 0,
  }));

  const kycSegments = [0, 1, 2].map((tier) => ({
    label: KYC_LABELS[tier],
    value: snapshot.kycDistribution.find((row) => row.tier === tier)?.count ?? 0,
    color: WARM_RAMP[tier],
  }));

  const usersByMarket = snapshot.countryDistribution.map((row, index) => ({
    label: COUNTRY_LABELS[row.country] ?? row.country,
    value: row.count,
    color: WARM_CATEGORICAL[index % WARM_CATEGORICAL.length],
  }));

  const transactionsByMarket = snapshot.transactionsByCountry.map(
    (row, index) => ({
      label: COUNTRY_LABELS[row.country] ?? row.country,
      value: row.count,
      color: WARM_CATEGORICAL[index % WARM_CATEGORICAL.length],
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Overview</h1>
          <p className="text-sm text-muted-foreground">
            Growth, transaction volume, and revenue at a glance.
          </p>
        </div>
        <PeriodSelect paramName="period" value={period} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Link href="/users" className="block h-full">
          <StatCard
            icon={Users}
            label="Total users"
            value={stats.totalUsers.toLocaleString()}
            color={STAT_COLORS.users}
          />
        </Link>
        <Link href="/users/activity" className="block h-full">
          <StatCard
            icon={Activity}
            label="Total active users"
            value={stats.activeUsers.toLocaleString()}
            delta={activeUsersDelta}
            color={STAT_COLORS.activeUsers}
          />
        </Link>
        <Link href="/users" className="block h-full">
          <StatCard
            icon={TrendingUp}
            label="New users"
            value={stats.newUsers.toLocaleString()}
            delta={newUsersDelta}
            sparkline={{ data: userGrowthSparkline, dataKey: "count" }}
            color={STAT_COLORS.newUsers}
          />
        </Link>
        <Link href="/transactions" className="block h-full">
          <StatCard
            icon={Wallet}
            label={primaryVolume ? `Volume (${primaryVolume.currency})` : "Volume"}
            value={
              primaryVolume
                ? formatCurrency(primaryVolume.volume, primaryVolume.currency)
                : "—"
            }
            secondary={
              secondaryVolume
                ? `+${formatCurrency(secondaryVolume.volume, secondaryVolume.currency)}`
                : undefined
            }
            sparkline={{ data: volumeSparkline, dataKey: "volume" }}
            color={STAT_COLORS.volume}
          />
        </Link>
        <Link href="/transactions" className="block h-full">
          <StatCard
            icon={ArrowLeftRight}
            label={primaryRevenue ? `Revenue (${primaryRevenue.currency})` : "Revenue"}
            value={
              primaryRevenue
                ? formatCurrency(primaryRevenue.volume, primaryRevenue.currency)
                : "—"
            }
            secondary={
              secondaryRevenue
                ? `+${formatCurrency(secondaryRevenue.volume, secondaryRevenue.currency)}`
                : undefined
            }
            delta={transactionDelta}
            color={STAT_COLORS.revenue}
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <InsightCard
          title="Activity trend"
          className="lg:col-span-2"
          action={
            <span
              className={
                stats.openAmlFlags > 0
                  ? "rounded-full bg-[#d03b3b]/10 px-2.5 py-1 text-xs font-medium text-[#d03b3b]"
                  : "rounded-full bg-[#0ca30c]/10 px-2.5 py-1 text-xs font-medium text-[#0ca30c]"
              }
            >
              {stats.openAmlFlags} AML flag{stats.openAmlFlags === 1 ? "" : "s"}
            </span>
          }
        >
          <TrendInsightCard
            data={stats.activityDaily}
            total={activityTotal}
            breakdown={typeBreakdown}
          />
        </InsightCard>
        <InsightCard
          title="Top transactions"
          action={<PeriodSelect paramName="topPeriod" value={topPeriod} />}
        >
          <ActivityFeedCard data={topTransactions} />
        </InsightCard>
      </div>

      <InsightCard
        title="Revenue trend"
        subtitle={
          primaryRevenue
            ? `Daily fee revenue in ${primaryRevenue.currency}`
            : "Daily fee revenue"
        }
        action={
          secondaryRevenue ? (
            <span className="text-xs font-medium text-muted-foreground">
              +{formatCurrency(secondaryRevenue.volume, secondaryRevenue.currency)}{" "}
              in {secondaryRevenue.currency}
            </span>
          ) : undefined
        }
      >
        <RevenueTrendChart
          data={revenueTrendData}
          currency={primaryRevenue?.currency ?? ""}
        />
      </InsightCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <InsightCard title="KYC tiers" subtitle="Verification level of all users">
          <DonutStatCard segments={kycSegments} centerLabel="Total users" />
        </InsightCard>
        <InsightCard
          title="Users by market"
          subtitle="Where accounts are registered"
        >
          <DonutStatCard segments={usersByMarket} centerLabel="Total users" />
        </InsightCard>
        <InsightCard
          title="Transactions by market"
          subtitle="Where activity originates"
        >
          <DonutStatCard
            segments={transactionsByMarket}
            centerLabel="Total transactions"
          />
        </InsightCard>
      </div>
    </div>
  );
}
