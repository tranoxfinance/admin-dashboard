import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { getDict } from "@/lib/i18n/server";
import type { AdminNotificationRow } from "@/lib/types";
import { BroadcastComposer } from "./broadcast-composer";
import { NotificationsHistoryTable } from "./notifications-history-table";

export default async function NotificationsPage() {
  const dict = await getDict();
  const session = await getSession();
  if (session?.role === "support" || session?.role === "hr" || session?.role === "social_media") {
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
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          {dict.notifications.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {dict.notifications.subtitle}
        </p>
      </div>

      {canManage ? <BroadcastComposer /> : null}

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          {dict.notifications.historyTitle}
        </h2>
        <NotificationsHistoryTable data={items} />
      </div>
    </div>
  );
}
