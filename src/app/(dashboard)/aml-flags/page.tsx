import { ShieldAlert, ShieldCheck, ShieldOff } from "lucide-react";
import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { getDict } from "@/lib/i18n/server";
import type { AmlFlag } from "@/lib/types";
import { InsightCard } from "@/components/insight-card";
import { StatCard } from "@/components/overview/stat-card";
import { DonutStatCard } from "@/components/overview/donut-stat-card";
import { BarList } from "@/components/charts/bar-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AmlFlagsTable } from "./aml-flags-table";

export default async function AmlFlagsPage() {
  const dict = await getDict();
  const session = await getSession();
  if (session?.role === "support" || session?.role === "hr") {
    redirect("/");
  }
  const canManage = session?.role !== "viewer";
  const flags = await adminApi<AmlFlag[]>("/admin/aml-flags");

  const statusMeta = [
    {
      status: "open",
      label: dict.amlFlags.statusOpen,
      color: "#d03b3b",
      icon: ShieldAlert,
    },
    {
      status: "reviewed",
      label: dict.amlFlags.statusReviewed,
      color: "#0ca30c",
      icon: ShieldCheck,
    },
    {
      status: "dismissed",
      label: dict.amlFlags.statusDismissed,
      color: "#898781",
      icon: ShieldOff,
    },
  ] as const;

  const countByStatus = (status: AmlFlag["status"]) =>
    flags.filter((flag) => flag.status === status).length;

  const statusSegments = statusMeta.map((meta) => ({
    label: meta.label,
    value: countByStatus(meta.status),
    color: meta.color,
  })).filter((segment) => segment.value > 0);

  const reasonCounts = new Map<string, number>();
  for (const flag of flags) {
    reasonCounts.set(flag.reason, (reasonCounts.get(flag.reason) ?? 0) + 1);
  }
  const reasonItems = [...reasonCounts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          {dict.amlFlags.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {dict.amlFlags.subtitle(flags.length, countByStatus("open"))}
        </p>
      </div>

      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="analytics">{dict.common.analytics}</TabsTrigger>
          <TabsTrigger value="flags">{dict.amlFlags.tabFlags}</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {statusMeta.map((meta) => (
              <StatCard
                key={meta.status}
                icon={meta.icon}
                label={meta.label}
                value={countByStatus(meta.status).toLocaleString()}
                color={meta.color}
              />
            ))}
          </div>

          {flags.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <InsightCard
                title={dict.amlFlags.reviewPipeline}
                subtitle={dict.amlFlags.reviewPipelineSubtitle}
              >
                <DonutStatCard
                  segments={statusSegments}
                  centerLabel={dict.amlFlags.totalFlags}
                />
              </InsightCard>
              <InsightCard
                title={dict.amlFlags.topReasons}
                subtitle={dict.amlFlags.topReasonsSubtitle}
                className="lg:col-span-2"
              >
                <BarList items={reasonItems} color="#d03b3b" />
              </InsightCard>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="flags">
          <AmlFlagsTable data={flags} canManage={canManage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
