import { ShieldBan, ShieldOff, MessageSquareWarning } from "lucide-react";
import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { getDict } from "@/lib/i18n/server";
import type {
  AccountRestrictionRow,
  RestrictionAppealRow,
} from "@/lib/types";
import { StatCard } from "@/components/overview/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RestrictionsTable } from "./restrictions-table";
import { AppealsTable } from "./appeals-table";

export default async function RestrictionsPage() {
  const dict = await getDict();
  const session = await getSession();
  if (session?.role === "support" || session?.role === "hr" || session?.role === "social_media") {
    redirect("/");
  }
  const canManage = session?.role !== "viewer";
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
        <h1 className="font-heading text-2xl font-semibold">
          {dict.restrictions.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {dict.restrictions.subtitle(
            activeRestricted + activeSuspended,
            pendingAppeals,
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={ShieldBan}
          label={dict.restrictions.statRestricted}
          value={activeRestricted.toLocaleString()}
          color="#e9a028"
        />
        <StatCard
          icon={ShieldOff}
          label={dict.restrictions.statSuspended}
          value={activeSuspended.toLocaleString()}
          color="#d03b3b"
        />
        <StatCard
          icon={MessageSquareWarning}
          label={dict.restrictions.statPendingAppeals}
          value={pendingAppeals.toLocaleString()}
          color="#0d8fd2"
        />
      </div>

      <Tabs defaultValue="restrictions">
        <TabsList>
          <TabsTrigger value="restrictions">
            {dict.restrictions.tabRestrictions}
          </TabsTrigger>
          <TabsTrigger value="appeals">
            {dict.restrictions.tabAppeals}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="restrictions">
          <RestrictionsTable data={restrictions} canManage={canManage} />
        </TabsContent>

        <TabsContent value="appeals">
          <AppealsTable data={appeals} canManage={canManage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
