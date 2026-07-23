import Link from "next/link";
import { redirect } from "next/navigation";
import { Bot, MessagesSquare, TicketCheck, UserRoundSearch } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { getDict } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";
import type {
  SupportConversationKind,
  SupportConversationRow,
  SupportConversationStatus,
  SupportTicketCategory,
} from "@/lib/types";
import { InsightCard } from "@/components/insight-card";
import { StatCard } from "@/components/overview/stat-card";
import { DonutStatCard } from "@/components/overview/donut-stat-card";
import { BarList } from "@/components/charts/bar-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupportConversationsTable } from "./support-conversations-table";

function buildHref(status: string, kind: string): string {
  const params = new URLSearchParams({ view: "conversations" });
  if (status !== "all") {
    params.set("status", status);
  }
  if (kind !== "all") {
    params.set("kind", kind);
  }
  return `/support?${params.toString()}`;
}

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; kind?: string; view?: string }>;
}) {
  const params = await searchParams;
  const session = await getSession();
  if (session?.role === "hr") {
    redirect("/");
  }
  const dict = await getDict();
  const statusFilters: {
    label: string;
    value: SupportConversationStatus | "all";
  }[] = [
    { label: dict.support.filterAll, value: "all" },
    { label: dict.support.statusPendingAgent, value: "pending_agent" },
    { label: dict.support.statusActive, value: "active" },
    { label: dict.support.statusBot, value: "bot" },
    { label: dict.support.statusResolved, value: "resolved" },
    { label: dict.support.statusClosed, value: "closed" },
  ];
  const kindFilters: {
    label: string;
    value: SupportConversationKind | "all";
  }[] = [
    { label: dict.support.filterEverything, value: "all" },
    { label: dict.support.filterTickets, value: "ticket" },
    { label: dict.support.filterLiveChats, value: "chat" },
  ];
  const statusSegmentDefs: {
    status: SupportConversationStatus;
    label: string;
    color: string;
  }[] = [
    {
      status: "pending_agent",
      label: dict.support.statusPendingAgent,
      color: "#e9a028",
    },
    {
      status: "active",
      label: dict.support.statusActiveWithAgent,
      color: "#0d8fd2",
    },
    { status: "bot", label: dict.support.statusBot, color: "#5ba2ca" },
    {
      status: "resolved",
      label: dict.support.statusResolved,
      color: "#0ca30c",
    },
    { status: "closed", label: dict.support.statusClosed, color: "#898781" },
  ];
  const status = params.status ?? "all";
  const kind = params.kind ?? "all";
  const defaultTab = params.view === "conversations" ? "conversations" : "analytics";
  const query = new URLSearchParams();
  if (status !== "all") {
    query.set("status", status);
  }
  if (kind !== "all") {
    query.set("kind", kind);
  }
  const queryString = query.toString();
  const filtered = queryString.length > 0;

  const [conversations, allConversations] = await Promise.all([
    adminApi<SupportConversationRow[]>(
      `/admin/support/conversations${queryString ? `?${queryString}` : ""}`,
    ),
    filtered
      ? adminApi<SupportConversationRow[]>("/admin/support/conversations")
      : Promise.resolve<SupportConversationRow[] | null>(null),
  ]);

  const all = allConversations ?? conversations;

  const countByStatus = (value: SupportConversationStatus) =>
    all.filter((row) => row.status === value).length;

  const openTickets = all.filter(
    (row) =>
      row.kind === "ticket" &&
      (row.status === "pending_agent" || row.status === "active"),
  ).length;

  const statusSegments = statusSegmentDefs.map((segment) => ({
    label: segment.label,
    value: countByStatus(segment.status),
    color: segment.color,
  })).filter((segment) => segment.value > 0);

  const tickets = all.filter((row) => row.kind === "ticket");
  const categoryItems = (
    Object.keys(dict.support.categories) as SupportTicketCategory[]
  )
    .map((category) => ({
      label: dict.support.categories[category],
      value: tickets.filter((row) => row.category === category).length,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          {dict.support.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {dict.support.subtitle(conversations.length, openTickets)}
        </p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="analytics">{dict.common.analytics}</TabsTrigger>
          <TabsTrigger value="conversations">
            {dict.support.tabConversations}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={UserRoundSearch}
              label={dict.support.statNeedsAgent}
              value={countByStatus("pending_agent").toLocaleString()}
              secondary={dict.support.statNeedsAgentSecondary}
              color="#e9a028"
            />
            <StatCard
              icon={MessagesSquare}
              label={dict.support.statActive}
              value={countByStatus("active").toLocaleString()}
              secondary={dict.support.statActiveSecondary}
              color="#0d8fd2"
            />
            <StatCard
              icon={Bot}
              label={dict.support.statBot}
              value={countByStatus("bot").toLocaleString()}
              secondary={dict.support.statBotSecondary}
              color="#5ba2ca"
            />
            <StatCard
              icon={TicketCheck}
              label={dict.support.statOpenTickets}
              value={openTickets.toLocaleString()}
              secondary={dict.support.statOpenTicketsSecondary(
                tickets.length.toLocaleString(),
              )}
              color="#00407a"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <InsightCard
              title={dict.support.queueHealth}
              subtitle={dict.support.queueHealthSubtitle}
            >
              <DonutStatCard
                segments={statusSegments}
                centerLabel={dict.support.conversationsCenter}
              />
            </InsightCard>
            <InsightCard
              title={dict.support.ticketsByCategory}
              subtitle={dict.support.ticketsByCategorySubtitle}
              className="lg:col-span-2"
            >
              <BarList items={categoryItems} color="#0d8fd2" />
            </InsightCard>
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1 w-fit">
              {kindFilters.map((filter) => (
                <Link
                  key={filter.value}
                  href={buildHref(status, filter.value)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    kind === filter.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {filter.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1 w-fit">
              {statusFilters.map((filter) => (
                <Link
                  key={filter.value}
                  href={buildHref(filter.value, kind)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    status === filter.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {filter.label}
                </Link>
              ))}
            </div>
          </div>

          <SupportConversationsTable data={conversations} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
