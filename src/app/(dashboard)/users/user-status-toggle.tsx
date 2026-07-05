"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setUserActiveAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export function UserStatusToggle({
  userId,
  isActive,
}: {
  userId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await setUserActiveAction(userId, !isActive);
      if (result.ok) {
        toast.success(
          isActive ? "User deactivated" : "User activated",
        );
      } else {
        toast.error(result.error ?? "Something went wrong");
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
      {isActive ? "Deactivate" : "Activate"}
    </Button>
  );
}
