import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, Globe2, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { resolveDateRange } from "@/lib/date-range";
import { getDict } from "@/lib/i18n/server";
import type { AdminUserRow, OverviewStats, Paginated } from "@/lib/types";
import { InsightCard } from "@/components/insight-card";
import { PeriodSelect } from "@/components/period-select";
import { StatCard } from "@/components/overview/stat-card";
import { DonutStatCard } from "@/components/overview/donut-stat-card";
import { AreaTrendChart } from "@/components/charts/area-trend-chart";
import { BarList } from "@/components/charts/bar-list";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KYC_TIER_RAMP } from "@/lib/chart-colors";
import { UsersTable } from "./users-table";

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
  const dict = await getDict();
  const session = await getSession();
  if (session?.role === "hr") {
    redirect("/");
  }
  const canManage =
    session?.role === "super_admin" || session?.role === "admin";
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
    label: dict.users.kycLabels[tier],
    value:
      snapshot.kycDistribution.find((row) => row.tier === tier)?.count ?? 0,
    color: KYC_TIER_RAMP[tier],
  }));

  const marketItems = snapshot.countryDistribution.map((row) => ({
    label: dict.markets[row.country] ?? row.country,
    value: row.count,
  }));

  const topMarket = marketItems.length
    ? marketItems.reduce((a, b) => (b.value > a.value ? b : a))
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            {dict.users.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {dict.users.subtitle(
              data.total.toLocaleString(),
              marketItems.length,
            )}
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
            {dict.users.viewActivity}
          </Button>
          <PeriodSelect paramName="period" value={period} />
        </div>
      </div>

      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="analytics">{dict.common.analytics}</TabsTrigger>
          <TabsTrigger value="users">{dict.users.tabUsers}</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Users}
              label={dict.common.totalUsers}
              value={snapshot.totalUsers.toLocaleString()}
              color={STAT_COLORS.total}
            />
            <StatCard
              icon={TrendingUp}
              label={dict.users.newUsers}
              value={stats.newUsers.toLocaleString()}
              delta={newUsersDelta}
              sparkline={{ data: growthSparkline, dataKey: "count" }}
              color={STAT_COLORS.new}
            />
            <StatCard
              icon={ShieldCheck}
              label={dict.users.kycVerified}
              value={verifiedUsers.toLocaleString()}
              secondary={dict.users.verifiedSecondary(verifiedPercent)}
              color={STAT_COLORS.verified}
            />
            <StatCard
              icon={Globe2}
              label={dict.users.largestMarket}
              value={topMarket?.label ?? "—"}
              secondary={
                topMarket
                  ? dict.users.marketSecondary(
                      topMarket.value.toLocaleString(),
                    )
                  : undefined
              }
              color={STAT_COLORS.markets}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <InsightCard
              title={dict.users.signupsOverTime}
              subtitle={dict.users.signupsSubtitle}
              className="lg:col-span-2"
            >
              <AreaTrendChart
                data={growthData}
                seriesLabel={dict.users.newUsersSeries}
                color={STAT_COLORS.new}
                height={280}
              />
            </InsightCard>
            <InsightCard
              title={dict.users.kycTiersTitle}
              subtitle={dict.users.kycTiersSubtitle}
            >
              <div className="flex flex-col gap-4">
                <DonutStatCard
                  segments={kycSegments}
                  centerLabel={dict.common.totalUsers}
                />
                <Separator />
                <BarList items={marketItems} color={STAT_COLORS.markets} />
              </div>
            </InsightCard>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UsersTable data={data.items} canManage={canManage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
