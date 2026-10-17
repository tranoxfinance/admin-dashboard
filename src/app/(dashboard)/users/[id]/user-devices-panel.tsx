"use client";

import { useState } from "react";
import { ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { revokeDeviceAction } from "@/actions/admin";
import { formatDate } from "@/lib/format";
import { describeApiError } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import type { KnownDeviceRow } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
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

  async function confirmRevoke() {
    if (!revoking) {
      return false;
    }
    const deviceId = revoking.deviceId;
    const result = await revokeDeviceAction(userId, deviceId);
    if (result.ok) {
      toast.success(t.revoked);
      setDevices((current) =>
        current.filter((device) => device.deviceId !== deviceId),
      );
      return true;
    }
    toast.error(describeApiError(dict, result.error));
    return false;
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
            <TableHead className="whitespace-nowrap">
              {t.colPlatform}
            </TableHead>
            <TableHead className="whitespace-nowrap">
              {t.colLastIp}
            </TableHead>
            <TableHead className="whitespace-nowrap">
              {t.colFirstSeen}
            </TableHead>
            <TableHead className="whitespace-nowrap">
              {t.colLastSeen}
            </TableHead>
            {canManage ? (
              <TableHead className="w-px whitespace-nowrap text-right">
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
              <TableCell className="whitespace-nowrap">
                {device.lastIp ?? "—"}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatDate(device.firstSeenAt, dict.common.dateLocale)}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatDate(device.lastSeenAt, dict.common.dateLocale)}
              </TableCell>
              {canManage ? (
                <TableCell className="whitespace-nowrap text-right">
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

      <ConfirmDialog
        open={revoking !== null}
        onOpenChange={(next: boolean) => (!next ? setRevoking(null) : undefined)}
        title={t.revokeConfirmTitle}
        description={t.revokeConfirmDescription}
        confirmLabel={t.confirmRevoke}
        pendingLabel={t.revoking}
        destructive
        onConfirm={confirmRevoke}
      />
    </>
  );
}
