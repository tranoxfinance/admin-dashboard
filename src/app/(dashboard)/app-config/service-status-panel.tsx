"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateServiceStatusAction } from "@/actions/admin";
import { describeApiError } from "@/lib/i18n";
import type { ServiceName, ServiceStatusLevel, ServiceStatusRow } from "@/lib/types";
import { useDict } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SERVICE_KEYS: ServiceName[] = [
  "transfers",
  "topups",
  "withdrawals",
  "kyc",
];
const STATUS_LEVELS: ServiceStatusLevel[] = ["operational", "degraded", "down"];

function ServiceRow({ initial }: { initial: ServiceStatusRow }) {
  const [status, setStatus] = useState<ServiceStatusLevel>(initial.status);
  const [message, setMessage] = useState(initial.message ?? "");
  const [isPending, startTransition] = useTransition();
  const dict = useDict();
  const t = dict.appConfig;

  const serviceLabel: Record<ServiceName, string> = {
    transfers: t.serviceTransfers,
    topups: t.serviceTopups,
    withdrawals: t.serviceWithdrawals,
    kyc: t.serviceKyc,
  };
  const statusLabel: Record<ServiceStatusLevel, string> = {
    operational: t.statusOperational,
    degraded: t.statusDegraded,
    down: t.statusDown,
  };
  const statusVariant: Record<ServiceStatusLevel, "default" | "secondary" | "destructive"> = {
    operational: "secondary",
    degraded: "default",
    down: "destructive",
  };

  function handleSave() {
    startTransition(async () => {
      const result = await updateServiceStatusAction(initial.service, {
        status,
        message: message.trim() || undefined,
      });
      if (result.ok) {
        toast.success(t.serviceStatusSaved);
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border py-4 last:border-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">{serviceLabel[initial.service]}</span>
        <div className="flex gap-1.5">
          {STATUS_LEVELS.map((level) => (
            <Button
              key={level}
              type="button"
              size="sm"
              variant={status === level ? statusVariant[level] : "outline"}
              onClick={() => setStatus(level)}
            >
              {statusLabel[level]}
            </Button>
          ))}
        </div>
      </div>
      {status !== "operational" ? (
        <div className="flex flex-col gap-2">
          <Label className="text-xs text-muted-foreground">
            {t.serviceMessage}
          </Label>
          <Input
            value={message}
            maxLength={500}
            placeholder={t.serviceMessagePlaceholder}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>
      ) : null}
      <div>
        <Button size="sm" disabled={isPending} onClick={handleSave}>
          {isPending ? t.saving : t.save}
        </Button>
      </div>
    </div>
  );
}

export function ServiceStatusPanel({ data }: { data: ServiceStatusRow[] }) {
  const dict = useDict();
  const byService = new Map(data.map((row) => [row.service, row]));
  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.appConfig.serviceStatusTitle}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {dict.appConfig.serviceStatusSubtitle}
        </p>
      </CardHeader>
      <CardContent>
        {SERVICE_KEYS.map((service) => {
          const row = byService.get(service);
          if (!row) {
            return null;
          }
          return <ServiceRow key={service} initial={row} />;
        })}
      </CardContent>
    </Card>
  );
}
