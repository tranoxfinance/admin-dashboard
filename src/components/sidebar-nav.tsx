"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Activity,
  ArrowLeftRight,
  ShieldAlert,
  ScrollText,
  Headset,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/users/activity", label: "User Activity", icon: Activity },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/support", label: "Support", icon: Headset },
  { href: "/aml-flags", label: "AML Flags", icon: ShieldAlert },
  { href: "/audit-logs", label: "Audit Logs", icon: ScrollText },
];

export function SidebarNav({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();

  const activeHref = NAV_ITEMS.reduce((best, item) => {
    const matches =
      item.href === "/"
        ? pathname === "/"
        : pathname === item.href || pathname.startsWith(`${item.href}/`);
    if (!matches) {
      return best;
    }
    return item.href.length > best.length ? item.href : best;
  }, "");

  return (
    <nav className="flex flex-1 flex-col gap-0.5 p-2">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              collapsed && "justify-center px-0",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {collapsed ? null : item.label}
          </Link>
        );
      })}
    </nav>
  );
}
