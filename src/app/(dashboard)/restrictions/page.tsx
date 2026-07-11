import { ShieldBan, ShieldOff, MessageSquareWarning } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import type {
  AccountRestrictionRow,
  RestrictionAppealRow,
} from "@/lib/types";
import { StatCard } from "@/components/overview/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RestrictionsTable } from "./restrictions-table";
import { AppealsTable } from "./appeals-table";

export default async function RestrictionsPage() {
  const [restrictions, appeals] = await Promise.all([
    adminApi<AccountRestrictionRow[]>("/admin/restrictions"),
    adminApi<RestrictionAppealRow[]>("/admin/appeals"),
  ]);

  const activeRestricted = restrictions.filter(
    (row) => row.status === "active" && row.level === "restricted",
  ).length;
  const activeSuspended = restrictions.filter(
    (row) => row.status === "active" && row.level === "suspended",
  ).length;
  const pendingAppeals = appeals.filter(
    (row) => row.status === "pending",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Restrictions</h1>
        <p className="text-sm text-muted-foreground">
          {activeRestricted + activeSuspended} active restriction
          {activeRestricted + activeSuspended === 1 ? "" : "s"} ·{" "}
          {pendingAppeals} appeal{pendingAppeals === 1 ? "" : "s"} awaiting
          review
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={ShieldBan}
          label="Restricted"
          value={activeRestricted.toLocaleString()}
          color="#e9a028"
        />
        <StatCard
          icon={ShieldOff}
          label="Suspended"
          value={activeSuspended.toLocaleString()}
          color="#d03b3b"
        />
        <StatCard
          icon={MessageSquareWarning}
          label="Pending appeals"
          value={pendingAppeals.toLocaleString()}
          color="#0d8fd2"
        />
      </div>

      <Tabs defaultValue="restrictions">
        <TabsList>
          <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
          <TabsTrigger value="appeals">Appeals</TabsTrigger>
        </TabsList>

        <TabsContent value="restrictions">
          <RestrictionsTable data={restrictions} />
        </TabsContent>

        <TabsContent value="appeals">
          <AppealsTable data={appeals} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
