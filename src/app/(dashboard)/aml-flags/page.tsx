import { ShieldAlert, ShieldCheck, ShieldOff } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import type { AmlFlag } from "@/lib/types";
import { InsightCard } from "@/components/insight-card";
import { StatCard } from "@/components/overview/stat-card";
import { DonutStatCard } from "@/components/overview/donut-stat-card";
import { BarList } from "@/components/charts/bar-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AmlFlagsTable } from "./aml-flags-table";

const STATUS_META = [
  { status: "open", label: "Open", color: "#d03b3b", icon: ShieldAlert },
  { status: "reviewed", label: "Reviewed", color: "#0ca30c", icon: ShieldCheck },
  { status: "dismissed", label: "Dismissed", color: "#898781", icon: ShieldOff },
] as const;

export default async function AmlFlagsPage() {
  const flags = await adminApi<AmlFlag[]>("/admin/aml-flags");

  const countByStatus = (status: AmlFlag["status"]) =>
    flags.filter((flag) => flag.status === status).length;

  const statusSegments = STATUS_META.map((meta) => ({
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
        <h1 className="font-heading text-2xl font-semibold">AML Flags</h1>
        <p className="text-sm text-muted-foreground">
          {flags.length} flag{flags.length === 1 ? "" : "s"} ·{" "}
          {countByStatus("open")} awaiting review
        </p>
      </div>

      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="flags">Flags</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STATUS_META.map((meta) => (
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
                title="Review pipeline"
                subtitle="Every flag by current status"
              >
                <DonutStatCard
                  segments={statusSegments}
                  centerLabel="Total flags"
                />
              </InsightCard>
              <InsightCard
                title="Top flag reasons"
                subtitle="Most frequent triggers across all flags"
                className="lg:col-span-2"
              >
                <BarList items={reasonItems} color="#d03b3b" />
              </InsightCard>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="flags">
          <AmlFlagsTable data={flags} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
