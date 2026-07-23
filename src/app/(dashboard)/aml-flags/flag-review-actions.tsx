"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  escalateRestrictionAction,
  liftRestrictionAction,
  reviewFlagAction,
} from "@/actions/admin";
import { describeApiError } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import type { AmlFlag } from "@/lib/types";
import { Button } from "@/components/ui/button";

export function FlagReviewActions({
  flagId,
  status,
  restriction,
}: {
  flagId: string;
  status: AmlFlag["status"];
  restriction: AmlFlag["restriction"];
}) {
  const [isPending, startTransition] = useTransition();
  const dict = useDict();

  function review(nextStatus: "reviewed" | "dismissed") {
    startTransition(async () => {
      const result = await reviewFlagAction(flagId, nextStatus);
      if (result.ok) {
        toast.success(
          nextStatus === "reviewed"
            ? dict.amlFlags.reviewedToast
            : dict.amlFlags.dismissedToast,
        );
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  function lift() {
    if (!restriction) return;
    startTransition(async () => {
      const result = await liftRestrictionAction(restriction.id);
      if (result.ok) {
        toast.success(dict.amlFlags.liftedToast);
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  function escalate() {
    if (!restriction) return;
    startTransition(async () => {
      const result = await escalateRestrictionAction(restriction.id);
      if (result.ok) {
        toast.success(dict.amlFlags.suspendedToast);
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  return (
    <div className="flex justify-end gap-2">
      {restriction ? (
        <>
          {restriction.level === "restricted" ? (
            <Button
              size="sm"
              variant="destructive"
              disabled={isPending}
              onClick={escalate}
            >
              {dict.amlFlags.escalate}
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={lift}
          >
            {dict.amlFlags.liftRestriction}
          </Button>
        </>
      ) : null}
      {status === "open" ? (
        <>
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => review("dismissed")}
          >
            {dict.amlFlags.dismiss}
          </Button>
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => review("reviewed")}
          >
            {dict.amlFlags.markReviewed}
          </Button>
        </>
      ) : null}
    </div>
  );
}
