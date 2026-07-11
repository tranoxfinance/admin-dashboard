"use client";

import { Fragment, useEffect, useState, type MouseEvent } from "react";
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
  ChevronDown,
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

function matchesPath(href: string, pathname: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
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
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    {},
  );

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
    if (!matchesPath(item.href, pathname)) {
      return best;
    }
    return item.href.length > best.length ? item.href : best;
  }, "");

  const activeSectionHref = navItems.find(
    (item) =>
      item.href === activeHref ||
      item.children?.some((child) => child.href === activeHref),
  )?.href;

  useEffect(() => {
    if (activeSectionHref) {
      setOpenSections((prev) =>
        prev[activeSectionHref]
          ? prev
          : { ...prev, [activeSectionHref]: true },
      );
    }
  }, [activeSectionHref]);

  function toggleSection(event: MouseEvent, href: string) {
    event.preventDefault();
    event.stopPropagation();
    setOpenSections((prev) => ({ ...prev, [href]: !prev[href] }));
  }

  function renderFlatLink(item: NavItem) {
    const isActive = item.href === activeHref;
    return (
      <Link
        key={item.href}
        href={item.href}
        title={collapsed ? item.label : undefined}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          collapsed && "justify-center px-0",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <item.icon className="size-4 shrink-0" />
        {collapsed ? null : <span className="truncate">{item.label}</span>}
      </Link>
    );
  }

  return (
    <nav className="flex flex-1 flex-col gap-0.5 p-2">
      {navItems.map((item) => {
        const children = item.children ?? [];
        if (collapsed || children.length === 0) {
          return (
            <Fragment key={item.href}>
              {renderFlatLink(item)}
              {collapsed ? children.map((child) => renderFlatLink(child)) : null}
            </Fragment>
          );
        }
        const isOpen = openSections[item.href] ?? false;
        const isSectionActive = item.href === activeHref;
        const hasActiveChild = children.some(
          (child) => child.href === activeHref,
        );
        return (
          <Fragment key={item.href}>
            <div
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                isSectionActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : hasActiveChild && !isOpen
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Link
                href={item.href}
                aria-current={isSectionActive ? "page" : undefined}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-l-lg px-3 py-2"
              >
                <item.icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
              <button
                type="button"
                onClick={(event) => toggleSection(event, item.href)}
                aria-expanded={isOpen}
                aria-label={item.label}
                className={cn(
                  "mr-1.5 flex size-6 shrink-0 items-center justify-center rounded-md transition-colors",
                  isSectionActive
                    ? "hover:bg-white/20"
                    : "hover:bg-foreground/10",
                )}
              >
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform duration-200",
                    !isOpen && "-rotate-90",
                  )}
                />
              </button>
            </div>
            {isOpen ? (
              <div className="my-0.5 ml-5 flex flex-col gap-0.5 border-l border-border pl-2">
                {children.map((child) => {
                  const isActive = child.href === activeHref;
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "rounded-md px-3 py-1.5 text-sm transition-colors",
                        isActive
                          ? "bg-primary font-medium text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <span className="block truncate">{child.label}</span>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </Fragment>
        );
      })}
    </nav>
  );
}
