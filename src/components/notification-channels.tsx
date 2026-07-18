"use client";

import type { AdminNotificationChannel } from "@/lib/types";
import { Button } from "@/components/ui/button";

const OPTIONS: AdminNotificationChannel[] = ["email", "push", "inbox"];

export function NotificationChannelPicker({
  value,
  onChange,
  labels,
}: {
  value: AdminNotificationChannel[];
  onChange: (value: AdminNotificationChannel[]) => void;
  labels: Record<AdminNotificationChannel, string>;
}) {
  function toggle(channel: AdminNotificationChannel) {
    onChange(
      value.includes(channel)
        ? value.filter((existing) => existing !== channel)
        : [...value, channel],
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((channel) => (
        <Button
          key={channel}
          type="button"
          size="sm"
          variant={value.includes(channel) ? "default" : "outline"}
          onClick={() => toggle(channel)}
        >
          {labels[channel]}
        </Button>
      ))}
    </div>
  );
}
