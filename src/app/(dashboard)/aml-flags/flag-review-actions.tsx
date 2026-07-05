"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { reviewFlagAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export function FlagReviewActions({ flagId }: { flagId: string }) {
  const [isPending, startTransition] = useTransition();

  function review(status: "reviewed" | "dismissed") {
    startTransition(async () => {
      const result = await reviewFlagAction(flagId, status);
      if (result.ok) {
        toast.success(
          status === "reviewed" ? "Flag marked reviewed" : "Flag dismissed",
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
    </div>
  );
}
