"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Download, XCircle } from "lucide-react";
import { toast } from "sonner";
import { decideEddAction, getEddAction } from "@/actions/admin";
import { formatDate } from "@/lib/format";
import { describeApiError } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import type { EddSubmissionRow } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { EddStatusBadge, formatVolume } from "./edd-table";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="whitespace-pre-wrap break-words">{value}</p>
    </div>
  );
}

export function EddDetailDialog({
  submission,
  canDecide,
  onClose,
}: {
  submission: EddSubmissionRow;
  canDecide: boolean;
  onClose: () => void;
}) {
  const dict = useDict();
  const t = dict.edd;
  const router = useRouter();
  const [detail, setDetail] = useState<EddSubmissionRow | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    getEddAction(submission.id).then((result) => {
      if (cancelled) {
        return;
      }
      if (result.ok && result.submission) {
        setDetail(result.submission);
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [submission.id, dict]);

  const current = detail ?? submission;
  const locale = dict.common.dateLocale;

  function decide(decision: "approve" | "reject") {
    startTransition(async () => {
      const result = await decideEddAction(current.id, {
        decision,
        note: decision === "reject" ? note.trim() : undefined,
      });
      if (result.ok) {
        toast.success(decision === "approve" ? t.approvedToast : t.rejectedToast);
        router.refresh();
        onClose();
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  return (
    <Dialog open onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {current.userName ?? current.userPhone ?? current.userId}
            <EddStatusBadge status={current.status} dict={dict} />
          </DialogTitle>
          <DialogDescription>
            {formatDate(current.createdAt, locale)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 text-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label={t.fieldPhone} value={current.userPhone ?? "—"} />
            <Field label={t.fieldEmail} value={current.userEmail ?? "—"} />
            <Field
              label={t.fieldCountry}
              value={
                current.userCountry
                  ? (dict.markets[current.userCountry] ?? current.userCountry)
                  : "—"
              }
            />
            <Field
              label={t.fieldTier}
              value={current.kycTier === null ? "—" : String(current.kycTier)}
            />
            <Field label={t.fieldOccupation} value={current.occupation} />
            <Field label={t.fieldEmployer} value={current.employer ?? "—"} />
            <Field
              label={t.colSource}
              value={t.sources[current.sourceOfFunds] ?? current.sourceOfFunds}
            />
            <Field
              label={t.colVolume}
              value={formatVolume(
                current.expectedMonthlyVolume,
                current.volumeCurrency,
                locale,
              )}
            />
          </div>

          {current.sourceOfFundsDetail ? (
            <Field label={t.fieldSourceDetail} value={current.sourceOfFundsDetail} />
          ) : null}
          <Field label={t.fieldPurpose} value={current.purposeOfTransfers} />

          <div>
            <p className="text-xs text-muted-foreground">{t.fieldDocument}</p>
            {detail ? (
              detail.documentUrl ? (
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={
                    <a href={detail.documentUrl} target="_blank" rel="noreferrer" />
                  }
                >
                  <Download className="size-3.5" />
                  {detail.documentFilename}
                </Button>
              ) : (
                <p className="text-muted-foreground">{t.documentUnavailable}</p>
              )
            ) : (
              <Skeleton className="h-8 w-40" />
            )}
          </div>

          {current.reviewedAt ? (
            <div>
              <p className="text-xs text-muted-foreground">
                {t.reviewedOn(formatDate(current.reviewedAt, locale))}
              </p>
              {current.reviewNote ? (
                <p className="whitespace-pre-wrap rounded-lg bg-muted p-3">
                  {current.reviewNote}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {canDecide && current.status === "pending" ? (
          rejecting ? (
            <div className="flex flex-col gap-3 rounded-lg border p-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edd-reject-note">{t.rejectTitle}</Label>
                <Textarea
                  id="edd-reject-note"
                  rows={4}
                  maxLength={500}
                  placeholder={t.rejectHint}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  disabled={isPending}
                  onClick={() => setRejecting(false)}
                >
                  {dict.common.cancel}
                </Button>
                <Button
                  variant="destructive"
                  disabled={isPending || note.trim().length < 3}
                  onClick={() => decide("reject")}
                >
                  {isPending ? t.working : t.confirmReject}
                </Button>
              </div>
            </div>
          ) : (
            <DialogFooter>
              <Button
                variant="destructive"
                disabled={isPending}
                onClick={() => setRejecting(true)}
              >
                <XCircle className="size-3.5" />
                {t.reject}
              </Button>
              <Button disabled={isPending} onClick={() => decide("approve")}>
                <CheckCircle2 className="size-3.5" />
                {isPending ? t.working : t.approve}
              </Button>
            </DialogFooter>
          )
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
