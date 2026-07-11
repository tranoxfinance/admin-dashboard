import Link from "next/link";
import { Activity, Globe2, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { resolveDateRange } from "@/lib/date-range";
import type { AdminUserRow, OverviewStats, Paginated } from "@/lib/types";
import { InsightCard } from "@/components/insight-card";
import { PeriodSelect } from "@/components/period-select";
import { StatCard } from "@/components/overview/stat-card";
import { DonutStatCard } from "@/components/overview/donut-stat-card";
import { AreaTrendChart } from "@/components/charts/area-trend-chart";
import { BarList } from "@/components/charts/bar-list";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { KYC_TIER_RAMP } from "@/lib/chart-colors";
import { UsersTable } from "./users-table";

const KYC_LABELS: Record<number, string> = {
  0: "Tier 0 — Unverified",
  1: "Tier 1 — Basic",
  2: "Tier 2 — Full",
};

const COUNTRY_LABELS: Record<string, string> = {
  NG: "Nigeria",
  CI: "Ivory Coast",
};

const STAT_COLORS = {
  total: "#0d8fd2",
  new: "#95c015",
  verified: "#00407a",
  markets: "#e9a028",
};

function deltaPercent(current: number, previous: number): number | null {
  if (previous === 0) {
    return null;
  }
  return Math.round(((current - previous) / previous) * 100);
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period = params.period ?? "30d";
  const { dateFrom, dateTo } = resolveDateRange({ period });

  const statsQuery = new URLSearchParams();
  if (dateFrom) statsQuery.set("dateFrom", dateFrom);
  if (dateTo) statsQuery.set("dateTo", dateTo);

  const [data, stats, snapshot] = await Promise.all([
    adminApi<Paginated<AdminUserRow>>("/admin/users?page=1&limit=50"),
    adminApi<OverviewStats>(`/admin/overview/stats?${statsQuery.toString()}`),
    adminApi<OverviewStats>("/admin/overview/stats"),
  ]);

  const newUsersDelta = stats.previousPeriod
    ? deltaPercent(stats.newUsers, stats.previousPeriod.newUsers)
    : null;

  const growthData = stats.userGrowthDaily.map((point) => ({
    date: point.date,
    value: point.count,
  }));

  const growthSparkline = stats.userGrowthDaily.map((point) => ({
    date: point.date,
    count: point.count,
  }));

  const verifiedUsers = snapshot.kycDistribution
    .filter((row) => row.tier > 0)
    .reduce((sum, row) => sum + row.count, 0);
  const verifiedPercent = snapshot.totalUsers
    ? Math.round((verifiedUsers / snapshot.totalUsers) * 100)
    : 0;

  const kycSegments = [0, 1, 2].map((tier) => ({
    label: KYC_LABELS[tier],
    value:
      snapshot.kycDistribution.find((row) => row.tier === tier)?.count ?? 0,
    color: KYC_TIER_RAMP[tier],
  }));

  const marketItems = snapshot.countryDistribution.map((row) => ({
    label: COUNTRY_LABELS[row.country] ?? row.country,
    value: row.count,
  }));

  const topMarket = marketItems.length
    ? marketItems.reduce((a, b) => (b.value > a.value ? b : a))
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">
            {data.total.toLocaleString()} total accounts across{" "}
            {marketItems.length} market{marketItems.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/users/activity" />}
          >
            <Activity className="size-3.5" />
            View activity
          </Button>
          <PeriodSelect paramName="period" value={period} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total users"
          value={snapshot.totalUsers.toLocaleString()}
          color={STAT_COLORS.total}
        />
        <StatCard
          icon={TrendingUp}
          label="New users"
          value={stats.newUsers.toLocaleString()}
          delta={newUsersDelta}
          sparkline={{ data: growthSparkline, dataKey: "count" }}
          color={STAT_COLORS.new}
        />
        <StatCard
          icon={ShieldCheck}
          label="KYC verified"
          value={verifiedUsers.toLocaleString()}
          secondary={`${verifiedPercent}% of all accounts`}
          color={STAT_COLORS.verified}
        />
        <StatCard
          icon={Globe2}
          label="Largest market"
          value={topMarket?.label ?? "—"}
          secondary={
            topMarket ? `${topMarket.value.toLocaleString()} accounts` : undefined
          }
          color={STAT_COLORS.markets}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <InsightCard
          title="Signups over time"
          subtitle="New accounts created per day"
          className="lg:col-span-2"
        >
          <AreaTrendChart
            data={growthData}
            seriesLabel="New users"
            color={STAT_COLORS.new}
            height={280}
          />
        </InsightCard>
        <InsightCard
          title="KYC tiers"
          subtitle="Verification level and market split"
        >
          <div className="flex flex-col gap-4">
            <DonutStatCard segments={kycSegments} centerLabel="Total users" />
            <Separator />
            <BarList items={marketItems} color={STAT_COLORS.markets} />
          </div>
        </InsightCard>
      </div>

      <UsersTable data={data.items} />
    </div>
  );
}
