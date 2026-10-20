"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import {
  getAlertsAction,
  getUnreadAlertCountAction,
  markAlertsReadAction,
  markAllAlertsReadAction,
} from "@/actions/admin";
import { useDict } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { describeAlert, SEVERITY_DOT, timeAgo } from "@/lib/alerts";
import type { AdminAlert } from "@/lib/types";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 30000;
const DROPDOWN_LIMIT = 8;

export function AlertsBell({
  side = "bottom",
  align = "start",
}: {
  side?: "top" | "bottom" | "right";
  align?: "start" | "end";
}) {
  const dict = useDict();
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<AdminAlert[] | null>(null);
  const [failed, setFailed] = useState(false);

  const refreshCount = useCallback(async () => {
    const result = await getUnreadAlertCountAction();
    if (result.ok && typeof result.count === "number") {
      setUnread(result.count);
    }
  }, []);

  useEffect(() => {
    let active = true;
    function poll() {
      void getUnreadAlertCountAction().then((result) => {
        if (active && result.ok && typeof result.count === "number") {
          setUnread(result.count);
        }
      });
    }
    poll();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        poll();
      }
    }, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  async function loadItems() {
    const result = await getAlertsAction({ limit: DROPDOWN_LIMIT });
    if (result.ok && result.data) {
      setItems(result.data.items);
      setFailed(false);
    } else {
      setFailed(true);
    }
  }

  function handleOpenChange(open: boolean) {
    if (open) {
      void loadItems();
      void refreshCount();
    }
  }

  async function openAlert(alert: AdminAlert) {
    if (!alert.read) {
      setItems((current) =>
        current?.map((item) =>
          item.id === alert.id ? { ...item, read: true } : item,
        ) ?? null,
      );
      setUnread((count) => Math.max(0, count - 1));
      await markAlertsReadAction([alert.id]);
    }
    router.push(alert.link ?? "/alerts");
  }

  async function markAllRead() {
    setItems((current) =>
      current?.map((item) => ({ ...item, read: true })) ?? null,
    );
    setUnread(0);
    await markAllAlertsReadAction();
    router.refresh();
  }

  const label = unread > 0 ? dict.alerts.bellUnread(unread) : dict.alerts.bell;

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            title={label}
            className="relative text-muted-foreground"
          />
        }
      >
        <Bell className="size-4" />
        {unread > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-2xs leading-none font-semibold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align={align} className="w-80 p-0">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <p className="text-sm font-semibold">{dict.alerts.title}</p>
          {unread > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => void markAllRead()}
              className="text-muted-foreground"
            >
              <CheckCheck className="size-3.5" />
              {dict.alerts.markAllRead}
            </Button>
          ) : null}
        </div>
        <DropdownMenuSeparator className="my-0" />
        <div className="max-h-96 overflow-y-auto p-1">
          {failed ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {dict.alerts.loadFailed}
            </p>
          ) : items === null ? (
            <div className="flex flex-col gap-2 p-2">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="h-10 animate-pulse rounded-md bg-muted"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {dict.alerts.empty}
            </p>
          ) : (
            items.map((alert) => {
              const { title, body } = describeAlert(dict, alert);
              return (
                <DropdownMenuItem
                  key={alert.id}
                  onClick={() => void openAlert(alert)}
                  className="items-start gap-2.5 px-2 py-2"
                >
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      alert.read ? "bg-transparent" : SEVERITY_DOT[alert.severity],
                    )}
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span
                      className={cn(
                        "truncate text-sm",
                        alert.read ? "text-muted-foreground" : "font-medium",
                      )}
                    >
                      {title}
                    </span>
                    {body ? (
                      <span className="line-clamp-2 text-xs text-muted-foreground">
                        {body}
                      </span>
                    ) : null}
                    <span className="text-2xs text-muted-foreground">
                      {timeAgo(alert.createdAt, dict.common.dateLocale)}
                    </span>
                  </span>
                </DropdownMenuItem>
              );
            })
          )}
        </div>
        <DropdownMenuSeparator className="my-0" />
        <Link
          href="/alerts"
          className="block px-3 py-2 text-center text-sm font-medium text-primary hover:underline"
        >
          {dict.alerts.viewAll}
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
