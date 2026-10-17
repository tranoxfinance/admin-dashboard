"use client";

import { useState, useTransition } from "react";
import { getKoraLogsAction } from "@/actions/admin";
import { formatDate } from "@/lib/format";
import type { ActivityItem, KoraApiLog } from "@/lib/types";
import type { Dict } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

function conversionLabel(dict: Dict, value: string): string {
  if (value.startsWith("float:")) {
    return dict.transactions.conversionFromFloat;
  }
  if (value.startsWith("unconfirmed:")) {
    return `${dict.transactions.conversionUnconfirmed} (${value.slice("unconfirmed:".length)})`;
  }
  if (value.startsWith("legacy:")) {
    return dict.transactions.conversionLegacy;
  }
  return value;
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-all font-medium sm:text-right">{value}</span>
    </div>
  );
}

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined) {
    return null;
  }
  return (
    <details className="rounded-md bg-muted/50 p-2">
      <summary className="cursor-pointer text-xs font-medium">{label}</summary>
      <pre className="mt-2 max-h-64 overflow-auto text-xs whitespace-pre-wrap break-all">
        {JSON.stringify(value, null, 2)}
      </pre>
    </details>
  );
}

function KoraCall({ log, dict }: { log: KoraApiLog; dict: Dict }) {
  const ok =
    log.responseStatus !== null &&
    log.responseStatus < 400 &&
    !log.error;
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={ok ? "secondary" : "destructive"}>
          {log.responseStatus ?? "—"}
        </Badge>
        <span className="font-mono text-xs">
          {log.method.toUpperCase()} {log.path}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {formatDate(log.createdAt, dict.common.dateLocale)} ·{" "}
          {log.durationMs} ms
          {log.attempt > 1 ? ` · ${dict.transactions.attempt(log.attempt)}` : ""}
        </span>
      </div>
      {log.error ? (
        <p className="text-xs text-destructive">{log.error}</p>
      ) : null}
      <JsonBlock
        label={dict.transactions.request}
        value={log.requestBody ?? log.requestQuery}
      />
      <JsonBlock label={dict.transactions.response} value={log.responseBody} />
    </div>
  );
}

export function ActivityDetailsDialog({ item }: { item: ActivityItem }) {
  const dict = useDict();
  const t = dict.transactions;
  const [logs, setLogs] = useState<KoraApiLog[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(open: boolean) {
    if (!open || logs !== null || isPending) {
      return;
    }
    startTransition(async () => {
      const result = await getKoraLogsAction(item.type, item.id);
      if (result.ok && result.data) {
        setLogs(result.data);
        setFailed(false);
      } else {
        setFailed(true);
      }
    });
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        {t.details}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.detailsTitle}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <DetailLine label="ID" value={item.id} />
          {item.failureReason ? (
            <DetailLine label={t.failureReason} value={item.failureReason} />
          ) : null}
          {item.koraReference ? (
            <DetailLine label={t.koraReference} value={item.koraReference} />
          ) : null}
          {item.conversionReference ? (
            <DetailLine
              label={t.conversionReference}
              value={conversionLabel(dict, item.conversionReference)}
            />
          ) : null}
          {item.payoutAttempts ? (
            <DetailLine
              label={t.payoutAttempts}
              value={
                item.payoutRetryAt
                  ? `${item.payoutAttempts} · ${t.retryScheduled(
                      formatDate(item.payoutRetryAt, dict.common.dateLocale),
                    )}`
                  : String(item.payoutAttempts)
              }
            />
          ) : null}
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="font-medium">{t.koraCalls}</h3>
          {isPending ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : failed ? (
            <p className="text-destructive">{t.koraCallsError}</p>
          ) : logs && logs.length === 0 ? (
            <p className="text-muted-foreground">{t.koraCallsEmpty}</p>
          ) : (
            logs?.map((log) => <KoraCall key={log.id} log={log} dict={dict} />)
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
