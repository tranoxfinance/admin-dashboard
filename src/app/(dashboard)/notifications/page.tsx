import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { getDict } from "@/lib/i18n/server";
import type { AdminNotificationRow } from "@/lib/types";
import { BroadcastComposer } from "./broadcast-composer";
import { NotificationsHistoryTable } from "./notifications-history-table";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function NotificationsPage() {
  const dict = await getDict();
  const session = await getSession();
  if (
    session?.role === "support" ||
    session?.role === "hr" ||
    session?.role === "social_media"
  ) {
    redirect("/");
  }
  const canManage = session?.role !== "viewer";
  const { items } = await adminApi<{
    items: AdminNotificationRow[];
    total: number;
    page: number;
  }>("/admin/notifications");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={dict.notifications.title}
        description={dict.notifications.subtitle}
      />

      <Tabs defaultValue={canManage ? "compose" : "history"}>
        <TabsList>
          {canManage ? (
            <TabsTrigger value="compose">{dict.nav.notifications}</TabsTrigger>
          ) : null}
          <TabsTrigger value="history">
            {dict.notifications.historyTitle}
          </TabsTrigger>
        </TabsList>

        {canManage ? (
          <TabsContent value="compose">
            <BroadcastComposer />
          </TabsContent>
        ) : null}

        <TabsContent value="history">
          <NotificationsHistoryTable data={items} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
