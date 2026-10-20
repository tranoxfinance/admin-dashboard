import Link from "next/link";
import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { getDict } from "@/lib/i18n/server";
import type {
  AdminAlert,
  AdminAlertCategory,
  AdminAlertSeverity,
  Paginated,
} from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Segmented, segmentClassName } from "@/components/segmented";
import { ServerPagination } from "@/components/server-pagination";
import { AlertsList } from "./alerts-list";
import { MarkAllReadButton } from "./mark-all-read-button";

const PAGE_SIZE = 25;

const CATEGORIES: AdminAlertCategory[] = [
  "support",
  "transactions",
  "compliance",
  "operations",
];

const SEVERITIES: AdminAlertSeverity[] = ["critical", "warning", "info"];

interface AlertFilters {
  category?: AdminAlertCategory;
  severity?: AdminAlertSeverity;
  unread: boolean;
  page: number;
}

function buildHref(filters: AlertFilters, changes: Partial<AlertFilters>) {
  const next = { ...filters, page: 1, ...changes };
  const params = new URLSearchParams();
  if (next.category) params.set("category", next.category);
  if (next.severity) params.set("severity", next.severity);
  if (next.unread) params.set("unread", "1");
  if (next.page > 1) params.set("page", String(next.page));
  const query = params.toString();
  return query ? `/alerts?${query}` : "/alerts";
}

export default async function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    severity?: string;
    unread?: string;
    page?: string;
  }>;
}) {
  const session = await getSession();
  if (session?.role === "hr" || session?.role === "social_media") {
    redirect("/");
  }
  const params = await searchParams;
  const dict = await getDict();
  const filters: AlertFilters = {
    category: CATEGORIES.find((value) => value === params.category),
    severity: SEVERITIES.find((value) => value === params.severity),
    unread: params.unread === "1",
    page: Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1),
  };

  const query = new URLSearchParams({
    page: String(filters.page),
    limit: String(PAGE_SIZE),
  });
  if (filters.category) query.set("category", filters.category);
  if (filters.severity) query.set("severity", filters.severity);
  if (filters.unread) query.set("unread", "true");

  const [alerts, unread] = await Promise.all([
    adminApi<Paginated<AdminAlert>>(`/admin/alerts?${query.toString()}`),
    adminApi<{ count: number }>("/admin/alerts/unread-count"),
  ]);
  const pages = Math.max(1, Math.ceil(alerts.total / PAGE_SIZE));
  const filtered = Boolean(
    filters.category || filters.severity || filters.unread,
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={dict.alerts.title}
        description={dict.alerts.subtitle(unread.count)}
        actions={unread.count > 0 ? <MarkAllReadButton /> : null}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Segmented>
          <Link
            href={buildHref(filters, { unread: false })}
            className={segmentClassName(!filters.unread)}
          >
            {dict.alerts.all}
          </Link>
          <Link
            href={buildHref(filters, { unread: true })}
            className={segmentClassName(filters.unread)}
          >
            {dict.alerts.unreadOnly}
          </Link>
        </Segmented>
        <Segmented className="max-w-full overflow-x-auto">
          <Link
            href={buildHref(filters, { category: undefined })}
            className={segmentClassName(!filters.category)}
          >
            {dict.alerts.allCategories}
          </Link>
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              href={buildHref(filters, { category })}
              className={segmentClassName(filters.category === category)}
            >
              {dict.alerts.categories[category]}
            </Link>
          ))}
        </Segmented>
        <Segmented>
          <Link
            href={buildHref(filters, { severity: undefined })}
            className={segmentClassName(!filters.severity)}
          >
            {dict.alerts.allSeverities}
          </Link>
          {SEVERITIES.map((severity) => (
            <Link
              key={severity}
              href={buildHref(filters, { severity })}
              className={segmentClassName(filters.severity === severity)}
            >
              {dict.alerts.severities[severity]}
            </Link>
          ))}
        </Segmented>
      </div>

      <AlertsList
        alerts={alerts.items}
        emptyLabel={filtered ? dict.alerts.emptyFiltered : dict.alerts.empty}
      />

      <ServerPagination
        dict={dict}
        page={filters.page}
        pageCount={pages}
        hrefFor={(page) => buildHref(filters, { page })}
      />
    </div>
  );
}
