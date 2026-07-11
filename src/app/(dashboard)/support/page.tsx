import Link from "next/link";
import { Bot, MessagesSquare, TicketCheck, UserRoundSearch } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
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

const STATUS_FILTERS: { label: string; value: SupportConversationStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Needs agent", value: "pending_agent" },
  { label: "Active", value: "active" },
  { label: "Bot handling", value: "bot" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
];

const KIND_FILTERS: { label: string; value: SupportConversationKind | "all" }[] = [
  { label: "Everything", value: "all" },
  { label: "Tickets", value: "ticket" },
  { label: "Live chats", value: "chat" },
];

const STATUS_SEGMENTS: {
  status: SupportConversationStatus;
  label: string;
  color: string;
}[] = [
  { status: "pending_agent", label: "Needs agent", color: "#e9a028" },
  { status: "active", label: "Active with agent", color: "#0d8fd2" },
  { status: "bot", label: "Bot handling", color: "#5ba2ca" },
  { status: "resolved", label: "Resolved", color: "#0ca30c" },
  { status: "closed", label: "Closed", color: "#898781" },
];

const CATEGORY_LABELS: Record<SupportTicketCategory, string> = {
  transfer: "Transfer",
  topup: "Top-up",
  withdrawal: "Withdrawal",
  kyc: "KYC",
  account: "Account",
  other: "Other",
};

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

  const statusSegments = STATUS_SEGMENTS.map((segment) => ({
    label: segment.label,
    value: countByStatus(segment.status),
    color: segment.color,
  })).filter((segment) => segment.value > 0);

  const tickets = all.filter((row) => row.kind === "ticket");
  const categoryItems = (
    Object.keys(CATEGORY_LABELS) as SupportTicketCategory[]
  )
    .map((category) => ({
      label: CATEGORY_LABELS[category],
      value: tickets.filter((row) => row.category === category).length,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Support</h1>
        <p className="text-sm text-muted-foreground">
          {conversations.length} conversation
          {conversations.length === 1 ? "" : "s"} shown · {openTickets} open
          ticket{openTickets === 1 ? "" : "s"}
        </p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={UserRoundSearch}
              label="Needs agent"
              value={countByStatus("pending_agent").toLocaleString()}
              secondary="Waiting in the queue"
              color="#e9a028"
            />
            <StatCard
              icon={MessagesSquare}
              label="Active with agent"
              value={countByStatus("active").toLocaleString()}
              secondary="Being handled now"
              color="#0d8fd2"
            />
            <StatCard
              icon={Bot}
              label="Bot handling"
              value={countByStatus("bot").toLocaleString()}
              secondary="AI assistant conversations"
              color="#5ba2ca"
            />
            <StatCard
              icon={TicketCheck}
              label="Open tickets"
              value={openTickets.toLocaleString()}
              secondary={`${tickets.length.toLocaleString()} tickets in total`}
              color="#00407a"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <InsightCard
              title="Queue health"
              subtitle="Every conversation by current status"
            >
              <DonutStatCard
                segments={statusSegments}
                centerLabel="Conversations"
              />
            </InsightCard>
            <InsightCard
              title="Tickets by category"
              subtitle="What customers raise tickets about"
              className="lg:col-span-2"
            >
              <BarList items={categoryItems} color="#0d8fd2" />
            </InsightCard>
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1 w-fit">
              {KIND_FILTERS.map((filter) => (
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
              {STATUS_FILTERS.map((filter) => (
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
