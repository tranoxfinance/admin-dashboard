"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setUserActiveAction } from "@/actions/admin";
import { describeApiError } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";

export function UserStatusToggle({
  userId,
  isActive,
}: {
  userId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const dict = useDict();

  function handleClick() {
    startTransition(async () => {
      const result = await setUserActiveAction(userId, !isActive);
      if (result.ok) {
        toast.success(
          isActive ? dict.users.userDeactivated : dict.users.userActivated,
        );
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  return (
    <Button
      size="sm"
      variant={isActive ? "destructive" : "outline"}
      disabled={isPending}
      onClick={handleClick}
    >
      {isActive ? dict.users.deactivate : dict.users.activate}
    </Button>
  );
}
