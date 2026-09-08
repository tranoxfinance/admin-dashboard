"use client";

import { useState, useTransition } from "react";
import { ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { revokeDeviceAction } from "@/actions/admin";
import { formatDate } from "@/lib/format";
import { describeApiError } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import type { KnownDeviceRow } from "@/lib/types";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function UserDevicesPanel({
  userId,
  canManage,
  initialDevices,
}: {
  userId: string;
  canManage: boolean;
  initialDevices: KnownDeviceRow[];
}) {
  const dict = useDict();
  const t = dict.users.devicesPanel;
  const [devices, setDevices] = useState(initialDevices);
  const [revoking, setRevoking] = useState<KnownDeviceRow | null>(null);
  const [isPending, startTransition] = useTransition();

  function confirmRevoke() {
    if (!revoking) {
      return;
    }
    const deviceId = revoking.deviceId;
    startTransition(async () => {
      const result = await revokeDeviceAction(userId, deviceId);
      if (result.ok) {
        toast.success(t.revoked);
        setDevices((current) =>
          current.filter((device) => device.deviceId !== deviceId),
        );
        setRevoking(null);
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  if (devices.length === 0) {
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
            <TableHead>{t.colPlatform}</TableHead>
            <TableHead>{t.colLastIp}</TableHead>
            <TableHead>{t.colFirstSeen}</TableHead>
            <TableHead>{t.colLastSeen}</TableHead>
            {canManage ? (
              <TableHead className="text-right">
                {dict.common.actions}
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.id}>
              <TableCell>
                <Badge variant="outline">
                  {device.platform ?? t.unknownPlatform}
                </Badge>
              </TableCell>
              <TableCell>{device.lastIp ?? "—"}</TableCell>
              <TableCell>
                {formatDate(device.firstSeenAt, dict.common.dateLocale)}
              </TableCell>
              <TableCell>
                {formatDate(device.lastSeenAt, dict.common.dateLocale)}
              </TableCell>
              {canManage ? (
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setRevoking(device)}
                  >
                    <ShieldOff className="size-3.5" />
                    {t.revoke}
                  </Button>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={revoking !== null}
        onOpenChange={(next) => (!next ? setRevoking(null) : undefined)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.revokeConfirmTitle}</DialogTitle>
            <DialogDescription>{t.revokeConfirmDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevoking(null)}>
              {dict.common.cancel}
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={confirmRevoke}
            >
              {isPending ? t.revoking : t.confirmRevoke}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
