"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { getUserTransactionsAction } from "@/actions/admin";
import { describeApiError } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import type { ActivityItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActivityTable } from "../../transactions/activity-table";

export function UserTransactionsPanel({
  userId,
  canManage,
  initialData,
}: {
  userId: string;
  canManage: boolean;
  initialData: ActivityItem[];
}) {
  const dict = useDict();
  const t = dict.transactions;
  const [items, setItems] = useState(initialData);
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isPending, startTransition] = useTransition();

  function applyFilters() {
    startTransition(async () => {
      const result = await getUserTransactionsAction(userId, {
        type: type === "all" ? undefined : type,
        status: status === "all" ? undefined : status,
        dateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
        dateTo: dateTo
          ? new Date(`${dateTo}T23:59:59.999Z`).toISOString()
          : undefined,
      });
      if (result.ok && result.data) {
        setItems(result.data.items);
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  function resetFilters() {
    setType("all");
    setStatus("all");
    setDateFrom("");
    setDateTo("");
    startTransition(async () => {
      const result = await getUserTransactionsAction(userId, {});
      if (result.ok && result.data) {
        setItems(result.data.items);
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={type} onValueChange={(value) => value && setType(value)}>
          <SelectTrigger className="w-[10rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.filterAllTypes}</SelectItem>
            <SelectItem value="transfer">{t.typeTransfer}</SelectItem>
            <SelectItem value="topup">{t.typeDeposit}</SelectItem>
            <SelectItem value="withdrawal">{t.typeWithdrawal}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(value) => value && setStatus(value)}
        >
          <SelectTrigger className="w-[10rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.filterAllStatuses}</SelectItem>
            <SelectItem value="completed">{t.statusCompleted}</SelectItem>
            <SelectItem value="pending">{t.statusPending}</SelectItem>
            <SelectItem value="processing">{t.statusProcessing}</SelectItem>
            <SelectItem value="on_hold">{t.statusOnHold}</SelectItem>
            <SelectItem value="failed">{t.statusFailed}</SelectItem>
            <SelectItem value="reversed">{t.statusReversed}</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
          className="h-9 w-[9.5rem]"
        />
        <span className="text-sm text-muted-foreground">
          {dict.common.dateRangeTo}
        </span>
        <Input
          type="date"
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
          className="h-9 w-[9.5rem]"
        />
        <Button size="sm" disabled={isPending} onClick={applyFilters}>
          {dict.common.apply}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={resetFilters}
        >
          {t.filterReset}
        </Button>
      </div>
      <ActivityTable data={items} canManage={canManage} />
    </div>
  );
}
