"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { useDict } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const dict = useDict();
  return (
    <form action={logoutAction}>
      <Button
        type="submit"
        variant="ghost"
        size="icon-sm"
        aria-label={dict.nav.signOut}
        className="text-muted-foreground"
      >
        <LogOut className="size-4" />
      </Button>
    </form>
  );
}
