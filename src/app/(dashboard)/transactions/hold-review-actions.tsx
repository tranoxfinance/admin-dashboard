"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { releaseHoldAction, rejectHoldAction } from "@/actions/admin";
import { describeApiError } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function HoldReviewActions({
  transactionId,
}: {
  transactionId: string;
}) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const dict = useDict();

  function release() {
    startTransition(async () => {
      const result = await releaseHoldAction(transactionId);
      if (result.ok) {
        toast.success(dict.transactions.releaseSuccess);
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  function reject() {
    startTransition(async () => {
      const result = await rejectHoldAction(transactionId, reason.trim());
      if (result.ok) {
        toast.success(dict.transactions.rejectSuccess);
        setRejectOpen(false);
        setReason("");
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  return (
    <div className="flex justify-end gap-2">
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogTrigger render={<Button size="sm" variant="destructive" />}>
          {dict.transactions.reject}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dict.transactions.rejectTitle}</DialogTitle>
            <DialogDescription>
              {dict.transactions.rejectDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reject-reason">
              {dict.transactions.rejectReasonLabel}
            </Label>
            <Textarea
              id="reject-reason"
              rows={3}
              placeholder={dict.transactions.rejectReasonPlaceholder}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              {dict.common.cancel}
            </Button>
            <Button
              variant="destructive"
              disabled={isPending || reason.trim().length < 3}
              onClick={reject}
            >
              {isPending
                ? dict.transactions.rejecting
                : dict.transactions.rejectConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button size="sm" disabled={isPending} onClick={release}>
        {isPending ? dict.transactions.releasing : dict.transactions.release}
      </Button>
    </div>
  );
}
