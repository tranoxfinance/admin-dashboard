"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  escalateRestrictionAction,
  liftRestrictionAction,
} from "@/actions/admin";
import { Button } from "@/components/ui/button";

export function RestrictionActions({
  restrictionId,
  level,
}: {
  restrictionId: string;
  level: "restricted" | "suspended";
}) {
  const [isPending, startTransition] = useTransition();

  function lift() {
    startTransition(async () => {
      const result = await liftRestrictionAction(restrictionId);
      if (result.ok) {
        toast.success("Restriction lifted");
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  }

  function escalate() {
    startTransition(async () => {
      const result = await escalateRestrictionAction(restrictionId);
      if (result.ok) {
        toast.success("Account suspended");
      } else {
        toast.error(result.error ?? "Something went wrong");
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
          Escalate
        </Button>
      ) : null}
      <Button size="sm" variant="outline" disabled={isPending} onClick={lift}>
        Lift
      </Button>
    </div>
  );
}
