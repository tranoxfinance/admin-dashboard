"use client";

import { useEffect, useState, useTransition } from "react";
import { CalendarClock, Download, UserRoundX } from "lucide-react";
import { toast } from "sonner";
import { decideApplicationAction, getApplicationAction } from "@/actions/admin";
import { formatDate } from "@/lib/format";
import { describeApiError } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import type { JobApplicationRow } from "@/lib/types";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ApplicationStatusBadge } from "./applications-table";

type DecisionMode = "none" | "interview" | "rejected";

export function ApplicationDetailDialog({
  application,
  canManage,
  onClose,
}: {
  application: JobApplicationRow;
  canManage: boolean;
  onClose: () => void;
}) {
  const dict = useDict();
  const t = dict.careers;
  const [detail, setDetail] = useState<JobApplicationRow | null>(null);
  const [mode, setMode] = useState<DecisionMode>("none");
  const [message, setMessage] = useState("");
  const [interviewAt, setInterviewAt] = useState("");
  const [interviewLocation, setInterviewLocation] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    getApplicationAction(application.id).then((result) => {
      if (cancelled) {
        return;
      }
      if (result.ok && result.application) {
        setDetail(result.application);
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [application.id, dict]);

  const current = detail ?? application;
  const decidable = current.status === "submitted" || current.status === "interview";

  function submitDecision(decision: "interview" | "rejected" | "hired") {
    startTransition(async () => {
      const result = await decideApplicationAction(current.id, {
        decision,
        message: message.trim() || undefined,
        interviewAt:
          decision === "interview" && interviewAt
            ? new Date(interviewAt).toISOString()
            : undefined,
        interviewLocation:
          decision === "interview" && interviewLocation.trim()
            ? interviewLocation.trim()
            : undefined,
      });
      if (result.ok && result.application) {
        toast.success(
          decision === "interview"
            ? t.interviewSentToast
            : decision === "rejected"
              ? t.rejectionSentToast
              : t.hiredToast,
        );
        setDetail({ ...current, ...result.application });
        setMode("none");
        setMessage("");
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
            {current.fullName}
            <ApplicationStatusBadge status={current.status} dict={dict} />
          </DialogTitle>
          <DialogDescription>
            {current.jobTitle} · {current.reference}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 text-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">{t.fieldEmail}</p>
              <p className="break-all">{current.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t.fieldPhone}</p>
              <p>{current.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t.colApplied}</p>
              <p>{formatDate(current.createdAt, dict.common.dateLocale)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t.fieldLinkedin}</p>
              {current.linkedinUrl ? (
                <a
                  href={current.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-primary hover:underline"
                >
                  {current.linkedinUrl}
                </a>
              ) : (
                <p>—</p>
              )}
            </div>
          </div>

          {current.coverLetter ? (
            <div>
              <p className="text-xs text-muted-foreground">{t.fieldCoverLetter}</p>
              <p className="whitespace-pre-wrap rounded-lg bg-muted p-3">
                {current.coverLetter}
              </p>
            </div>
          ) : null}

          {current.interviewAt ? (
            <div>
              <p className="text-xs text-muted-foreground">{t.fieldInterviewAt}</p>
              <p>{formatDate(current.interviewAt, dict.common.dateLocale)}</p>
            </div>
          ) : null}

          <div>
            <p className="text-xs text-muted-foreground">{t.fieldCv}</p>
            {detail ? (
              detail.cvUrl ? (
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={
                    <a href={detail.cvUrl} target="_blank" rel="noreferrer" />
                  }
                >
                  <Download className="size-3.5" />
                  {detail.cvFilename}
                </Button>
              ) : (
                <p className="text-muted-foreground">{t.cvUnavailable}</p>
              )
            ) : (
              <Skeleton className="h-8 w-40" />
            )}
          </div>
        </div>

        {canManage && decidable ? (
          mode === "none" ? (
            <DialogFooter>
              <Button
                variant="destructive"
                disabled={isPending}
                onClick={() => setMode("rejected")}
              >
                <UserRoundX className="size-3.5" />
                {t.reject}
              </Button>
              {current.status === "interview" ? (
                <Button disabled={isPending} onClick={() => submitDecision("hired")}>
                  {t.markHired}
                </Button>
              ) : null}
              <Button disabled={isPending} onClick={() => setMode("interview")}>
                <CalendarClock className="size-3.5" />
                {t.inviteToInterview}
              </Button>
            </DialogFooter>
          ) : (
            <div className="flex flex-col gap-3 rounded-lg border p-4">
              <p className="text-sm font-medium">
                {mode === "interview" ? t.interviewFormTitle : t.rejectFormTitle}
              </p>
              {mode === "interview" ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="interview-at">{t.fieldInterviewAt}</Label>
                    <Input
                      id="interview-at"
                      type="datetime-local"
                      value={interviewAt}
                      onChange={(event) => setInterviewAt(event.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="interview-location">
                      {t.fieldInterviewLocation}
                    </Label>
                    <Input
                      id="interview-location"
                      placeholder={t.interviewLocationHint}
                      value={interviewLocation}
                      onChange={(event) =>
                        setInterviewLocation(event.target.value)
                      }
                    />
                  </div>
                </div>
              ) : null}
              <div className="flex flex-col gap-2">
                <Label htmlFor="decision-message">{t.fieldMessage}</Label>
                <Textarea
                  id="decision-message"
                  rows={4}
                  placeholder={
                    mode === "interview" ? t.interviewMessageHint : t.rejectMessageHint
                  }
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  disabled={isPending}
                  onClick={() => setMode("none")}
                >
                  {dict.common.cancel}
                </Button>
                <Button
                  variant={mode === "rejected" ? "destructive" : "default"}
                  disabled={isPending || (mode === "interview" && !interviewAt)}
                  onClick={() => submitDecision(mode)}
                >
                  {isPending
                    ? t.sending
                    : mode === "interview"
                      ? t.sendInvitation
                      : t.sendRejection}
                </Button>
              </div>
            </div>
          )
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
