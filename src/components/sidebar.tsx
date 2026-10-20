"use client";

import Image from "next/image";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { AdminRole } from "@/lib/admin-session";
import { useDict } from "@/components/i18n-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LogoutButton } from "@/components/logout-button";
import { SidebarNav } from "@/components/sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocalStorageBoolean } from "@/lib/use-local-storage-boolean";

const STORAGE_KEY = "admin-sidebar-collapsed";

export function Sidebar({ email, role }: { email: string; role: AdminRole }) {
  const [collapsed, setCollapsed] = useLocalStorageBoolean(STORAGE_KEY, false);
  const dict = useDict();

  function toggle() {
    setCollapsed(!collapsed);
  }

  const initials = email.slice(0, 2).toUpperCase();

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r bg-sidebar transition-[width] duration-200 md:flex",
        collapsed ? "w-[72px]" : "w-60",
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center border-b px-4",
          collapsed ? "justify-center px-2" : "justify-between",
        )}
      >
        {collapsed ? null : (
          <Image src="/tranox-logo.svg" alt="Tranox" width={96} height={24} className="h-6 w-auto" />
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={toggle}
          aria-label={
            collapsed ? dict.nav.expandSidebar : dict.nav.collapseSidebar
          }
          className="text-muted-foreground"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </Button>
      </div>
      <SidebarNav collapsed={collapsed} role={role} />
      <div
        className={cn(
          "flex items-center gap-2 border-t p-3",
          collapsed && "flex-col-reverse justify-center gap-2",
        )}
      >
        <Avatar size="sm">
          <AvatarFallback className="bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        {collapsed ? null : (
          <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {email}
          </p>
        )}
        <LanguageSwitcher />
        <ThemeToggle />
        <LogoutButton />
      </div>
    </aside>
  );
}
