"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { reverseTransactionAction } from "@/actions/admin";
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

  function handleConfirm() {
    startTransition(async () => {
      const result = await reverseTransactionAction(transactionId);
      if (result.ok) {
        toast.success("Transaction reversed and funds returned");
        setOpen(false);
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="destructive" />}>
        Reverse
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reverse this transaction?</DialogTitle>
          <DialogDescription>
            This refunds the sender&apos;s wallet and marks the transaction as
            reversed. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={handleConfirm}
          >
            {isPending ? "Reversing…" : "Reverse transaction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
