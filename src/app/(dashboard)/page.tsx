import Link from "next/link";
import { Users, ArrowLeftRight, Wallet, TrendingUp } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { resolveDateRange } from "@/lib/date-range";
import { formatCurrency } from "@/lib/format";
import type {
  ActivityCurrencyTotal,
  ActivityItem,
  OverviewStats,
} from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PeriodSelect } from "@/components/period-select";
import { StatCard } from "@/components/overview/stat-card";
import { DonutStatCard } from "@/components/overview/donut-stat-card";
import { TrendInsightCard } from "@/components/overview/trend-insight-card";
import { ActivityFeedCard } from "@/components/overview/activity-feed-card";
import { CATEGORICAL_LIGHT, KYC_TIER_RAMP } from "@/lib/chart-colors";

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
    color: KYC_TIER_RAMP[tier],
  }));

  const usersByMarket = snapshot.countryDistribution.map((row, index) => ({
    label: COUNTRY_LABELS[row.country] ?? row.country,
    value: row.count,
    color: CATEGORICAL_LIGHT[index % CATEGORICAL_LIGHT.length],
  }));

  const transactionsByMarket = snapshot.transactionsByCountry.map(
    (row, index) => ({
      label: COUNTRY_LABELS[row.country] ?? row.country,
      value: row.count,
      color: CATEGORICAL_LIGHT[index % CATEGORICAL_LIGHT.length],
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/users">
          <StatCard
            icon={Users}
            label="Total users"
            value={stats.totalUsers.toLocaleString()}
          />
        </Link>
        <Link href="/users">
          <StatCard
            icon={TrendingUp}
            label="New users"
            value={stats.newUsers.toLocaleString()}
            delta={newUsersDelta}
            sparkline={{ data: userGrowthSparkline, dataKey: "count" }}
            color={CATEGORICAL_LIGHT[0]}
          />
        </Link>
        <Link href="/transactions">
          <StatCard
            icon={Wallet}
            label={primaryVolume ? `Volume (${primaryVolume.currency})` : "Volume"}
            value={
              primaryVolume
                ? formatCurrency(primaryVolume.volume, primaryVolume.currency)
                : "—"
            }
            sparkline={{ data: volumeSparkline, dataKey: "volume" }}
            color={CATEGORICAL_LIGHT[1]}
          />
          {secondaryVolume ? (
            <p className="mt-1 pl-1 text-xs text-muted-foreground">
              +{formatCurrency(secondaryVolume.volume, secondaryVolume.currency)}
            </p>
          ) : null}
        </Link>
        <Link href="/transactions">
          <StatCard
            icon={ArrowLeftRight}
            label={primaryRevenue ? `Revenue (${primaryRevenue.currency})` : "Revenue"}
            value={
              primaryRevenue
                ? formatCurrency(primaryRevenue.volume, primaryRevenue.currency)
                : "—"
            }
            delta={transactionDelta}
            color={CATEGORICAL_LIGHT[2]}
          />
          {secondaryRevenue ? (
            <p className="mt-1 pl-1 text-xs text-muted-foreground">
              +{formatCurrency(secondaryRevenue.volume, secondaryRevenue.currency)}
            </p>
          ) : null}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-sm font-semibold">
                  Activity trend
                </h2>
                <p className="text-xs text-muted-foreground">
                  Transfers, deposits, and withdrawals combined
                </p>
              </div>
              <span
                className={
                  stats.openAmlFlags > 0
                    ? "rounded-full bg-[#d03b3b]/10 px-2.5 py-1 text-xs font-medium text-[#d03b3b]"
                    : "rounded-full bg-[#0ca30c]/10 px-2.5 py-1 text-xs font-medium text-[#0ca30c]"
                }
              >
                {stats.openAmlFlags} AML flag{stats.openAmlFlags === 1 ? "" : "s"}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <TrendInsightCard
              data={stats.activityDaily}
              total={activityTotal}
              breakdown={typeBreakdown}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-sm font-semibold">
                  Top transactions
                </h2>
                <p className="text-xs text-muted-foreground">
                  Largest movements
                </p>
              </div>
              <PeriodSelect paramName="topPeriod" value={topPeriod} />
            </div>
          </CardHeader>
          <CardContent>
            <ActivityFeedCard data={topTransactions} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <h2 className="font-heading text-sm font-semibold">KYC tiers</h2>
            <p className="text-xs text-muted-foreground">
              Verification level across all users
            </p>
          </CardHeader>
          <CardContent>
            <DonutStatCard segments={kycSegments} centerLabel="Top tier" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="font-heading text-sm font-semibold">
              Users by market
            </h2>
            <p className="text-xs text-muted-foreground">
              Where accounts are registered
            </p>
          </CardHeader>
          <CardContent>
            <DonutStatCard segments={usersByMarket} centerLabel="Leading" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="font-heading text-sm font-semibold">
              Transactions by market
            </h2>
            <p className="text-xs text-muted-foreground">
              Where activity originates
            </p>
          </CardHeader>
          <CardContent>
            <DonutStatCard segments={transactionsByMarket} centerLabel="Leading" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
