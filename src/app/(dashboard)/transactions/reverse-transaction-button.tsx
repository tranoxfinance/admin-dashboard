"use client";

import { toast } from "sonner";
import { reverseTransactionAction } from "@/actions/admin";
import { describeApiError } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";

export function ReverseTransactionButton({
  transactionId,
}: {
  transactionId: string;
}) {
  const dict = useDict();
  const t = dict.transactions;

  async function handleConfirm() {
    const result = await reverseTransactionAction(transactionId);
    if (result.ok) {
      toast.success(t.reverseSuccess);
      return true;
    }
    toast.error(describeApiError(dict, result.error));
    return false;
  }

  return (
    <ConfirmDialog
      trigger={
        <Button size="sm" variant="destructive">
          {t.reverse}
        </Button>
      }
      title={t.reverseTitle}
      description={t.reverseDescription}
      confirmLabel={t.reverseConfirm}
      pendingLabel={t.reversing}
      destructive
      onConfirm={handleConfirm}
    />
  );
}
