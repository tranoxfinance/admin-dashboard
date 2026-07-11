"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Activity,
  ArrowLeftRight,
  ShieldAlert,
  ShieldBan,
  ScrollText,
  ShieldCheck,
  UserCog,
  Headset,
  type LucideIcon,
} from "lucide-react";
import type { AdminRole } from "@/lib/admin-session";
import type { Dict } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  superAdminOnly?: boolean;
  children?: NavItem[];
}

function buildNavItems(dict: Dict): NavItem[] {
  return [
    { href: "/", label: dict.nav.overview, icon: LayoutDashboard },
    {
      href: "/users",
      label: dict.nav.users,
      icon: Users,
      children: [
        { href: "/users/activity", label: dict.nav.activity, icon: Activity },
        {
          href: "/restrictions",
          label: dict.nav.restrictions,
          icon: ShieldBan,
        },
      ],
    },
    {
      href: "/transactions",
      label: dict.nav.transactions,
      icon: ArrowLeftRight,
    },
    { href: "/support", label: dict.nav.support, icon: Headset },
    { href: "/aml-flags", label: dict.nav.amlFlags, icon: ShieldAlert },
    { href: "/audit-logs", label: dict.nav.auditLogs, icon: ScrollText },
    {
      href: "/admins",
      label: dict.nav.admins,
      icon: UserCog,
      superAdminOnly: true,
      children: [
        {
          href: "/admin-logs",
          label: dict.nav.adminLogs,
          icon: ShieldCheck,
          superAdminOnly: true,
        },
      ],
    },
  ];
}

export function SidebarNav({
  collapsed = false,
  role,
}: {
  collapsed?: boolean;
  role: AdminRole;
}) {
  const pathname = usePathname();
  const dict = useDict();

  const navItems = buildNavItems(dict)
    .filter((item) => !item.superAdminOnly || role === "super_admin")
    .map((item) => ({
      ...item,
      children: item.children?.filter(
        (child) => !child.superAdminOnly || role === "super_admin",
      ),
    }));

  const allItems = navItems.flatMap((item) => [
    item,
    ...(item.children ?? []),
  ]);
  const activeHref = allItems.reduce((best, item) => {
    const matches =
      item.href === "/"
        ? pathname === "/"
        : pathname === item.href || pathname.startsWith(`${item.href}/`);
    if (!matches) {
      return best;
    }
    return item.href.length > best.length ? item.href : best;
  }, "");

  function renderLink(item: NavItem, nested = false) {
    const isActive = item.href === activeHref;
    return (
      <Link
        key={item.href}
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          collapsed && "justify-center px-0",
          nested && !collapsed && "ml-6 py-1.5",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <item.icon
          className={cn("size-4 shrink-0", nested && !collapsed && "size-3.5")}
        />
        {collapsed ? null : item.label}
      </Link>
    );
  }

  return (
    <nav className="flex flex-1 flex-col gap-0.5 p-2">
      {navItems.map((item) => (
        <Fragment key={item.href}>
          {renderLink(item)}
          {item.children?.map((child) => renderLink(child, true))}
        </Fragment>
      ))}
    </nav>
  );
}
