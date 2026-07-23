"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateAdminAction } from "@/actions/admin";
import { describeApiError } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import type { AdminAccountRow } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLE_VALUES: AdminAccountRow["role"][] = [
  "super_admin",
  "admin",
  "hr",
  "support",
  "viewer",
];

const HR_ROLE_VALUES: AdminAccountRow["role"][] = ["support", "viewer"];

export function AdminRowActions({
  admin,
  currentRole,
}: {
  admin: AdminAccountRow;
  currentRole: AdminAccountRow["role"];
}) {
  const [isPending, startTransition] = useTransition();
  const dict = useDict();
  const isHr = currentRole === "hr";
  const roleOptions = isHr ? HR_ROLE_VALUES : ROLE_VALUES;

  function update(changes: {
    role?: AdminAccountRow["role"];
    isActive?: boolean;
  }) {
    startTransition(async () => {
      const result = await updateAdminAction(admin.id, changes);
      if (result.ok) {
        toast.success(dict.admins.updatedToast);
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  if (isHr && !HR_ROLE_VALUES.includes(admin.role)) {
    return null;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Select
        value={admin.role}
        onValueChange={(value) => {
          if (value && value !== admin.role) {
            update({ role: value as AdminAccountRow["role"] });
          }
        }}
      >
        <SelectTrigger className="h-8 w-36" disabled={isPending}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {roleOptions.map((role) => (
            <SelectItem key={role} value={role}>
              {dict.admins.roles[role]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant={admin.isActive ? "destructive" : "outline"}
        disabled={isPending}
        onClick={() => update({ isActive: !admin.isActive })}
      >
        {admin.isActive ? dict.admins.deactivate : dict.admins.activate}
      </Button>
    </div>
  );
}
