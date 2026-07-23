"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  escalateRestrictionAction,
  liftRestrictionAction,
} from "@/actions/admin";
import { describeApiError } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";

export function RestrictionActions({
  restrictionId,
  level,
}: {
  restrictionId: string;
  level: "restricted" | "suspended";
}) {
  const [isPending, startTransition] = useTransition();
  const dict = useDict();

  function lift() {
    startTransition(async () => {
      const result = await liftRestrictionAction(restrictionId);
      if (result.ok) {
        toast.success(dict.restrictions.liftedToast);
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  function escalate() {
    startTransition(async () => {
      const result = await escalateRestrictionAction(restrictionId);
      if (result.ok) {
        toast.success(dict.restrictions.suspendedToast);
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  return (
    <div className="flex justify-end gap-2">
      {level === "restricted" ? (
        <Button
          size="sm"
          variant="destructive"
          disabled={isPending}
          onClick={escalate}
        >
          {dict.restrictions.escalate}
        </Button>
      ) : null}
      <Button size="sm" variant="outline" disabled={isPending} onClick={lift}>
        {dict.restrictions.lift}
      </Button>
    </div>
  );
}
