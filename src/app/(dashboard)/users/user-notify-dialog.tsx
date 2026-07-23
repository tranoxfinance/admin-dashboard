"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { sendUserNotificationAction } from "@/actions/admin";
import { describeApiError } from "@/lib/i18n";
import type { AdminNotificationChannel } from "@/lib/types";
import { useDict } from "@/components/i18n-provider";
import { NotificationChannelPicker } from "@/components/notification-channels";
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
import { Textarea } from "@/components/ui/textarea";

export function UserNotifyDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [channels, setChannels] = useState<AdminNotificationChannel[]>([
    "push",
    "inbox",
  ]);
  const [isPending, startTransition] = useTransition();
  const dict = useDict();
  const t = dict.users.notifyDialog;

  function handleSend() {
    if (!title.trim() || !body.trim() || channels.length === 0) {
      return;
    }
    startTransition(async () => {
      const result = await sendUserNotificationAction(userId, {
        title: title.trim(),
        body: body.trim(),
        channels,
      });
      if (result.ok) {
        toast.success(t.success);
        setOpen(false);
        setTitle("");
        setBody("");
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        {t.trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="notify-title">{t.titleLabel}</Label>
            <Input
              id="notify-title"
              value={title}
              maxLength={255}
              placeholder={t.titlePlaceholder}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notify-body">{t.bodyLabel}</Label>
            <Textarea
              id="notify-body"
              value={body}
              maxLength={2000}
              placeholder={t.bodyPlaceholder}
              onChange={(event) => setBody(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t.channels}</Label>
            <NotificationChannelPicker
              value={channels}
              onChange={setChannels}
              labels={{
                email: t.channelEmail,
                push: t.channelPush,
                inbox: t.channelInbox,
              }}
            />
            {channels.length === 0 ? (
              <p className="text-xs text-destructive">
                {t.channelsRequired}
              </p>
            ) : null}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {dict.common.cancel}
          </Button>
          <Button
            disabled={
              isPending || !title.trim() || !body.trim() || channels.length === 0
            }
            onClick={handleSend}
          >
            {isPending ? t.sending : t.send}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
