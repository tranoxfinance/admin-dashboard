"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  escalateRestrictionAction,
  liftRestrictionAction,
  reviewFlagAction,
} from "@/actions/admin";
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

  function review(nextStatus: "reviewed" | "dismissed") {
    startTransition(async () => {
      const result = await reviewFlagAction(flagId, nextStatus);
      if (result.ok) {
        toast.success(
          nextStatus === "reviewed" ? "Flag marked reviewed" : "Flag dismissed",
        );
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  }

  function lift() {
    if (!restriction) return;
    startTransition(async () => {
      const result = await liftRestrictionAction(restriction.id);
      if (result.ok) {
        toast.success("Restriction lifted");
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  }

  function escalate() {
    if (!restriction) return;
    startTransition(async () => {
      const result = await escalateRestrictionAction(restriction.id);
      if (result.ok) {
        toast.success("Account suspended");
      } else {
        toast.error(result.error ?? "Something went wrong");
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
              Escalate
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={lift}
          >
            Lift restriction
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
            Dismiss
          </Button>
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => review("reviewed")}
          >
            Mark reviewed
          </Button>
        </>
      ) : null}
    </div>
  );
}
