import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { getDict } from "@/lib/i18n/server";
import type { EmailCampaignRow, Paginated } from "@/lib/types";
import { CampaignComposer } from "./campaign-composer";
import { CampaignsHistoryTable } from "./campaigns-history-table";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function EmailCampaignsPage() {
  const dict = await getDict();
  const session = await getSession();
  const role = session?.role;
  if (role === "support" || role === "hr") {
    redirect("/");
  }
  const canDraft =
    role === "super_admin" || role === "admin" || role === "social_media";
  const canSend = role === "super_admin" || role === "admin";
  const { items } = await adminApi<Paginated<EmailCampaignRow>>(
    "/admin/email-campaigns",
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={dict.emailCampaigns.title}
        description={dict.emailCampaigns.subtitle}
      />

      <Tabs defaultValue={canDraft ? "compose" : "history"}>
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

        <TabsContent value="history">
          <CampaignsHistoryTable data={items} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
