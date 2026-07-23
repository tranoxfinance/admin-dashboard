"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { broadcastNotificationAction } from "@/actions/admin";
import { describeApiError } from "@/lib/i18n";
import type { AdminNotificationChannel } from "@/lib/types";
import { useDict } from "@/components/i18n-provider";
import { NotificationChannelPicker } from "@/components/notification-channels";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function BroadcastComposer() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [channels, setChannels] = useState<AdminNotificationChannel[]>([
    "push",
    "inbox",
  ]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dict = useDict();
  const t = dict.notifications;

  const canSend = title.trim().length > 0 && body.trim().length > 0 && channels.length > 0;

  function handleConfirm() {
    startTransition(async () => {
      const result = await broadcastNotificationAction({
        title: title.trim(),
        body: body.trim(),
        channels,
      });
      if (result.ok) {
        toast.success(t.success);
        setConfirmOpen(false);
        setTitle("");
        setBody("");
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.composerTitle}</CardTitle>
        <p className="text-sm text-muted-foreground">{t.composerDescription}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="broadcast-title">{t.titleLabel}</Label>
          <Input
            id="broadcast-title"
            value={title}
            maxLength={255}
            placeholder={t.titlePlaceholder}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="broadcast-body">{t.bodyLabel}</Label>
          <Textarea
            id="broadcast-body"
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
            <p className="text-xs text-destructive">{t.channelsRequired}</p>
          ) : null}
        </div>
        <div>
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogTrigger render={<Button disabled={!canSend} />}>
              {t.send}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.confirmTitle}</DialogTitle>
                <DialogDescription>{t.confirmDescription}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setConfirmOpen(false)}
                >
                  {dict.common.cancel}
                </Button>
                <Button
                  variant="destructive"
                  disabled={isPending}
                  onClick={handleConfirm}
                >
                  {isPending ? t.sending : t.confirmSend}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
