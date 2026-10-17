import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { getDict } from "@/lib/i18n/server";
import { formatCurrency, formatDate } from "@/lib/format";
import type { TreasuryPosition } from "@/lib/types";
import { InsightCard } from "@/components/insight-card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";

export default async function TreasuryPage() {
  const dict = await getDict();
  const session = await getSession();
  if (
    session?.role === "support" ||
    session?.role === "hr" ||
    session?.role === "social_media"
  ) {
    redirect("/");
  }
  const position = await adminApi<TreasuryPosition>("/admin/treasury");
  const t = dict.treasury;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.title}
        description={t.subtitle(
          formatDate(position.checkedAt, dict.common.dateLocale),
        )}
        actions={
          <>
            <Badge variant={position.checkEnabled ? "default" : "secondary"}>
              {position.checkEnabled ? t.checkOn : t.checkOff}
            </Badge>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {position.currencies.map((row) => {
          const difference = Number(row.difference);
          const short = difference < -1;
          const rows: [string, string, boolean][] = [
            [t.koraAvailable, row.koraAvailable, false],
            [t.koraPending, row.koraPending, false],
            [t.koraTotal, row.koraTotal, true],
            [t.customerAvailable, row.customerAvailable, false],
            [t.customerLocked, row.customerLocked, false],
            [t.float, row.float, false],
            [t.expected, row.expected, true],
          ];
          return (
            <InsightCard
              key={row.currency}
              title={row.currency}
              subtitle={t.cardSubtitle}
              action={
                <Badge
                  className={cn(
                    "border-0",
                    short
                      ? "bg-destructive/10 text-destructive"
                      : "bg-success/12 text-success",
                  )}
                >
                  {short ? t.shortfall : t.covered}
                </Badge>
              }
            >
              <dl className="flex flex-col gap-2 text-sm">
                {rows.map(([label, value, strong]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4"
                  >
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd
                      className={cn("tabular-nums", strong && "font-semibold")}
                    >
                      {formatCurrency(value, row.currency)}
                    </dd>
                  </div>
                ))}
                <div className="mt-2 flex items-center justify-between gap-4 border-t pt-3">
                  <dt className="font-medium">{t.difference}</dt>
                  <dd
                    className={cn(
                      "font-semibold tabular-nums",
                      short ? "text-destructive" : "text-success",
                    )}
                  >
                    {difference > 0 ? "+" : ""}
                    {formatCurrency(row.difference, row.currency)}
                  </dd>
                </div>
              </dl>
            </InsightCard>
          );
        })}
      </div>

      <InsightCard title={t.floatTitle} subtitle={t.floatSubtitle}>
        {position.floatLots.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.floatEmpty}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.colCurrency}</TableHead>
                <TableHead className="text-right">{t.colRemaining}</TableHead>
                <TableHead className="text-right">{t.colOriginal}</TableHead>
                <TableHead>{t.colSource}</TableHead>
                <TableHead>{t.colSince}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {position.floatLots.map((lot) => (
                <TableRow key={lot.id}>
                  <TableCell className="font-medium">{lot.currency}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(lot.remaining, lot.currency)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatCurrency(lot.amount, lot.currency)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {lot.sourceTransactionId?.slice(0, 8) ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(lot.createdAt, dict.common.dateLocale)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </InsightCard>

      <p className="text-xs text-muted-foreground">{t.footnote}</p>
    </div>
  );
}
