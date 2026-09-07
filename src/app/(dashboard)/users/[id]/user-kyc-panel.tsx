"use client";

import { useState, useTransition } from "react";
import { ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { cancelKycDocumentAction } from "@/actions/admin";
import { formatDate } from "@/lib/format";
import { describeApiError } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import type { Dict } from "@/lib/i18n";
import type { KycDocumentRow, KycDocumentStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function statusBadge(status: KycDocumentStatus, t: Dict["users"]["kycDialog"]) {
  switch (status) {
    case "approved":
      return <Badge className="bg-green text-white">{t.statusApproved}</Badge>;
    case "in_review":
      return (
        <Badge className="bg-amber-500 text-white">{t.statusInReview}</Badge>
      );
    case "declined":
      return <Badge variant="destructive">{t.statusDeclined}</Badge>;
    case "expired":
      return <Badge variant="outline">{t.statusExpired}</Badge>;
    case "pending":
    default:
      return <Badge variant="outline">{t.statusPending}</Badge>;
  }
}

export function UserKycPanel({
  canManage,
  initialDocuments,
}: {
  canManage: boolean;
  initialDocuments: KycDocumentRow[];
}) {
  const dict = useDict();
  const t = dict.users.kycDialog;
  const [documents, setDocuments] = useState(initialDocuments);
  const [cancelling, setCancelling] = useState<KycDocumentRow | null>(null);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function confirmCancel() {
    if (!cancelling) {
      return;
    }
    const documentId = cancelling.id;
    startTransition(async () => {
      const result = await cancelKycDocumentAction(
        documentId,
        reason.trim() || undefined,
      );
      if (result.ok) {
        toast.success(t.cancelled);
        setDocuments((current) =>
          current.map((doc) =>
            doc.id === documentId ? { ...doc, status: "expired" } : doc,
          ),
        );
        setCancelling(null);
        setReason("");
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  if (documents.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        {t.empty}
      </p>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.colType}</TableHead>
            <TableHead>{t.colPurpose}</TableHead>
            <TableHead>{t.colStatus}</TableHead>
            <TableHead>{t.colSubmitted}</TableHead>
            {canManage ? (
              <TableHead className="text-right">
                {dict.common.actions}
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>{doc.type ?? t.unknownDocument}</TableCell>
              <TableCell>
                {doc.purpose === "address" ? t.purposeAddress : t.purposeIdentity}
              </TableCell>
              <TableCell>{statusBadge(doc.status, t)}</TableCell>
              <TableCell>
                {formatDate(doc.createdAt, dict.common.dateLocale)}
              </TableCell>
              {canManage ? (
                <TableCell className="text-right">
                  {doc.status === "pending" || doc.status === "in_review" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setCancelling(doc)}
                    >
                      <ShieldOff className="size-3.5" />
                      {t.cancel}
                    </Button>
                  ) : null}
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={cancelling !== null}
        onOpenChange={(next) => (!next ? setCancelling(null) : undefined)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.cancelConfirmTitle}</DialogTitle>
            <DialogDescription>{t.cancelConfirmDescription}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="kyc-cancel-reason">{t.reasonLabel}</Label>
            <Input
              id="kyc-cancel-reason"
              value={reason}
              maxLength={500}
              placeholder={t.reasonPlaceholder}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelling(null)}>
              {dict.common.cancel}
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={confirmCancel}
            >
              {isPending ? t.cancelling : t.confirmCancel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
