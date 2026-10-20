import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { getDict } from "@/lib/i18n/server";
import type { EmailCampaignRow, Paginated } from "@/lib/types";
import { CampaignComposer } from "./campaign-composer";
import { CampaignsHistoryTable } from "./campaigns-history-table";
import { PageHeader } from "@/components/page-header";
import { ServerPagination } from "@/components/server-pagination";
import { PAGE_SIZE } from "@/lib/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function EmailCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const dict = await getDict();
  const session = await getSession();
  const role = session?.role;
  if (role === "support" || role === "hr") {
    redirect("/");
  }
  const canDraft =
    role === "super_admin" || role === "admin" || role === "social_media";
  const canSend = role === "super_admin" || role === "admin";
  const { items, total } = await adminApi<Paginated<EmailCampaignRow>>(
    `/admin/email-campaigns?page=${page}&limit=${PAGE_SIZE}`,
  );
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const showHistory = !canDraft || params.tab === "history";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={dict.emailCampaigns.title}
        description={dict.emailCampaigns.subtitle}
      />

      <Tabs defaultValue={showHistory ? "history" : "compose"}>
        <TabsList>
          {canDraft ? (
            <TabsTrigger value="compose">
              {dict.nav.emailCampaigns}
            </TabsTrigger>
          ) : null}
          <TabsTrigger value="history">
            {dict.emailCampaigns.historyTitle}
          </TabsTrigger>
        </TabsList>

        {canDraft ? (
          <TabsContent value="compose">
            <CampaignComposer canSend={canSend} />
          </TabsContent>
        ) : null}

        <TabsContent value="history" className="flex flex-col gap-4">
          <CampaignsHistoryTable data={items} />
          <ServerPagination
            dict={dict}
            page={page}
            pageCount={pageCount}
            hrefFor={(target) => `/email-campaigns?tab=history&page=${target}`}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
