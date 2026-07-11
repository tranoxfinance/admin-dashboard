"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { reverseTransactionAction } from "@/actions/admin";
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

export function ReverseTransactionButton({
  transactionId,
}: {
  transactionId: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dict = useDict();

  function handleConfirm() {
    startTransition(async () => {
      const result = await reverseTransactionAction(transactionId);
      if (result.ok) {
        toast.success(dict.transactions.reverseSuccess);
        setOpen(false);
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="destructive" />}>
        {dict.transactions.reverse}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dict.transactions.reverseTitle}</DialogTitle>
          <DialogDescription>
            {dict.transactions.reverseDescription}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {dict.common.cancel}
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={handleConfirm}
          >
            {isPending
              ? dict.transactions.reversing
              : dict.transactions.reverseConfirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
