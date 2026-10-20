"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { markAllAlertsReadAction } from "@/actions/admin";
import { useDict } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";

export function MarkAllReadButton() {
  const dict = useDict();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function markAll() {
    startTransition(async () => {
      await markAllAlertsReadAction();
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={markAll}
      disabled={isPending}
    >
      <CheckCheck className="size-4" />
      {dict.alerts.markAllRead}
    </Button>
  );
}
