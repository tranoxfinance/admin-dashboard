"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createRestrictionAction } from "@/actions/admin";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REASON_VALUES = ["fraud_suspicion", "compliance_review", "other"] as const;

export function UserRestrictDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState<"restricted" | "suspended">("restricted");
  const [reason, setReason] = useState<(typeof REASON_VALUES)[number]>(
    "fraud_suspicion",
  );
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const dict = useDict();
  const t = dict.users.restrictDialog;

  function handleConfirm() {
    startTransition(async () => {
      const result = await createRestrictionAction(userId, {
        level,
        reason,
        note: note.trim() || undefined,
      });
      if (result.ok) {
        toast.success(
          level === "suspended" ? t.successSuspended : t.successRestricted,
        );
        setOpen(false);
        setNote("");
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        {dict.users.restrict}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>{t.level}</Label>
            <Select
              value={level}
              onValueChange={(value) => {
                if (value) setLevel(value as typeof level);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restricted">{t.levelRestricted}</SelectItem>
                <SelectItem value="suspended">{t.levelSuspended}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t.reason}</Label>
            <Select
              value={reason}
              onValueChange={(value) => {
                if (value) setReason(value as typeof reason);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REASON_VALUES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {dict.restrictions.reasons[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="restriction-note">{t.noteLabel}</Label>
            <Input
              id="restriction-note"
              value={note}
              maxLength={500}
              placeholder={t.notePlaceholder}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        </div>
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
              ? t.applying
              : level === "suspended"
                ? t.confirmSuspend
                : t.confirmRestrict}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
