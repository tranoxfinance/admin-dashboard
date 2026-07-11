"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { reviewAppealAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export function AppealReviewActions({ appealId }: { appealId: string }) {
  const [isPending, startTransition] = useTransition();

  function review(decision: "approved" | "rejected") {
    startTransition(async () => {
      const result = await reviewAppealAction(appealId, decision);
      if (result.ok) {
        toast.success(
          decision === "approved"
            ? "Appeal approved and restriction lifted"
            : "Appeal rejected",
        );
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  }

  return (
    <div className="flex justify-end gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => review("rejected")}
      >
        Reject
      </Button>
      <Button size="sm" disabled={isPending} onClick={() => review("approved")}>
        Approve
      </Button>
    </div>
  );
}
