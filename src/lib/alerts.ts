import type { Dict } from "@/lib/i18n";
import { formatCurrency } from "@/lib/format";
import type { AdminAlert, AdminAlertView } from "@/lib/types";

function text(value: string | number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

function count(value: string | number | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function alertView(dict: Dict, alert: AdminAlert): AdminAlertView {
  const params = alert.params;
  const amount = text(params.amount ?? params.needed);
  const currency = text(params.currency);
  return {
    customer: text(params.customer) || dict.alerts.aCustomer,
    amount: amount && currency ? formatCurrency(amount, currency) : amount,
    reason: text(params.reason),
    reference: text(params.reference),
    subject: text(params.subject),
    operator: text(params.operator),
    level: text(params.level),
    detail: text(params.detail ?? params.shortfall),
    kind: text(params.kind),
    currency,
    count: count(params.failures ?? params.errors),
    minutes: count(params.minutes),
    hours: count(params.hours),
    attempt: count(params.attempt),
  };
}

export function describeAlert(
  dict: Dict,
  alert: AdminAlert,
): { title: string; body: string } {
  const template = dict.alerts.types[alert.type];
  const view = alertView(dict, alert);
  return { title: template.title(view), body: template.body(view) };
}

const RELATIVE_STEPS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

export function timeAgo(value: string, locale: string): string {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  for (const [unit, size] of RELATIVE_STEPS) {
    if (Math.abs(seconds) >= size) {
      return format.format(Math.round(seconds / size), unit);
    }
  }
  return format.format(0, "minute");
}

export const SEVERITY_DOT: Record<AdminAlert["severity"], string> = {
  info: "bg-info",
  warning: "bg-warning",
  critical: "bg-destructive",
};
