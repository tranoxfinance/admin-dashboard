"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createRestrictionAction } from "@/actions/admin";
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

const LEVEL_OPTIONS = [
  { value: "restricted", label: "Restricted — transactions blocked" },
  { value: "suspended", label: "Suspended — login blocked" },
] as const;

const REASON_OPTIONS = [
  { value: "fraud_suspicion", label: "Fraud suspicion" },
  { value: "compliance_review", label: "Compliance review" },
  { value: "other", label: "Other" },
] as const;

export function UserRestrictDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState<"restricted" | "suspended">("restricted");
  const [reason, setReason] = useState<
    "fraud_suspicion" | "compliance_review" | "other"
  >("fraud_suspicion");
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await createRestrictionAction(userId, {
        level,
        reason,
        note: note.trim() || undefined,
      });
      if (result.ok) {
        toast.success(
          level === "suspended" ? "Account suspended" : "Account restricted",
        );
        setOpen(false);
        setNote("");
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        Restrict
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restrict this account?</DialogTitle>
          <DialogDescription>
            Restricted accounts can sign in but cannot move money. Suspended
            accounts are signed out and cannot log back in. The user is
            notified and can submit one appeal.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Level</Label>
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
                {LEVEL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Reason</Label>
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
                {REASON_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="restriction-note">Internal note (optional)</Label>
            <Input
              id="restriction-note"
              value={note}
              maxLength={500}
              placeholder="Context for other admins"
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={handleConfirm}
          >
            {isPending
              ? "Applying…"
              : level === "suspended"
                ? "Suspend account"
                : "Restrict account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
