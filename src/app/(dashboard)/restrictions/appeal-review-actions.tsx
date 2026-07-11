"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { reviewAppealAction } from "@/actions/admin";
import { describeApiError } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";

export function AppealReviewActions({ appealId }: { appealId: string }) {
  const [isPending, startTransition] = useTransition();
  const dict = useDict();

  function review(decision: "approved" | "rejected") {
    startTransition(async () => {
      const result = await reviewAppealAction(appealId, decision);
      if (result.ok) {
        toast.success(
          decision === "approved"
            ? dict.restrictions.approvedToast
            : dict.restrictions.rejectedToast,
        );
      } else {
        toast.error(describeApiError(dict, result.error));
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
        {dict.restrictions.reject}
      </Button>
      <Button size="sm" disabled={isPending} onClick={() => review("approved")}>
        {dict.restrictions.approve}
      </Button>
    </div>
  );
}
