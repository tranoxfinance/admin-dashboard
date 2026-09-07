"use client";

import { useEffect, useState, useTransition } from "react";
import { ShieldOff } from "lucide-react";
import { toast } from "sonner";
import {
  cancelKycDocumentAction,
  getUserKycDocumentsAction,
} from "@/actions/admin";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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

export function UserKycDialog({ userId }: { userId: string }) {
  const dict = useDict();
  const t = dict.users.kycDialog;
  const [open, setOpen] = useState(false);
  const [documents, setDocuments] = useState<KycDocumentRow[] | null>(null);
  const [cancelling, setCancelling] = useState<KycDocumentRow | null>(null);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      return;
    }
    let cancelled = false;
    getUserKycDocumentsAction(userId).then((result) => {
      if (cancelled) {
        return;
      }
      if (result.ok && result.documents) {
        setDocuments(result.documents);
      } else {
        toast.error(describeApiError(dict, result.error));
        setDocuments([]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, userId, dict]);

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
        setDocuments(
          (current) =>
            current?.map((doc) =>
              doc.id === documentId ? { ...doc, status: "expired" } : doc,
            ) ?? current,
        );
        setCancelling(null);
        setReason("");
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) {
            setDocuments(null);
          }
        }}
      >
        <DialogTrigger render={<Button size="sm" variant="outline" />}>
          {t.trigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.title}</DialogTitle>
            <DialogDescription>{t.description}</DialogDescription>
          </DialogHeader>
          {documents === null ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : documents.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t.empty}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.colType}</TableHead>
                  <TableHead>{t.colPurpose}</TableHead>
                  <TableHead>{t.colStatus}</TableHead>
                  <TableHead>{t.colSubmitted}</TableHead>
                  <TableHead className="text-right">
                    {dict.common.actions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.type ?? t.unknownDocument}</TableCell>
                    <TableCell>
                      {doc.purpose === "address"
                        ? t.purposeAddress
                        : t.purposeIdentity}
                    </TableCell>
                    <TableCell>{statusBadge(doc.status, t)}</TableCell>
                    <TableCell>
                      {formatDate(doc.createdAt, dict.common.dateLocale)}
                    </TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

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
