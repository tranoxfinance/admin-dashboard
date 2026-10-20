import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { getDict } from "@/lib/i18n/server";
import type { AdminNotificationRow } from "@/lib/types";
import { BroadcastComposer } from "./broadcast-composer";
import { NotificationsHistoryTable } from "./notifications-history-table";
import { PageHeader } from "@/components/page-header";
import { ServerPagination } from "@/components/server-pagination";
import { PAGE_SIZE } from "@/lib/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
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
  const { items, total } = await adminApi<{
    items: AdminNotificationRow[];
    total: number;
    page: number;
  }>(`/admin/notifications?page=${page}&limit=${PAGE_SIZE}`);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const showHistory = !canManage || params.tab === "history";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={dict.notifications.title}
        description={dict.notifications.subtitle}
      />

      <Tabs defaultValue={showHistory ? "history" : "compose"}>
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

        <TabsContent value="history" className="flex flex-col gap-4">
          <NotificationsHistoryTable data={items} />
          <ServerPagination
            dict={dict}
            page={page}
            pageCount={pageCount}
            hrefFor={(target) => `/notifications?tab=history&page=${target}`}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
