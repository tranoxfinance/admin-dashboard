import Link from "next/link";
import { adminApi } from "@/lib/admin-api";
import { cn } from "@/lib/utils";
import type {
  SupportConversationKind,
  SupportConversationRow,
  SupportConversationStatus,
} from "@/lib/types";
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

function buildHref(status: string, kind: string): string {
  const params = new URLSearchParams();
  if (status !== "all") {
    params.set("status", status);
  }
  if (kind !== "all") {
    params.set("kind", kind);
  }
  const query = params.toString();
  return query ? `/support?${query}` : "/support";
}

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; kind?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "all";
  const kind = params.kind ?? "all";
  const query = new URLSearchParams();
  if (status !== "all") {
    query.set("status", status);
  }
  if (kind !== "all") {
    query.set("kind", kind);
  }
  const queryString = query.toString();
  const conversations = await adminApi<SupportConversationRow[]>(
    `/admin/support/conversations${queryString ? `?${queryString}` : ""}`,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Support</h1>
        <p className="text-sm text-muted-foreground">
          {conversations.length} conversation
          {conversations.length === 1 ? "" : "s"}
        </p>
      </div>

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
    </div>
  );
}
