"use client";

import { useRouter } from "next/navigation";
import { markAlertsReadAction } from "@/actions/admin";
import { useDict } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { describeAlert, SEVERITY_DOT, timeAgo } from "@/lib/alerts";
import { formatDate } from "@/lib/format";
import type { AdminAlert } from "@/lib/types";
import { cn } from "@/lib/utils";

const SEVERITY_BADGE = {
  info: "info",
  warning: "warning",
  critical: "destructive",
} as const;

export function AlertsList({
  alerts,
  emptyLabel,
}: {
  alerts: AdminAlert[];
  emptyLabel: string;
}) {
  const dict = useDict();
  const router = useRouter();

  async function openAlert(alert: AdminAlert) {
    if (!alert.read) {
      await markAlertsReadAction([alert.id]);
    }
    if (alert.link) {
      router.push(alert.link);
    } else {
      router.refresh();
    }
  }

  if (alerts.length === 0) {
    return (
      <Card className="items-center py-12 text-sm text-muted-foreground">
        {emptyLabel}
      </Card>
    );
  }

  return (
    <Card className="gap-0 divide-y py-0">
      {alerts.map((alert) => {
        const { title, body } = describeAlert(dict, alert);
        return (
          <button
            key={alert.id}
            type="button"
            onClick={() => void openAlert(alert)}
            className={cn(
              "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60",
              !alert.read && "bg-primary/[0.03]",
            )}
          >
            <span
              className={cn(
                "mt-1.5 size-2 shrink-0 rounded-full",
                alert.read ? "bg-transparent" : SEVERITY_DOT[alert.severity],
              )}
            />
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "text-sm",
                    alert.read ? "text-muted-foreground" : "font-medium",
                  )}
                >
                  {title}
                </span>
                <Badge variant={SEVERITY_BADGE[alert.severity]}>
                  {dict.alerts.severities[alert.severity]}
                </Badge>
                <Badge variant="outline">
                  {dict.alerts.categories[alert.category]}
                </Badge>
              </span>
              {body ? (
                <span className="text-sm text-muted-foreground">{body}</span>
              ) : null}
            </span>
            <span
              className="shrink-0 text-xs text-muted-foreground"
              title={formatDate(alert.createdAt, dict.common.dateLocale)}
            >
              {timeAgo(alert.createdAt, dict.common.dateLocale)}
            </span>
          </button>
        );
      })}
    </Card>
  );
}
