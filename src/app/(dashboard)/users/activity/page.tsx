import { Activity, Flame, MousePointerClick, UserCheck } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { buildCategoryBreakdown, humanizeAction } from "@/lib/activity";
import { resolveDateRange } from "@/lib/date-range";
import type { Paginated, UserActivityRow, UserActivityStats } from "@/lib/types";
import { InsightCard } from "@/components/insight-card";
import { PeriodSelect } from "@/components/period-select";
import { StatCard } from "@/components/overview/stat-card";
import { DonutStatCard } from "@/components/overview/donut-stat-card";
import { AreaTrendChart } from "@/components/charts/area-trend-chart";
import { BarList } from "@/components/charts/bar-list";
import { Separator } from "@/components/ui/separator";
import { UserActivityTable } from "./user-activity-table";

const STAT_COLORS = {
  active: "#0d8fd2",
  engagement: "#95c015",
  events: "#e9a028",
  topAction: "#00407a",
};

function deltaPercent(current: number, previous: number): number | null {
  if (previous === 0) {
    return null;
  }
  return Math.round(((current - previous) / previous) * 100);
}

export default async function UserActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period = params.period ?? "30d";
  const { dateFrom, dateTo } = resolveDateRange({ period });

  const query = new URLSearchParams();
  if (dateFrom) query.set("dateFrom", dateFrom);
  if (dateTo) query.set("dateTo", dateTo);

  const listQuery = new URLSearchParams(query);
  listQuery.set("page", "1");
  listQuery.set("limit", "50");

  const [stats, activity] = await Promise.all([
    adminApi<UserActivityStats>(
      `/admin/users/activity/stats?${query.toString()}`,
    ),
    adminApi<Paginated<UserActivityRow>>(
      `/admin/users/activity?${listQuery.toString()}`,
    ),
  ]);

  const activeDelta = stats.previousPeriod
    ? deltaPercent(stats.activeUsers, stats.previousPeriod.activeUsers)
    : null;

  const engagementPercent = stats.totalUsers
    ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
    : 0;

  const topAction = stats.actionBreakdown[0];

  const dailyActiveData = stats.dailyActiveUsers.map((point) => ({
    date: point.date,
    value: point.count,
  }));

  const categorySegments = buildCategoryBreakdown(stats.actionBreakdown);

  const topActionItems = stats.actionBreakdown.slice(0, 6).map((row) => ({
    label: humanizeAction(row.action),
    value: row.count,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">User Activity</h1>
          <p className="text-sm text-muted-foreground">
            What users are doing across the app, and who is most active.
          </p>
        </div>
        <PeriodSelect paramName="period" value={period} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Activity}
          label="Active users"
          value={stats.activeUsers.toLocaleString()}
          delta={activeDelta}
          color={STAT_COLORS.active}
        />
        <StatCard
          icon={UserCheck}
          label="Engagement"
          value={`${engagementPercent}%`}
          secondary={`${stats.activeUsers.toLocaleString()} of ${stats.totalUsers.toLocaleString()} users active`}
          color={STAT_COLORS.engagement}
        />
        <StatCard
          icon={MousePointerClick}
          label="Events recorded"
          value={stats.totalEvents.toLocaleString()}
          color={STAT_COLORS.events}
        />
        <StatCard
          icon={Flame}
          label="Top action"
          value={topAction ? humanizeAction(topAction.action) : "—"}
          secondary={
            topAction ? `${topAction.count.toLocaleString()} times` : undefined
          }
          color={STAT_COLORS.topAction}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <InsightCard
          title="Daily active users"
          subtitle="Unique users with at least one action per day"
          className="lg:col-span-2"
        >
          <AreaTrendChart
            data={dailyActiveData}
            seriesLabel="Active users"
            color={STAT_COLORS.active}
            height={280}
          />
        </InsightCard>
        <InsightCard
          title="What users do most"
          subtitle="Share of activity and top actions"
        >
          <div className="flex flex-col gap-4">
            <DonutStatCard
              segments={categorySegments}
              centerLabel="Total events"
            />
            <Separator />
            <BarList items={topActionItems} color={STAT_COLORS.topAction} />
          </div>
        </InsightCard>
      </div>

      <UserActivityTable data={activity.items} />
    </div>
  );
}
